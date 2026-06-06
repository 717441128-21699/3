import type { GameEvent, MechanismType, Mechanism } from '../store/memoryStore.js'

export type EventSubType =
  | 'laser_boost'
  | 'trap_accelerate'
  | 'grid_collapse'
  | 'temporary_protection'
  | 'extra_time'
  | 'hint_reveal'

export interface EventConfig {
  probability: number
  minInterval: number
  maxInterval: number
  maxSimultaneous: number
}

export interface GeneratedEvent {
  event: GameEvent
  effect: EventEffect
}

export interface EventEffect {
  type: string
  subType: EventSubType
  description: string
  duration: number
  affectedMechanisms?: string[]
  affectedCells?: Array<{ x: number; y: number }>
  modifiers: {
    damageMultiplier?: number
    intervalMultiplier?: number
    protection?: number
    timeBonus?: number
  }
}

const DEFAULT_CONFIG: EventConfig = {
  probability: 0.35,
  minInterval: 45000,
  maxInterval: 90000,
  maxSimultaneous: 2,
}

const MALFUNCTION_DESCRIPTIONS: Record<EventSubType, string[]> = {
  laser_boost: [
    '激光系统过热，伤害大幅提升！',
    '能量过载警告！激光强度增强！',
    '核心失控，激光网络进入狂暴模式！',
  ],
  trap_accelerate: [
    '陷阱触发频率加快，小心脚下！',
    '机械结构异常，地刺高速弹出！',
    '陷阱传感器灵敏度倍增！',
  ],
  grid_collapse: [
    '密室结构不稳，部分区域即将崩塌！',
    '地板出现裂缝，危险区域扩散！',
    '承重结构失效，格子正在消失！',
  ],
  temporary_protection: [
    '古老护盾激活，获得临时保护！',
    '神秘力量庇护，伤害暂时减免！',
    '守护符文亮起，短暂无敌状态！',
  ],
  extra_time: [
    '时间沙漏被激活，获得额外时间！',
    '时空扭曲，倒计时暂时减缓！',
    '古老时钟共鸣，延长挑战时限！',
  ],
  hint_reveal: [
    '谜题灵光闪现，获得提示！',
    '密室回响揭示线索，谜题进度推进！',
    '先祖指引，关键信息显露！',
  ],
}

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickMechanismsByType(mechanisms: Mechanism[], type: MechanismType, count: number): string[] {
  const filtered = mechanisms.filter((m) => m.type === type).map((m) => m.id)
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function generateGridCells(gridWidth: number, gridHeight: number, count: number): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = []
  const used = new Set<string>()
  const maxAttempts = count * 10
  let attempts = 0

  while (cells.length < count && attempts < maxAttempts) {
    const x = Math.floor(Math.random() * gridWidth)
    const y = Math.floor(Math.random() * gridHeight)
    const key = `${x},${y}`
    if (!used.has(key)) {
      used.add(key)
      cells.push({ x, y })
    }
    attempts++
  }

  return cells
}

function createMalfunctionLaserEvent(mechanisms: Mechanism[]): GeneratedEvent {
  const affected = pickMechanismsByType(mechanisms, 'laser', Math.max(1, Math.floor(Math.random() * 3) + 1))
  const subType: EventSubType = 'laser_boost'
  const description = pickRandom(MALFUNCTION_DESCRIPTIONS[subType])
  const damageMultiplier = 1.5 + Math.random() * 1.0

  return {
    event: {
      id: generateId(),
      type: 'malfunction',
      triggeredAt: Date.now(),
      resolved: false,
      data: {
        subType,
        description,
        affectedMechanisms: affected,
        duration: 20000 + Math.random() * 15000,
      },
    },
    effect: {
      type: 'malfunction',
      subType,
      description,
      duration: 20000 + Math.random() * 15000,
      affectedMechanisms: affected,
      modifiers: {
        damageMultiplier,
      },
    },
  }
}

function createMalfunctionTrapEvent(mechanisms: Mechanism[]): GeneratedEvent {
  const affected = pickMechanismsByType(mechanisms, 'trap', Math.max(1, Math.floor(Math.random() * 3) + 1))
  const subType: EventSubType = 'trap_accelerate'
  const description = pickRandom(MALFUNCTION_DESCRIPTIONS[subType])
  const intervalMultiplier = 0.4 + Math.random() * 0.3

  return {
    event: {
      id: generateId(),
      type: 'malfunction',
      triggeredAt: Date.now(),
      resolved: false,
      data: {
        subType,
        description,
        affectedMechanisms: affected,
        duration: 25000 + Math.random() * 20000,
      },
    },
    effect: {
      type: 'malfunction',
      subType,
      description,
      duration: 25000 + Math.random() * 20000,
      affectedMechanisms: affected,
      modifiers: {
        intervalMultiplier,
      },
    },
  }
}

function createCollapseEvent(gridWidth: number, gridHeight: number): GeneratedEvent {
  const cellCount = 2 + Math.floor(Math.random() * 4)
  const affectedCells = generateGridCells(gridWidth, gridHeight, cellCount)
  const subType: EventSubType = 'grid_collapse'
  const description = pickRandom(MALFUNCTION_DESCRIPTIONS[subType])

  return {
    event: {
      id: generateId(),
      type: 'collapse',
      triggeredAt: Date.now(),
      resolved: false,
      data: {
        subType,
        description,
        affectedCells,
        duration: 0,
      },
    },
    effect: {
      type: 'collapse',
      subType,
      description,
      duration: 0,
      affectedCells,
      modifiers: {},
    },
  }
}

function createBonusProtectionEvent(): GeneratedEvent {
  const subType: EventSubType = 'temporary_protection'
  const description = pickRandom(MALFUNCTION_DESCRIPTIONS[subType])
  const protection = 0.5 + Math.random() * 0.5

  return {
    event: {
      id: generateId(),
      type: 'bonus',
      triggeredAt: Date.now(),
      resolved: false,
      data: {
        subType,
        description,
        duration: 15000 + Math.random() * 15000,
      },
    },
    effect: {
      type: 'bonus',
      subType,
      description,
      duration: 15000 + Math.random() * 15000,
      modifiers: {
        protection,
      },
    },
  }
}

function createBonusTimeEvent(): GeneratedEvent {
  const subType: EventSubType = 'extra_time'
  const description = pickRandom(MALFUNCTION_DESCRIPTIONS[subType])
  const timeBonus = 30000 + Math.floor(Math.random() * 60000)

  return {
    event: {
      id: generateId(),
      type: 'bonus',
      triggeredAt: Date.now(),
      resolved: false,
      data: {
        subType,
        description,
        timeBonus,
        duration: 0,
      },
    },
    effect: {
      type: 'bonus',
      subType,
      description,
      duration: 0,
      modifiers: {
        timeBonus,
      },
    },
  }
}

export function shouldTriggerEvent(
  activeEvents: GameEvent[],
  lastEventTime: number,
  config: Partial<EventConfig> = {}
): boolean {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const now = Date.now()
  const timeSinceLast = now - lastEventTime

  if (activeEvents.filter((e) => !e.resolved).length >= cfg.maxSimultaneous) {
    return false
  }

  if (timeSinceLast < cfg.minInterval) {
    return false
  }

  if (timeSinceLast >= cfg.maxInterval) {
    return true
  }

  const timeFactor = (timeSinceLast - cfg.minInterval) / (cfg.maxInterval - cfg.minInterval)
  const adjustedProbability = cfg.probability * (0.5 + timeFactor * 0.5)

  return Math.random() < adjustedProbability
}

export function generateRandomEvent(params: {
  mechanisms?: Mechanism[]
  gridWidth?: number
  gridHeight?: number
  forceType?: 'malfunction' | 'collapse' | 'bonus'
}): GeneratedEvent {
  const { mechanisms = [], gridWidth = 16, gridHeight = 12, forceType } = params

  const hasLasers = mechanisms.some((m) => m.type === 'laser')
  const hasTraps = mechanisms.some((m) => m.type === 'trap')

  const eventPool: Array<() => GeneratedEvent> = []

  if (forceType === 'malfunction' || !forceType) {
    if (hasLasers) eventPool.push(() => createMalfunctionLaserEvent(mechanisms))
    if (hasTraps) eventPool.push(() => createMalfunctionTrapEvent(mechanisms))
  }

  if (forceType === 'collapse' || !forceType) {
    eventPool.push(() => createCollapseEvent(gridWidth, gridHeight))
  }

  if (forceType === 'bonus' || !forceType) {
    eventPool.push(() => createBonusProtectionEvent())
    eventPool.push(() => createBonusTimeEvent())
  }

  if (eventPool.length === 0) {
    eventPool.push(() => createBonusProtectionEvent())
  }

  const generator = pickRandom(eventPool)
  return generator()
}

export function generateEventBatch(
  count: number,
  params: { mechanisms?: Mechanism[]; gridWidth?: number; gridHeight?: number } = {}
): GeneratedEvent[] {
  const results: GeneratedEvent[] = []
  for (let i = 0; i < count; i++) {
    results.push(generateRandomEvent(params))
  }
  return results
}

export function resolveEvent(event: GameEvent): GameEvent {
  return {
    ...event,
    resolved: true,
  }
}

export function getEventSeverity(event: GameEvent): 'low' | 'medium' | 'high' | 'critical' {
  if (event.type === 'bonus') return 'low'

  if (event.type === 'collapse') {
    const cells = event.data?.affectedCells?.length ?? 0
    if (cells >= 5) return 'critical'
    if (cells >= 3) return 'high'
    return 'medium'
  }

  if (event.type === 'malfunction') {
    const subType = event.data?.subType
    const affectedCount = event.data?.affectedMechanisms?.length ?? 0
    if (subType === 'laser_boost' && affectedCount >= 3) return 'critical'
    if (affectedCount >= 2) return 'high'
    return 'medium'
  }

  return 'low'
}

export default {
  shouldTriggerEvent,
  generateRandomEvent,
  generateEventBatch,
  resolveEvent,
  getEventSeverity,
}
