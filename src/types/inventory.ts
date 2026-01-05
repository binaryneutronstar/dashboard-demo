// SKU（商品）の基本情報
export interface SKU {
  id: string
  name: string
  category: string
  region: string
  store?: string
}

// アクション効果予測
export interface ActionEffect {
  projectedStockoutRisk: number
  projectedExcessRisk: number
  expectedImpact: string
}

// 在庫アイテム（分析対象）
export interface InventoryItem extends SKU {
  currentStock: number
  salesVelocity: number // 1日あたりの販売数
  leadTimeDays: number
  inventoryTurnoverDays: number
  stockoutRisk: number // 0-100
  excessInventoryRisk: number // 0-100
  priorityScore: number // 優先度スコア
  demandForecast?: number[]
  stockHistory?: number[]
  salesHistory?: number[]
  recommendedAction?: RecommendedAction
  hasActiveAction?: boolean
  projectedStock?: number
  onOrder?: number
  demandMultiplier?: number
  actionEffect?: ActionEffect
}

// アクションタイプ
export type ActionType = 'replenishment_adjust' | 'transfer' | 'markdown_promo'

// 推奨アクション
export interface RecommendedAction {
  type: ActionType
  label: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

// 根拠指標（スナップショット）
export interface RationaleMetrics {
  currentStock: number
  salesVelocity: number
  leadTimeDays: number
  inventoryTurnoverDays: number
  stockoutRisk: number
  excessInventoryRisk: number
  demandForecast?: number
  priorityScore: number
  [key: string]: number | undefined
}

// アクションペイロード（各アクションの詳細）
export type ActionPayload =
  | ReplenishmentPayload
  | TransferPayload
  | MarkdownPromoPayload

export interface ReplenishmentPayload {
  type: 'increase' | 'decrease'
  currentAmount: number
  proposedAmount: number
  percentageChange: number
}

export interface TransferPayload {
  fromLocation: string
  toLocation: string
  quantity: number
}

export interface MarkdownPromoPayload {
  currentPrice?: number
  proposedPrice?: number
  discountRate: number
  promoType: 'markdown' | 'promotion'
}

// 評価結果
export type EvaluationResult = 'improved' | 'neutral' | 'worsened'

// 評価データ
export interface Evaluation {
  result: EvaluationResult
  mockMetrics: {
    stockChange?: number
    stockoutReduction?: number
    salesChange?: number
    marginChange?: number
  }
  learnings: string
  nextActions: string
  evaluatedAt: string
}

// KPIスナップショット
export interface KPISnapshot {
  stockoutRisk: number
  excessInventoryRisk: number
  inventoryTurnoverDays: number
  salesVelocity: number
  currentStock: number
}

// アウトカムラベル
export type OutcomeLabel = 'improved' | 'neutral' | 'worsened'

// アクションログ
export type ActionStatus = 'proposed' | 'approved' | 'executed' | 'cancelled'

export interface ActionLog {
  action_id: string
  timestamp: string
  sku_id: string
  sku_name: string
  category: string
  region: string
  store?: string
  action_type: ActionType
  action_payload: ActionPayload
  rationale_metrics: RationaleMetrics
  status: ActionStatus
  owner: string
  notes?: string
  evaluation?: Evaluation
  kpi_snapshot_before?: KPISnapshot
  kpi_snapshot_after?: KPISnapshot
  outcome_label?: OutcomeLabel
  auto_comment?: string
}
