import { Router, type Request, type Response } from 'express'
import { memoryStore } from '../store/memoryStore.js'
import { calculateDifficulty, calculateChamberDifficulty, difficultyToStars, difficultyToLabel, getSuggestedMinLevel } from '../engines/difficultyEngine.js'
import type { Chamber } from '../store/memoryStore.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { page = '1', pageSize = '20', difficulty, minLevel, sortBy = 'createdAt', sortOrder = 'desc', keyword } = req.query
  let chambers = memoryStore.getChambers()

  if (difficulty) {
    const target = Number(difficulty)
    chambers = chambers.filter((c) => Math.abs(c.difficulty - target) <= 1)
  }
  if (minLevel) {
    chambers = chambers.filter((c) => c.minLevel <= Number(minLevel))
  }
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    chambers = chambers.filter((c) => c.name.toLowerCase().includes(kw) || c.description.toLowerCase().includes(kw))
  }

  const order = sortOrder === 'asc' ? 1 : -1
  chambers.sort((a, b) => {
    const av = a[sortBy as keyof Chamber] as number
    const bv = b[sortBy as keyof Chamber] as number
    return (av - bv) * order
  })

  const p = Number(page)
  const ps = Number(pageSize)
  const start = (p - 1) * ps
  const paginated = chambers.slice(start, start + ps)

  res.status(200).json({
    success: true,
    data: {
      total: chambers.length,
      page: p,
      pageSize: ps,
      items: paginated,
    },
  })
})

router.get('/:id', (req: Request, res: Response): void => {
  const chamber = memoryStore.getChamberById(req.params.id)
  if (!chamber) {
    res.status(404).json({ success: false, error: '密室不存在' })
    return
  }
  res.status(200).json({ success: true, data: chamber })
})

router.post('/', (req: Request, res: Response): void => {
  const { ownerId, name, description, gridWidth = 16, gridHeight = 12, mechanisms = [], maxPlayers = 4, timeLimit = 600 } = req.body
  if (!ownerId || !name) {
    res.status(400).json({ success: false, error: '缺少必要参数 ownerId 或 name' })
    return
  }
  const difficultyResult = calculateDifficulty(mechanisms, gridWidth, gridHeight)
  const newChamber = memoryStore.addChamber({
    ownerId,
    name,
    description: description ?? '',
    gridWidth,
    gridHeight,
    mechanisms,
    difficulty: difficultyResult.difficulty,
    minLevel: getSuggestedMinLevel(difficultyResult.difficulty),
    maxPlayers,
    timeLimit,
  })
  res.status(201).json({
    success: true,
    data: {
      ...newChamber,
      difficultyBreakdown: difficultyResult,
    },
  })
})

router.put('/:id', (req: Request, res: Response): void => {
  const chamber = memoryStore.getChamberById(req.params.id)
  if (!chamber) {
    res.status(404).json({ success: false, error: '密室不存在' })
    return
  }
  const { name, description, gridWidth, gridHeight, mechanisms, maxPlayers, timeLimit } = req.body
  let updatedMechanisms = chamber.mechanisms
  let updatedWidth = chamber.gridWidth
  let updatedHeight = chamber.gridHeight
  if (mechanisms !== undefined) updatedMechanisms = mechanisms
  if (gridWidth !== undefined) updatedWidth = gridWidth
  if (gridHeight !== undefined) updatedHeight = gridHeight

  const difficultyResult = calculateDifficulty(updatedMechanisms, updatedWidth, updatedHeight)
  const updated = {
    ...chamber,
    name: name ?? chamber.name,
    description: description ?? chamber.description,
    gridWidth: updatedWidth,
    gridHeight: updatedHeight,
    mechanisms: updatedMechanisms,
    difficulty: difficultyResult.difficulty,
    minLevel: getSuggestedMinLevel(difficultyResult.difficulty),
    maxPlayers: maxPlayers ?? chamber.maxPlayers,
    timeLimit: timeLimit ?? chamber.timeLimit,
  }
  const idx = (memoryStore as any).data.chambers.findIndex((c: Chamber) => c.id === req.params.id)
  ;(memoryStore as any).data.chambers[idx] = updated

  res.status(200).json({
    success: true,
    data: {
      ...updated,
      difficultyBreakdown: difficultyResult,
    },
  })
})

router.delete('/:id', (req: Request, res: Response): void => {
  const idx = (memoryStore as any).data.chambers.findIndex((c: Chamber) => c.id === req.params.id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '密室不存在' })
    return
  }
  ;(memoryStore as any).data.chambers.splice(idx, 1)
  res.status(200).json({ success: true, data: { id: req.params.id } })
})

router.post('/calculate-difficulty', (req: Request, res: Response): void => {
  const { mechanisms = [], gridWidth, gridHeight } = req.body
  const result = calculateDifficulty(mechanisms, gridWidth, gridHeight)
  res.status(200).json({
    success: true,
    data: {
      ...result,
      stars: difficultyToStars(result.difficulty),
      label: difficultyToLabel(result.difficulty),
      suggestedMinLevel: getSuggestedMinLevel(result.difficulty),
    },
  })
})

router.get('/:id/difficulty', (req: Request, res: Response): void => {
  const chamber = memoryStore.getChamberById(req.params.id)
  if (!chamber) {
    res.status(404).json({ success: false, error: '密室不存在' })
    return
  }
  const result = calculateChamberDifficulty(chamber)
  res.status(200).json({
    success: true,
    data: {
      ...result,
      stars: difficultyToStars(result.difficulty),
      label: difficultyToLabel(result.difficulty),
    },
  })
})

export default router
