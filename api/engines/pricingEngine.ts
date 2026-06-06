import type { Rarity, Transaction } from '../store/memoryStore.js'

export interface PriceSuggestion {
  min: number
  max: number
  avg: number
  median: number
  suggested: number
  rarityMultiplier: number
  dataPoints: number
  breakdown: {
    historicalAvg: number
    rarityAdjusted: number
    trendAdjustment: number
    volatility: number
  }
}

const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  common: 1.0,
  rare: 2.5,
  epic: 5.0,
  legendary: 12.0,
}

const RARITY_BASE_PRICES: Record<string, Record<Rarity, number>> = {
  blueprint: {
    common: 200,
    rare: 800,
    epic: 2500,
    legendary: 10000,
  },
  material: {
    common: 30,
    rare: 150,
    epic: 600,
    legendary: 3000,
  },
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0
  const avg = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  return avg > 0 ? stdDev / avg : 0
}

function calculateTrend(transactions: Transaction[]): number {
  if (transactions.length < 4) return 0

  const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp)
  const mid = Math.floor(sorted.length / 2)
  const firstHalf = sorted.slice(0, mid)
  const secondHalf = sorted.slice(mid)

  const firstAvg = firstHalf.reduce((s, t) => s + t.price, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((s, t) => s + t.price, 0) / secondHalf.length

  if (firstAvg === 0) return 0
  return (secondAvg - firstAvg) / firstAvg
}

export function suggestPrice(
  itemId: string,
  itemType: 'blueprint' | 'material',
  rarity: Rarity,
  recentTransactions: Transaction[]
): PriceSuggestion {
  const relevantTransactions = recentTransactions.filter((t) => t.itemId === itemId)
  const prices = relevantTransactions.map((t) => t.price)

  const historicalAvg = prices.length > 0 ? prices.reduce((s, p) => s + p, 0) / prices.length : 0
  const median = calculateMedian(prices)
  const volatility = calculateVolatility(prices)
  const trend = calculateTrend(relevantTransactions)

  const basePrice = RARITY_BASE_PRICES[itemType]?.[rarity] ?? RARITY_BASE_PRICES.material.common
  const rarityMultiplier = RARITY_MULTIPLIERS[rarity] ?? 1.0

  let referencePrice = historicalAvg > 0 ? historicalAvg : basePrice

  const trendAdjustment = trend * 0.3
  const rarityAdjusted = referencePrice * rarityMultiplier / (RARITY_MULTIPLIERS.common)

  if (historicalAvg === 0) {
    referencePrice = basePrice
  }

  const adjustedPrice = referencePrice * (1 + trendAdjustment)
  const volatilitySpread = Math.max(0.05, volatility) * 0.5

  let minPrice = Math.round(adjustedPrice * (1 - volatilitySpread - 0.1))
  let maxPrice = Math.round(adjustedPrice * (1 + volatilitySpread + 0.1))
  let avgPrice = Math.round(adjustedPrice)
  let suggestedPrice = Math.round(adjustedPrice)

  const baseMin = Math.round(basePrice * 0.7)
  const baseMax = Math.round(basePrice * 1.5)

  minPrice = Math.max(minPrice, baseMin)
  maxPrice = Math.max(maxPrice, baseMax, minPrice + 1)
  avgPrice = Math.max(avgPrice, minPrice)
  avgPrice = Math.min(avgPrice, maxPrice)
  suggestedPrice = Math.max(suggestedPrice, minPrice)
  suggestedPrice = Math.min(suggestedPrice, maxPrice)

  return {
    min: minPrice,
    max: maxPrice,
    avg: avgPrice,
    median: median > 0 ? Math.round(median) : avgPrice,
    suggested: suggestedPrice,
    rarityMultiplier,
    dataPoints: prices.length,
    breakdown: {
      historicalAvg: Math.round(historicalAvg),
      rarityAdjusted: Math.round(rarityAdjusted),
      trendAdjustment: Math.round(trendAdjustment * 10000) / 100,
      volatility: Math.round(volatility * 10000) / 100,
    },
  }
}

export function isPriceReasonable(price: number, suggestion: PriceSuggestion): { reasonable: boolean; reason?: string } {
  if (price < suggestion.min) {
    return { reasonable: false, reason: `价格偏低，建议不低于 ${suggestion.min}` }
  }
  if (price > suggestion.max * 2) {
    return { reasonable: false, reason: `价格过高，建议不超过 ${suggestion.max}` }
  }
  if (price > suggestion.max) {
    return { reasonable: true, reason: '价格略高于市场平均，可能出售较慢' }
  }
  return { reasonable: true }
}

export function calculateSaleTax(price: number, rarity: Rarity): number {
  const taxRates: Record<Rarity, number> = {
    common: 0.03,
    rare: 0.05,
    epic: 0.08,
    legendary: 0.12,
  }
  return Math.round(price * (taxRates[rarity] ?? 0.05))
}

export default {
  suggestPrice,
  isPriceReasonable,
  calculateSaleTax,
}
