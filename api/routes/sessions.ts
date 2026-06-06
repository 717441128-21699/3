import { Router, type Request, type Response } from 'express'
import { memoryStore } from '../store/memoryStore.js'
import { calculateSessionScore, scoreToGrade, scoreToExp, scoreToCoins, scoreToReputation } from '../engines/scoreEngine.js'
import { generateRandomEvent, shouldTriggerEvent } from '../engines/eventEngine.js'
import type { PlayerState } from '../store/memoryStore.js'

const router = Router()

router.post('/', (req: Request, res: Response): void => {
  const { chamberId, playerIds = [] } = req.body
  if (!chamberId || playerIds.length === 0) {
    res.status(400).json({ success: false, error: '缺少必要参数 chamberId 或 playerIds' })
    return
  }
  const chamber = memoryStore.getChamberById(chamberId)
  if (!chamber) {
    res.status(404).json({ success: false, error: '密室不存在' })
    return
  }
  const players: PlayerState[] = playerIds.map((pid: string, idx: number) => ({
    userId: pid,
    x: 1,
    y: 1 + idx,
    hp: 100,
    injuries: 0,
    isAlive: true,
  }))
  const session = memoryStore.addSession({
    chamberId,
    players,
    startTime: Date.now(),
    timeRemaining: chamber.timeLimit,
    puzzleProgress: 0,
    injuries: 0,
    events: [],
    status: 'playing',
  })
  res.status(201).json({ success: true, data: session })
})

router.get('/:id', (req: Request, res: Response): void => {
  const session = memoryStore.getSessionById(req.params.id)
  if (!session) {
    res.status(404).json({ success: false, error: '会话不存在' })
    return
  }
  res.status(200).json({ success: true, data: session })
})

router.post('/:id/poll-event', (req: Request, res: Response): void => {
  const session = memoryStore.getSessionById(req.params.id)
  if (!session) {
    res.status(404).json({ success: false, error: '会话不存在' })
    return
  }
  if (session.status !== 'playing') {
    res.status(400).json({ success: false, error: '会话已结束' })
    return
  }
  const chamber = memoryStore.getChamberById(session.chamberId)
  const lastEventTime = session.events.length > 0
    ? session.events[session.events.length - 1].triggeredAt
    : session.startTime
  const activeEvents = session.events.filter((e) => !e.resolved)
  if (shouldTriggerEvent(activeEvents, lastEventTime)) {
    const generated = generateRandomEvent({
      mechanisms: chamber?.mechanisms ?? [],
      gridWidth: chamber?.gridWidth,
      gridHeight: chamber?.gridHeight,
    })
    const updated = memoryStore.updateSession(session.id, {
      events: [...session.events, generated.event],
    })
    res.status(200).json({ success: true, data: { triggered: true, event: generated.event, effect: generated.effect, session: updated } })
  } else {
    res.status(200).json({ success: true, data: { triggered: false, event: null, effect: null } })
  }
})

router.patch('/:id', (req: Request, res: Response): void => {
  const session = memoryStore.getSessionById(req.params.id)
  if (!session) {
    res.status(404).json({ success: false, error: '会话不存在' })
    return
  }
  const { timeRemaining, puzzleProgress, players, injuries } = req.body
  const updated = memoryStore.updateSession(session.id, {
    timeRemaining: timeRemaining ?? session.timeRemaining,
    puzzleProgress: puzzleProgress ?? session.puzzleProgress,
    players: players ?? session.players,
    injuries: injuries ?? session.injuries,
  })
  res.status(200).json({ success: true, data: updated })
})

router.post('/:id/end', (req: Request, res: Response): void => {
  const session = memoryStore.getSessionById(req.params.id)
  if (!session) {
    res.status(404).json({ success: false, error: '会话不存在' })
    return
  }
  const { won } = req.body
  const chamber = memoryStore.getChamberById(session.chamberId)
  const scoreBreakdown = calculateSessionScore(session, chamber)
  const grade = scoreToGrade(scoreBreakdown.totalScore)
  const difficulty = chamber?.difficulty ?? 1
  const exp = won ? scoreToExp(scoreBreakdown.totalScore, difficulty) : 0
  const coins = won ? scoreToCoins(scoreBreakdown.totalScore, difficulty) : Math.floor(scoreToCoins(scoreBreakdown.totalScore, difficulty) * 0.3)
  const reputation = scoreToReputation(scoreBreakdown.totalScore)
  memoryStore.updateSession(session.id, { status: won ? 'won' : 'lost' })
  if (chamber) {
    memoryStore.updateChamberStats(chamber.id, won, scoreBreakdown.totalScore)
  }
  session.players.forEach((p) => {
    const user = memoryStore.getUserById(p.userId)
    if (user) {
      user.exp += exp
      user.coins += coins
      user.reputation += reputation
      while (user.exp >= user.level * 500) {
        user.exp -= user.level * 500
        user.level += 1
      }
    }
  })
  res.status(200).json({
    success: true,
    data: {
      sessionId: session.id,
      won,
      score: scoreBreakdown,
      grade,
      rewards: { exp, coins, reputation },
    },
  })
})

router.get('/:id/result', (req: Request, res: Response): void => {
  const session = memoryStore.getSessionById(req.params.id)
  if (!session) {
    res.status(404).json({ success: false, error: '会话不存在' })
    return
  }
  if (session.status === 'playing') {
    res.status(400).json({ success: false, error: '会话尚未结束' })
    return
  }
  const chamber = memoryStore.getChamberById(session.chamberId)
  const scoreBreakdown = calculateSessionScore(session, chamber)
  res.status(200).json({
    success: true,
    data: {
      session,
      chamber,
      score: scoreBreakdown,
      grade: scoreToGrade(scoreBreakdown.totalScore),
    },
  })
})

export default router
