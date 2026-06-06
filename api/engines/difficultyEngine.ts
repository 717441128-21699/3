import type { Mechanism, Chamber } from '../store/memoryStore.js'

export interface DifficultyBreakdown {
  mechanismCount: number
  mechanismWeightedScore: number
  linkComplexity: number
  puzzleCount: number
  puzzleScore: number
  rawScore: number
  difficulty: number
  details: {
    mechanismTypeBreakdown: Record<string, { count: number; weight: number }>
    linkedGroups: number
    maxChainDepth: number
  }
}

const MECHANISM_WEIGHTS: Record<string, number> = {
  laser: 1.8,
  trap: 1.2,
  puzzle: 2.5,
  door: 0.8,
  chest: 1.0,
  sensor: 1.5,
}

const BASE_SCORE = 0
const MIN_DIFFICULTY = 1
const MAX_DIFFICULTY = 10

function countByType(mechanisms: Mechanism[]): Record<string, number> {
  return mechanisms.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function calculateMechanismScore(mechanisms: Mechanism[]): { score: number; breakdown: Record<string, { count: number; weight: number }> } {
  const typeCounts = countByType(mechanisms)
  const breakdown: Record<string, { count: number; weight: number }> = {}
  let score = 0

  for (const [type, count] of Object.entries(typeCounts)) {
    const weight = MECHANISM_WEIGHTS[type] || 1.0
    breakdown[type] = { count, weight }
    score += count * weight
  }

  return { score, breakdown }
}

function calculateLinkComplexity(mechanisms: Mechanism[]): { complexity: number; linkedGroups: number; maxChainDepth: number } {
  const idToMechanism = new Map(mechanisms.map((m) => [m.id, m]))
  const visited = new Set<string>()
  let linkedGroups = 0
  let maxChainDepth = 0

  function traverseChain(id: string, depth: number, path: Set<string>): number {
    if (path.has(id)) return depth
    path.add(id)
    visited.add(id)

    const mech = idToMechanism.get(id)
    if (!mech?.linkedTo || mech.linkedTo.length === 0) {
      return depth
    }

    let maxDepth = depth
    for (const nextId of mech.linkedTo) {
      if (!path.has(nextId)) {
        maxDepth = Math.max(maxDepth, traverseChain(nextId, depth + 1, path))
      }
    }
    return maxDepth
  }

  for (const m of mechanisms) {
    if (visited.has(m.id)) continue
    const hasLinks = (m.linkedTo && m.linkedTo.length > 0) ||
      mechanisms.some((other) => other.linkedTo?.includes(m.id))

    if (hasLinks) {
      linkedGroups++
      const depth = traverseChain(m.id, 1, new Set())
      maxChainDepth = Math.max(maxChainDepth, depth)
    } else {
      visited.add(m.id)
    }
  }

  const complexity = linkedGroups * 0.5 + maxChainDepth * 0.8
  return { complexity, linkedGroups, maxChainDepth }
}

function calculatePuzzleScore(mechanisms: Mechanism[]): { count: number; score: number } {
  const puzzles = mechanisms.filter((m) => m.type === 'puzzle')
  let score = 0

  for (const puzzle of puzzles) {
    const cfg = puzzle.config || {}
    const hints = cfg.hints ?? 3
    const steps = cfg.steps ?? (cfg.tiles ? Math.ceil(Math.sqrt(cfg.tiles)) : 1)
    const difficultyMultiplier = cfg.difficulty === 'hard' ? 1.5 : cfg.difficulty === 'medium' ? 1.2 : 1.0

    const hintPenalty = Math.max(0, (3 - hints) * 0.3)
    score += (1 + steps * 0.2 + hintPenalty) * difficultyMultiplier
  }

  return { count: puzzles.length, score }
}

export function calculateDifficulty(mechanisms: Mechanism[], gridWidth?: number, gridHeight?: number): DifficultyBreakdown {
  const mechanismResult = calculateMechanismScore(mechanisms)
  const linkResult = calculateLinkComplexity(mechanisms)
  const puzzleResult = calculatePuzzleScore(mechanisms)

  let rawScore = BASE_SCORE
  rawScore += mechanismResult.score
  rawScore += linkResult.complexity
  rawScore += puzzleResult.score

  if (gridWidth && gridHeight) {
    const area = gridWidth * gridHeight
    const density = mechanisms.length / area
    rawScore *= 1 + density * 2
  }

  const minRaw = 1
  const maxRaw = 35
  const normalized = Math.max(0, Math.min(1, (rawScore - minRaw) / (maxRaw - minRaw)))
  const difficulty = Math.round((MIN_DIFFICULTY + normalized * (MAX_DIFFICULTY - MIN_DIFFICULTY)) * 10) / 10
  const clampedDifficulty = Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, difficulty))

  return {
    mechanismCount: mechanisms.length,
    mechanismWeightedScore: mechanismResult.score,
    linkComplexity: linkResult.complexity,
    puzzleCount: puzzleResult.count,
    puzzleScore: puzzleResult.score,
    rawScore: Math.round(rawScore * 100) / 100,
    difficulty: clampedDifficulty,
    details: {
      mechanismTypeBreakdown: mechanismResult.breakdown,
      linkedGroups: linkResult.linkedGroups,
      maxChainDepth: linkResult.maxChainDepth,
    },
  }
}

export function calculateChamberDifficulty(chamber: Chamber): DifficultyBreakdown {
  return calculateDifficulty(chamber.mechanisms, chamber.gridWidth, chamber.gridHeight)
}

export function difficultyToStars(difficulty: number): number {
  if (difficulty <= 2) return 1
  if (difficulty <= 4) return 2
  if (difficulty <= 6) return 3
  if (difficulty <= 8) return 4
  return 5
}

export function difficultyToLabel(difficulty: number): string {
  if (difficulty <= 2) return '入门'
  if (difficulty <= 4) return '简单'
  if (difficulty <= 6) return '中等'
  if (difficulty <= 8) return '困难'
  return '噩梦'
}

export function getSuggestedMinLevel(difficulty: number): number {
  return Math.max(1, Math.floor(difficulty * 1.8))
}

export default {
  calculateDifficulty,
  calculateChamberDifficulty,
  difficultyToStars,
  difficultyToLabel,
  getSuggestedMinLevel,
}
