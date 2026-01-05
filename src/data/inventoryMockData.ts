import type { InventoryItem, RecommendedAction, ActionType } from '../types/inventory'

const categories = ['アパレル', '食品', '家電', '日用品', '化粧品', '書籍']
const regions = ['東京', '大阪', '名古屋', '福岡', '札幌']
const stores = ['本店', '駅前店', '郊外店', '倉庫']

// ランダム値生成（範囲指定）
const random = (min: number, max: number) => Math.random() * (max - min) + min

// ランダム整数
const randomInt = (min: number, max: number) => Math.floor(random(min, max))

// 正規分布に近い乱数（きれいすぎないデータ用）
const randomNormal = (mean: number, stdDev: number) => {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z0 * stdDev + mean
}

// 欠品リスク計算
const calculateStockoutRisk = (
  stock: number,
  velocity: number,
  leadTime: number
): number => {
  const daysUntilStockout = velocity > 0 ? stock / velocity : 999
  const safetyBuffer = leadTime * 1.5

  if (daysUntilStockout < leadTime) return Math.min(100, 90 + randomInt(0, 10))
  if (daysUntilStockout < safetyBuffer) return randomInt(50, 80)
  if (daysUntilStockout < safetyBuffer * 2) return randomInt(20, 50)
  return randomInt(0, 20)
}

// 過剰在庫リスク計算
const calculateExcessRisk = (turnoverDays: number): number => {
  if (turnoverDays > 180) return Math.min(100, 80 + randomInt(0, 20))
  if (turnoverDays > 90) return randomInt(50, 80)
  if (turnoverDays > 60) return randomInt(20, 50)
  return randomInt(0, 20)
}

// 優先度スコア計算
const calculatePriorityScore = (
  stockoutRisk: number,
  excessRisk: number,
  velocity: number,
  category: string
): number => {
  let score = 0

  // 欠品リスクの重み付け
  score += stockoutRisk * 0.4

  // 過剰在庫リスクの重み付け
  score += excessRisk * 0.3

  // 販売速度（売れ筋ほど優先）
  if (velocity > 10) score += 20
  else if (velocity > 5) score += 10

  // カテゴリ別調整（食品は優先度高め）
  if (category === '食品') score += 15
  else if (category === 'アパレル') score += 10

  // ノイズ追加（きれいすぎないデータ）
  score += randomNormal(0, 5)

  return Math.max(0, Math.min(100, score))
}

// 推奨アクション決定
const determineRecommendedAction = (
  stockoutRisk: number,
  excessRisk: number,
  _turnoverDays: number
): RecommendedAction | undefined => {
  // 欠品リスクが高い
  if (stockoutRisk > 60) {
    return {
      type: 'replenishment_adjust' as ActionType,
      label: '発注増',
      description: '欠品リスクが高いため、発注量を増やすことを推奨',
      priority: stockoutRisk > 80 ? 'high' : 'medium',
    }
  }

  // 過剰在庫リスクが高い
  if (excessRisk > 60) {
    return {
      type: 'markdown_promo' as ActionType,
      label: '値下げ/販促',
      description: '在庫回転が遅いため、値下げまたは販促を検討',
      priority: excessRisk > 80 ? 'high' : 'medium',
    }
  }

  // 在庫移動が有効な場合
  if (stockoutRisk > 40 && stockoutRisk < 60) {
    return {
      type: 'transfer' as ActionType,
      label: '在庫移動',
      description: '他店舗から在庫を移動することで欠品を回避',
      priority: 'medium',
    }
  }

  return undefined
}

// 履歴データ生成（30日分）
const generateHistory = (base: number, volatility: number): number[] => {
  const history: number[] = []
  let current = base

  for (let i = 0; i < 30; i++) {
    const change = randomNormal(0, volatility)
    current = Math.max(0, current + change)
    history.push(Math.round(current))
  }

  return history
}

// 在庫アイテム生成
export const generateInventoryItems = (count: number = 50): InventoryItem[] => {
  const items: InventoryItem[] = []

  for (let i = 0; i < count; i++) {
    const category = categories[randomInt(0, categories.length)]
    const region = regions[randomInt(0, regions.length)]
    const store = Math.random() > 0.3 ? stores[randomInt(0, stores.length)] : undefined

    // 基本値
    const salesVelocity = Math.max(0.1, randomNormal(5, 3))
    const currentStock = Math.max(0, randomNormal(salesVelocity * 15, salesVelocity * 10))
    const leadTimeDays = randomInt(3, 14)
    const inventoryTurnoverDays = currentStock > 0 ? currentStock / salesVelocity : 0

    // リスク計算
    const stockoutRisk = calculateStockoutRisk(currentStock, salesVelocity, leadTimeDays)
    const excessInventoryRisk = calculateExcessRisk(inventoryTurnoverDays)
    const priorityScore = calculatePriorityScore(
      stockoutRisk,
      excessInventoryRisk,
      salesVelocity,
      category
    )

    // 推奨アクション
    const recommendedAction = determineRecommendedAction(
      stockoutRisk,
      excessInventoryRisk,
      inventoryTurnoverDays
    )

    items.push({
      id: `SKU-${String(i + 1).padStart(4, '0')}`,
      name: `${category}_商品${i + 1}`,
      category,
      region,
      store,
      currentStock: Math.round(currentStock),
      salesVelocity: Math.round(salesVelocity * 10) / 10,
      leadTimeDays,
      inventoryTurnoverDays: Math.round(inventoryTurnoverDays),
      stockoutRisk: Math.round(stockoutRisk),
      excessInventoryRisk: Math.round(excessInventoryRisk),
      priorityScore: Math.round(priorityScore),
      demandForecast: generateHistory(salesVelocity, salesVelocity * 0.3),
      stockHistory: generateHistory(currentStock, currentStock * 0.2),
      salesHistory: generateHistory(salesVelocity, salesVelocity * 0.4),
      recommendedAction,
      hasActiveAction: false,
    })
  }

  // 優先度順にソート
  return items.sort((a, b) => b.priorityScore - a.priorityScore)
}
