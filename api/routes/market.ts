import { Router, type Request, type Response } from 'express'
import { memoryStore } from '../store/memoryStore.js'
import { suggestPrice, isPriceReasonable, calculateSaleTax } from '../engines/pricingEngine.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { page = '1', pageSize = '20', itemType, rarity, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', sellerId } = req.query
  let listings = memoryStore.getListings()

  if (itemType) listings = listings.filter((l) => l.itemType === itemType)
  if (rarity) listings = listings.filter((l) => l.rarity === rarity)
  if (sellerId) listings = listings.filter((l) => l.sellerId === sellerId)
  if (minPrice) listings = listings.filter((l) => l.price >= Number(minPrice))
  if (maxPrice) listings = listings.filter((l) => l.price <= Number(maxPrice))

  const order = sortOrder === 'asc' ? 1 : -1
  listings.sort((a, b) => {
    const av = a[sortBy as keyof typeof a] as number
    const bv = b[sortBy as keyof typeof b] as number
    return (av - bv) * order
  })

  const p = Number(page)
  const ps = Number(pageSize)
  const start = (p - 1) * ps
  const paginated = listings.slice(start, start + ps)

  res.status(200).json({
    success: true,
    data: {
      total: listings.length,
      page: p,
      pageSize: ps,
      items: paginated,
    },
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const listing = memoryStore.getListingById(req.params.id)
  if (!listing) {
    res.status(404).json({ success: false, error: '商品不存在' })
    return
  }
  res.status(200).json({ success: true, data: listing })
})

router.get('/suggest-price', (req: Request, res: Response): void => {
  const { itemId, itemType, rarity } = req.query
  if (!itemId || !itemType || !rarity) {
    res.status(400).json({ success: false, error: '缺少必要参数 itemId, itemType, rarity' })
    return
  }
  const transactions = memoryStore.getTransactions()
  const suggestion = suggestPrice(
    String(itemId),
    itemType as 'blueprint' | 'material',
    rarity as any,
    transactions,
  )
  res.status(200).json({ success: true, data: suggestion })
})

router.post('/', (req: Request, res: Response): void => {
  const { sellerId, itemType, itemId, itemName, rarity, price } = req.body
  if (!sellerId || !itemType || !itemId || !rarity || price === undefined) {
    res.status(400).json({ success: false, error: '缺少必要参数' })
    return
  }
  const seller = memoryStore.getUserById(sellerId)
  if (!seller) {
    res.status(404).json({ success: false, error: '卖家不存在' })
    return
  }
  const inventoryItem = seller.inventory.find((i) => i.itemId === itemId && i.type === itemType)
  if (!inventoryItem || inventoryItem.quantity <= 0) {
    res.status(400).json({ success: false, error: '库存不足' })
    return
  }
  const transactions = memoryStore.getTransactions()
  const suggestion = suggestPrice(itemId, itemType, rarity, transactions)
  const priceCheck = isPriceReasonable(price, suggestion)
  if (!priceCheck.reasonable && price > suggestion.max * 2) {
    res.status(400).json({ success: false, error: priceCheck.reason, suggestion })
    return
  }
  inventoryItem.quantity -= 1
  if (inventoryItem.quantity <= 0) {
    const idx = seller.inventory.findIndex((i) => i.id === inventoryItem.id)
    seller.inventory.splice(idx, 1)
  }
  const listing = memoryStore.addListing({
    sellerId,
    itemType,
    itemId,
    itemName,
    rarity,
    price,
    suggestedPrice: { min: suggestion.min, max: suggestion.max, avg: suggestion.avg },
  })
  res.status(201).json({
    success: true,
    data: { listing, suggestion, priceWarning: priceCheck.reason ?? null },
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const { sellerId } = req.body
  const listing = memoryStore.getListingById(req.params.id)
  if (!listing) {
    res.status(404).json({ success: false, error: '商品不存在' })
    return
  }
  if (sellerId && listing.sellerId !== sellerId) {
    res.status(403).json({ success: false, error: '无权下架此商品' })
    return
  }
  const seller = memoryStore.getUserById(listing.sellerId)
  if (seller) {
    const existing = seller.inventory.find((i) => i.itemId === listing.itemId && i.type === listing.itemType)
    if (existing) {
      existing.quantity += 1
    } else {
      seller.inventory.push({
        id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type: listing.itemType,
        itemId: listing.itemId,
        quantity: 1,
        rarity: listing.rarity,
      })
    }
  }
  const removed = memoryStore.removeListing(req.params.id)
  if (!removed) {
    res.status(404).json({ success: false, error: '商品不存在' })
    return
  }
  res.status(200).json({ success: true, data: { id: req.params.id } })
})

router.post('/:id/purchase', (req: Request, res: Response): void => {
  const { buyerId } = req.body
  const listing = memoryStore.getListingById(req.params.id)
  if (!listing) {
    res.status(404).json({ success: false, error: '商品不存在' })
    return
  }
  if (listing.sellerId === buyerId) {
    res.status(400).json({ success: false, error: '不能购买自己的商品' })
    return
  }
  const buyer = memoryStore.getUserById(buyerId)
  if (!buyer) {
    res.status(404).json({ success: false, error: '买家不存在' })
    return
  }
  const tax = calculateSaleTax(listing.price, listing.rarity)
  const totalCost = listing.price
  if (buyer.coins < totalCost) {
    res.status(400).json({ success: false, error: '金币不足' })
    return
  }
  buyer.coins -= totalCost
  const existing = buyer.inventory.find((i) => i.itemId === listing.itemId && i.type === listing.itemType)
  if (existing) {
    existing.quantity += 1
  } else {
    buyer.inventory.push({
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: listing.itemType,
      itemId: listing.itemId,
      quantity: 1,
      rarity: listing.rarity,
    })
  }
  const seller = memoryStore.getUserById(listing.sellerId)
  if (seller) {
    seller.coins += listing.price - tax
  }
  const transaction = memoryStore.addTransaction({
    listingId: listing.id,
    buyerId,
    sellerId: listing.sellerId,
    price: listing.price,
    itemId: listing.itemId,
  })
  memoryStore.removeListing(req.params.id)
  res.status(200).json({
    success: true,
    data: {
      transaction,
      tax,
      buyerRemaining: buyer.coins,
      sellerEarned: listing.price - tax,
    },
  })
})

export default router
