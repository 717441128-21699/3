import { Router, type Request, type Response } from 'express'
import { memoryStore } from '../store/memoryStore.js'

const CURRENT_SEASON = {
  id: 'contest_2026_s1',
  name: '2026 春季设计师大赛',
  theme: '机械与魔法的融合',
  description: '本赛季主题为"机械与魔法的融合"，参赛者需要设计一个同时体现精密机械结构与神秘魔法元素的密室作品。',
  startTime: Date.now() - 86400000 * 30,
  endTime: Date.now() + 86400000 * 60,
  status: 'active',
  prizes: [
    { rank: 1, name: '冠军', reward: { coins: 50000, exp: 5000, reputation: 500 } },
    { rank: 2, name: '亚军', reward: { coins: 30000, exp: 3000, reputation: 300 } },
    { rank: 3, name: '季军', reward: { coins: 15000, exp: 1500, reputation: 150 } },
    { rank: 10, name: '十强', reward: { coins: 5000, exp: 500, reputation: 50 } },
  ],
  judges: [
    { id: 'judge1', name: '达芬奇·李', title: '首席机关设计师' },
    { id: 'judge2', name: '梅林·张', title: '魔法创意总监' },
    { id: 'judge3', name: '特斯拉·王', title: '工程技术顾问' },
  ],
  rules: [
    '参赛者须提交原创密室作品',
    '作品必须符合"机械与魔法的融合"主题',
    '作品机关数量不少于 6 个',
    '每位评委将从创意、难度、美观、技术四个维度评分，每项满分 25 分',
  ],
}

const router = Router()

router.get('/current-season', (req: Request, res: Response): void => {
  const entries = memoryStore.getContestEntries(CURRENT_SEASON.id)
  entries.sort((a, b) => b.avgScore - a.avgScore)
  res.status(200).json({
    success: true,
    data: {
      ...CURRENT_SEASON,
      entriesCount: entries.length,
      top3: entries.slice(0, 3),
    },
  })
})

router.get('/entries', (req: Request, res: Response): void => {
  const { contestId = CURRENT_SEASON.id, page = '1', pageSize = '20', contestantId, sortBy = 'avgScore', sortOrder = 'desc' } = req.query
  let entries = memoryStore.getContestEntries(contestId as string)
  if (contestantId) entries = entries.filter((e) => e.contestantId === contestantId)

  const order = sortOrder === 'asc' ? 1 : -1
  entries.sort((a, b) => {
    const av = a[sortBy as keyof typeof a] as number
    const bv = b[sortBy as keyof typeof b] as number
    return (av - bv) * order
  })

  const p = Number(page)
  const ps = Number(pageSize)
  const start = (p - 1) * ps
  const paginated = entries.slice(start, start + ps)

  const ranked = paginated.map((e, idx) => ({
    ...e,
    rank: start + idx + 1,
  }))

  res.status(200).json({
    success: true,
    data: {
      contestId,
      total: entries.length,
      page: p,
      pageSize: ps,
      items: ranked,
    },
  })
})

router.get('/entries/:id', (req: Request, res: Response): void => {
  const entries = memoryStore.getContestEntries()
  const entry = entries.find((e) => e.id === req.params.id)
  if (!entry) {
    res.status(404).json({ success: false, error: '参赛作品不存在' })
    return
  }
  const chamber = memoryStore.getChamberById(entry.chamberId)
  const contestant = memoryStore.getUserById(entry.contestantId)
  res.status(200).json({
    success: true,
    data: {
      entry,
      chamber,
      contestant: contestant ? { id: contestant.id, username: contestant.username, level: contestant.level } : null,
    },
  })
})

router.post('/entries', (req: Request, res: Response): void => {
  const { contestId = CURRENT_SEASON.id, chamberId, contestantId } = req.body
  if (!chamberId || !contestantId) {
    res.status(400).json({ success: false, error: '缺少必要参数 chamberId 或 contestantId' })
    return
  }
  const chamber = memoryStore.getChamberById(chamberId)
  if (!chamber) {
    res.status(404).json({ success: false, error: '密室不存在' })
    return
  }
  const contestant = memoryStore.getUserById(contestantId)
  if (!contestant) {
    res.status(404).json({ success: false, error: '参赛者不存在' })
    return
  }
  if (chamber.ownerId !== contestantId) {
    res.status(403).json({ success: false, error: '只能提交自己的密室作品' })
    return
  }
  if (chamber.mechanisms.length < 6) {
    res.status(400).json({ success: false, error: '参赛作品机关数量不少于 6 个' })
    return
  }
  const existing = memoryStore.getContestEntries(contestId).find((e) => e.contestantId === contestantId)
  if (existing) {
    res.status(409).json({ success: false, error: '本赛季已提交过作品，每位参赛者仅可提交一件' })
    return
  }
  const entry = memoryStore.addContestEntry({
    chamberId,
    contestantId,
    contestId,
    scores: [],
  })
  res.status(201).json({ success: true, data: entry })
})

router.post('/entries/:id/score', (req: Request, res: Response): void => {
  const { judgeId, score, comment } = req.body
  if (!judgeId || score === undefined) {
    res.status(400).json({ success: false, error: '缺少必要参数 judgeId 或 score' })
    return
  }
  if (score < 0 || score > 100) {
    res.status(400).json({ success: false, error: '评分必须在 0-100 之间' })
    return
  }
  const validJudge = CURRENT_SEASON.judges.find((j) => j.id === judgeId)
  if (!validJudge) {
    res.status(403).json({ success: false, error: '非法评委身份' })
    return
  }
  const entry = memoryStore.scoreContestEntry(req.params.id, judgeId, score, comment)
  if (!entry) {
    res.status(404).json({ success: false, error: '参赛作品不存在' })
    return
  }
  res.status(200).json({ success: true, data: entry })
})

export default router
