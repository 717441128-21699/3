import type { GameSession, PlayerState, Chamber } from '../store/memoryStore.js'

export interface ScoreBreakdown {
  totalScore: number
  timeScore: number
  puzzleScore: number
  survivalScore: number
  collaborationScore: number
  difficultyBonus: number
  details: {
    timeRemainingRatio: number
    puzzleCompletion: number
    deaths: number
    injuries: number
    teamSize: number
    playerContributions: Record<string, { solvedPuzzles: number; injuriesAvoided: number }>
  }
}

export interface ScoreInput {
  timeLimit: number
  timeRemaining: number
  puzzleProgress: number
  players: PlayerState[]
  chamberDifficulty?: number
  playerActions?: Array<{ userId: string; solvedPuzzles: number; injuriesAvoided: number }>
}

const MAX_SCORE = 1000
const TIME_WEIGHT = 0.30
const PUZZLE_WEIGHT = 0.30
const SURVIVAL_WEIGHT = 0.25
const COLLABORATION_WEIGHT = 0.15

function calculateTimeScore(timeLimit: number, timeRemaining: number): { score: number; ratio: number } {
  const elapsed = Math.max(0, timeLimit - timeRemaining)
  const ratio = timeLimit > 0 ? timeRemaining / timeLimit : 0
  const safeRatio = Math.max(0, Math.min(1, ratio))

  const baseScore = safeRatio * (MAX_SCORE * TIME_WEIGHT)
  const speedBonus = safeRatio > 0.5 ? (safeRatio - 0.5) * 2 * (MAX_SCORE * TIME_WEIGHT * 0.3) : 0

  return {
    score: Math.round(baseScore + speedBonus),
    ratio: Math.round(safeRatio * 1000) / 1000,
  }
}

function calculatePuzzleScore(puzzleProgress: number): number {
  const safeProgress = Math.max(0, Math.min(1, puzzleProgress))
  return Math.round(safeProgress * MAX_SCORE * PUZZLE_WEIGHT)
}

function calculateSurvivalScore(players: PlayerState[]): { score: number; deaths: number; injuries: number } {
  if (players.length === 0) {
    return { score: 0, deaths: 0, injuries: 0 }
  }

  const baseSurvivalScore = MAX_SCORE * SURVIVAL_WEIGHT
  let deaths = 0
  let totalInjuries = 0

  for (const p of players) {
    totalInjuries += p.injuries
    if (!p.isAlive || p.hp <= 0) {
      deaths++
    }
  }

  const aliveRatio = 1 - deaths / players.length
  const injuryPenalty = Math.min(1, totalInjuries / (players.length * 5)) * 0.4
  const deathPenalty = deaths > 0 ? 0.2 + deaths * 0.15 : 0

  const score = Math.round(baseSurvivalScore * aliveRatio * (1 - injuryPenalty - deathPenalty))
  const safeScore = Math.max(0, score)

  return { score: safeScore, deaths, injuries: totalInjuries }
}

function calculateCollaborationScore(
  players: PlayerState[],
  playerActions?: Array<{ userId: string; solvedPuzzles: number; injuriesAvoided: number }>
): { score: number; teamSize: number; contributions: Record<string, { solvedPuzzles: number; injuriesAvoided: number }> } {
  const teamSize = players.length
  const baseScore = MAX_SCORE * COLLABORATION_WEIGHT
  const contributions: Record<string, { solvedPuzzles: number; injuriesAvoided: number }> = {}

  for (const p of players) {
    contributions[p.userId] = { solvedPuzzles: 0, injuriesAvoided: 0 }
  }

  if (playerActions) {
    for (const action of playerActions) {
      if (contributions[action.userId]) {
        contributions[action.userId] = {
          solvedPuzzles: action.solvedPuzzles,
          injuriesAvoided: action.injuriesAvoided,
        }
      }
    }
  }

  if (teamSize <= 1) {
    return { score: Math.round(baseScore * 0.6), teamSize, contributions }
  }

  const activePlayers = Object.values(contributions).filter(
    (c) => c.solvedPuzzles > 0 || c.injuriesAvoided > 0
  ).length
  const participationRatio = activePlayers / teamSize

  const totalSolved = Object.values(contributions).reduce((sum, c) => sum + c.solvedPuzzles, 0)
  const avgSolved = totalSolved / teamSize
  let spreadPenalty = 0
  if (totalSolved > 0) {
    const variance = Object.values(contributions).reduce(
      (sum, c) => sum + Math.pow(c.solvedPuzzles - avgSolved, 2),
      0
    ) / teamSize
    spreadPenalty = Math.min(0.3, variance * 0.1)
  }

  const teamSizeBonus = Math.min(1, (teamSize - 1) * 0.1)
  const score = Math.round(baseScore * (0.5 + participationRatio * 0.5) * (1 + teamSizeBonus) * (1 - spreadPenalty))

  return { score, teamSize, contributions }
}

export function calculateScore(input: ScoreInput): ScoreBreakdown {
  const { timeLimit, timeRemaining, puzzleProgress, players, chamberDifficulty = 1, playerActions } = input

  const timeResult = calculateTimeScore(timeLimit, timeRemaining)
  const puzzleScore = calculatePuzzleScore(puzzleProgress)
  const survivalResult = calculateSurvivalScore(players)
  const collaborationResult = calculateCollaborationScore(players, playerActions)

  const baseTotal = timeResult.score + puzzleScore + survivalResult.score + collaborationResult.score
  const difficultyMultiplier = 1 + (Math.max(1, Math.min(10, chamberDifficulty)) - 1) * 0.05
  const difficultyBonus = Math.round(baseTotal * (difficultyMultiplier - 1))
  const totalScore = Math.round(baseTotal + difficultyBonus)

  const safeTotal = Math.max(0, Math.min(Math.round(MAX_SCORE * difficultyMultiplier), totalScore))

  return {
    totalScore: safeTotal,
    timeScore: timeResult.score,
    puzzleScore,
    survivalScore: survivalResult.score,
    collaborationScore: collaborationResult.score,
    difficultyBonus,
    details: {
      timeRemainingRatio: timeResult.ratio,
      puzzleCompletion: Math.max(0, Math.min(1, puzzleProgress)),
      deaths: survivalResult.deaths,
      injuries: survivalResult.injuries,
      teamSize: collaborationResult.teamSize,
      playerContributions: collaborationResult.contributions,
    },
  }
}

export function calculateSessionScore(session: GameSession, chamber?: Chamber): ScoreBreakdown {
  const timeLimit = chamber?.timeLimit ?? session.timeRemaining
  return calculateScore({
    timeLimit,
    timeRemaining: session.timeRemaining,
    puzzleProgress: session.puzzleProgress,
    players: session.players,
    chamberDifficulty: chamber?.difficulty,
  })
}

export function scoreToGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 950) return 'S'
  if (score >= 800) return 'A'
  if (score >= 650) return 'B'
  if (score >= 500) return 'C'
  if (score >= 300) return 'D'
  return 'F'
}

export function scoreToExp(score: number, difficulty: number = 1): number {
  const baseExp = Math.round(score * 0.5)
  const difficultyBonus = Math.round(baseExp * (difficulty - 1) * 0.1)
  return Math.max(10, baseExp + difficultyBonus)
}

export function scoreToCoins(score: number, difficulty: number = 1): number {
  const baseCoins = Math.round(score * 0.8)
  const difficultyBonus = Math.round(baseCoins * (difficulty - 1) * 0.15)
  return Math.max(20, baseCoins + difficultyBonus)
}

export function scoreToReputation(score: number): number {
  if (score >= 800) return 15
  if (score >= 600) return 10
  if (score >= 400) return 5
  if (score >= 200) return 2
  return 0
}

export default {
  calculateScore,
  calculateSessionScore,
  scoreToGrade,
  scoreToExp,
  scoreToCoins,
  scoreToReputation,
}
