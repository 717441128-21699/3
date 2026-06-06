import { Router, type Request, type Response } from 'express'
import { memoryStore } from '../store/memoryStore.js'
import type { RankingCategory } from '../store/memoryStore.js'

const router = Router()

router.get('/', (req: Request, res: Response): void => {
  const { category, week } = req.query
  if (!category) {
    res.status(400).json({ success: false, error: '必须指定 category 参数 (clearRate | score | creativity)' })
    return
  }
  const rankings = memoryStore.getRankings(category as RankingCategory, week as string)
  rankings.sort((a, b) => a.rank - b.rank)
  res.status(200).json({
    success: true,
    data: {
      category,
      week: week ?? new Date().toISOString().slice(0, 10),
      items: rankings,
    },
  })
})

router.get('/summary', (req: Request, res: Response): void => {
  const week = (req.query.week as string) ?? new Date().toISOString().slice(0, 10)
  const categories: RankingCategory[] = ['clearRate', 'score', 'creativity']
  const summary: Record<string, any> = {}
  for (const cat of categories) {
    const list = memoryStore.getRankings(cat, week)
    list.sort((a, b) => a.rank - b.rank)
    summary[cat] = {
      top3: list.slice(0, 3),
      total: list.length,
    }
  }
  res.status(200).json({
    success: true,
    data: { week, summary },
  })
})

router.get('/export/pdf', (req: Request, res: Response): void => {
  const week = (req.query.week as string) ?? new Date().toISOString().slice(0, 10)
  const categories: RankingCategory[] = ['clearRate', 'score', 'creativity']
  const allRankings: Record<string, any[]> = {}
  for (const cat of categories) {
    const list = memoryStore.getRankings(cat, week)
    list.sort((a, b) => a.rank - b.rank)
    allRankings[cat] = list
  }
  const scoreRankings = allRankings.score
  const topPlayer = scoreRankings.length > 0 ? scoreRankings[0] : null
  const totalParticipants = new Set([...allRankings.clearRate.map(r => r.userId), ...allRankings.score.map(r => r.userId), ...allRankings.creativity.map(r => r.userId)]).size

  const mockReport = {
    documentType: 'RankingWeeklyReport',
    title: `密室游戏周排行榜报告 - ${week}`,
    generatedAt: new Date().toISOString(),
    metadata: {
      week,
      totalParticipants,
      totalRankings: Object.values(allRankings).reduce((sum, arr) => sum + arr.length, 0),
    },
    summary: {
      champion: topPlayer ? {
        userId: topPlayer.userId,
        username: topPlayer.username,
        category: 'score',
        value: topPlayer.value,
      } : null,
      highlights: [
        {
          title: '本周最高分',
          description: topPlayer ? `${topPlayer.username} 以 ${topPlayer.value} 分夺得分榜冠军！` : '暂无数据',
        },
        {
          title: '通关之王',
          description: allRankings.clearRate.length > 0 ? `${allRankings.clearRate[0].username} 通关率 ${(allRankings.clearRate[0].value * 100).toFixed(1)}%` : '暂无数据',
        },
        {
          title: '创意大师',
          description: allRankings.creativity.length > 0 ? `${allRankings.creativity[0].username} 创意评分 ${allRankings.creativity[0].value}` : '暂无数据',
        },
      ],
    },
    rankings: allRankings,
    charts: {
      scoreDistribution: [
        { range: '900-1000', count: scoreRankings.filter(r => r.value >= 900).length },
        { range: '700-899', count: scoreRankings.filter(r => r.value >= 700 && r.value < 900).length },
        { range: '500-699', count: scoreRankings.filter(r => r.value >= 500 && r.value < 700).length },
        { range: '300-499', count: scoreRankings.filter(r => r.value >= 300 && r.value < 500).length },
        { range: '0-299', count: scoreRankings.filter(r => r.value < 300).length },
      ],
      categoryComparison: categories.map(cat => ({
        category: cat,
        participants: allRankings[cat].length,
        average: allRankings[cat].length > 0
          ? allRankings[cat].reduce((sum, r) => sum + r.value, 0) / allRankings[cat].length
          : 0,
      })),
    },
    recommendedNextWeek: {
      goals: [
        '参与3次不同密室挑战，提升通关率排名',
        '尝试更高难度密室，冲击分数榜',
        '分享自创密室，争取创意评分',
      ],
      events: [
        { name: '周末双倍经验活动', date: `${week} 周六 20:00` },
        { name: '设计师之夜-创意密室大赛', date: `${week} 周日 19:00` },
      ],
    },
  }

  res.status(200).json({
    success: true,
    data: {
      format: 'application/pdf',
      filename: `ranking-report-${week}.pdf`,
      report: mockReport,
    },
  })
})

export default router
