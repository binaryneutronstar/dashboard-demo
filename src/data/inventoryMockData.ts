import type { InventoryItem, RecommendedAction, ActionType } from '../types/inventory'

const categories = ['アパレル', '食品', '家電', '日用品', '化粧品', '書籍']
const regions = ['東京', '大阪', '名古屋', '福岡', '札幌']
const stores = ['都心旗艦店', '湾岸モール店', '北側ロードサイド店', '西エリア駅前店', '郊外アウトレット店']
const warehouses = ['東日本DC', '西日本DC', 'ECフルフィルセンター', '北部ロジスティクスセンター']

// カテゴリ別の商品名テンプレート
const productTemplates: Record<string, string[]> = {
  'アパレル': [
    'ドライコットンTシャツ/ブラック/M',
    'ストレッチデニムパンツ/インディゴ/30',
    'フリースジャケット/グレー/L',
    'ウールニットセーター/ネイビー/M',
    'チノパンツ/ベージュ/32',
    'ポロシャツ/ホワイト/L',
    'ダウンジャケット/ブラック/M',
    'カーディガン/ブラウン/L',
  ],
  '食品': [
    '国産和牛ロース/100g',
    '無添加食パン/6枚切',
    '有機野菜セット/Mサイズ',
    'プレミアムチーズ詰合せ',
    '産地直送りんご/5個入',
    '焼き菓子詰合せ/12個入',
    '特選日本茶/100g',
    'オーガニックコーヒー豆/200g',
  ],
  '家電': [
    'ワイヤレスイヤホン/TWS-200',
    '空気清浄機/AP-3000',
    'ロボット掃除機/RC-500',
    '電気ケトル/1.2L',
    'ハンディ扇風機/ホワイト',
    'スマートウォッチ/SW-100',
    'デジタルカメラ/DC-800',
    'ポータブルスピーカー/PS-300',
  ],
  '日用品': [
    'エコ洗濯洗剤/詰替用/1L',
    'ティッシュペーパー/5箱パック',
    'トイレットペーパー/12ロール',
    'ハンドソープ/ポンプ式/250ml',
    'キッチンペーパー/4ロール',
    'ゴミ袋/45L/30枚入',
    'バスタオル/グレー/2枚組',
    'フェイスタオル/ホワイト/5枚組',
  ],
  '化粧品': [
    'モイスチャライザー/50ml',
    'フェイスマスク/7枚入',
    'クレンジングオイル/150ml',
    'UVカットクリーム/SPF50/30ml',
    'リップクリーム/無香料',
    'ハンドクリーム/シアバター/50g',
    'アイシャドウパレット/10色',
    'フェイスパウダー/ナチュラル',
  ],
  '書籍': [
    'ビジネス書/リーダーシップ論',
    '小説/ミステリー新刊',
    '実用書/料理レシピ集',
    'マンガ/人気シリーズ最新巻',
    '自己啓発書/習慣術',
    '旅行ガイド/京都編',
    '語学教材/英会話入門',
    '雑誌/月刊ビジネス誌',
  ],
}

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

    // 70%で店舗、30%で倉庫
    let store: string | undefined
    if (Math.random() > 0.3) {
      store = stores[randomInt(0, stores.length)]
    } else {
      store = warehouses[randomInt(0, warehouses.length)]
    }

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

    // カテゴリ別の商品名を取得
    const templates = productTemplates[category]
    const productName = templates[randomInt(0, templates.length)]
    const skuSuffix = String.fromCharCode(65 + randomInt(0, 26)) + '-' + String(randomInt(1000, 9999))

    items.push({
      id: `SKU-${String(i + 1).padStart(4, '0')}`,
      name: `${productName} ${skuSuffix}`,
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
