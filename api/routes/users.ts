import { Router, type Request, type Response } from 'express'
import { memoryStore } from '../store/memoryStore.js'
import type { InventoryItem } from '../store/memoryStore.js'

const router = Router()

router.post('/register', (req: Request, res: Response): void => {
  const { username } = req.body
  if (!username) {
    res.status(400).json({ success: false, error: '用户名不能为空' })
    return
  }
  const exists = memoryStore.getUsers().find((u) => u.username === username)
  if (exists) {
    res.status(409).json({ success: false, error: '用户名已存在' })
    return
  }
  const newUser = memoryStore.addUser({
    username,
    level: 1,
    exp: 0,
    stamina: 100,
    reputation: 0,
    coins: 1000,
    inventory: [],
  })
  res.status(201).json({
    success: true,
    data: { user: newUser, token: `token_${newUser.id}_${Date.now()}` },
  })
})

router.post('/login', (req: Request, res: Response): void => {
  const { username } = req.body
  if (!username) {
    res.status(400).json({ success: false, error: '用户名不能为空' })
    return
  }
  const user = memoryStore.getUsers().find((u) => u.username === username)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  res.status(200).json({
    success: true,
    data: { user, token: `token_${user.id}_${Date.now()}` },
  })
})

router.post('/logout', (req: Request, res: Response): void => {
  res.status(200).json({ success: true, data: { message: '登出成功' } })
})

router.get('/:id', (req: Request, res: Response): void => {
  const user = memoryStore.getUserById(req.params.id)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  res.status(200).json({ success: true, data: user })
})

router.patch('/:id', (req: Request, res: Response): void => {
  const user = memoryStore.getUserById(req.params.id)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  const { username, stamina } = req.body
  if (username !== undefined) user.username = username
  if (stamina !== undefined) user.stamina = stamina
  res.status(200).json({ success: true, data: user })
})

router.get('/:id/inventory', (req: Request, res: Response): void => {
  const user = memoryStore.getUserById(req.params.id)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  const { type, rarity } = req.query
  let items = [...user.inventory]
  if (type) items = items.filter((i) => i.type === type)
  if (rarity) items = items.filter((i) => i.rarity === rarity)
  res.status(200).json({ success: true, data: { total: items.length, items } })
})

router.post('/:id/inventory', (req: Request, res: Response): void => {
  const user = memoryStore.getUserById(req.params.id)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  const { type, itemId, quantity, rarity } = req.body
  if (!type || !itemId || !quantity || !rarity) {
    res.status(400).json({ success: false, error: '缺少必要参数' })
    return
  }
  const existing = user.inventory.find((i) => i.itemId === itemId && i.type === type)
  if (existing) {
    existing.quantity += quantity
    res.status(200).json({ success: true, data: existing })
  } else {
    const newItem: InventoryItem = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      itemId,
      quantity,
      rarity,
    }
    user.inventory.push(newItem)
    res.status(201).json({ success: true, data: newItem })
  }
})

router.delete('/:id/inventory/:itemId', (req: Request, res: Response): void => {
  const user = memoryStore.getUserById(req.params.id)
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' })
    return
  }
  const idx = user.inventory.findIndex((i) => i.id === req.params.itemId)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '物品不存在' })
    return
  }
  const { quantity } = req.body
  if (quantity && quantity < user.inventory[idx].quantity) {
    user.inventory[idx].quantity -= quantity
    res.status(200).json({ success: true, data: user.inventory[idx] })
  } else {
    const removed = user.inventory.splice(idx, 1)[0]
    res.status(200).json({ success: true, data: removed })
  }
})

export default router
