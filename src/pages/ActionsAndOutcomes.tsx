import { useState, useEffect } from 'react'
import { ActionLogRepository } from '../repositories/ActionLogRepository'
import type {
  ActionLog,
  ActionType,
  KPISnapshot,
  OutcomeLabel,
} from '../types/inventory'
import { Clock, Package, TrendingUp, Tag, ArrowRight, Sparkles, ArrowDown, ArrowUp, Minus } from 'lucide-react'

// 自動コメント生成関数
const generateAutoComment = (
  log: ActionLog,
  before: KPISnapshot,
  after: KPISnapshot
): string => {
  const stockoutDiff = before.stockoutRisk - after.stockoutRisk
  const excessDiff = before.excessInventoryRisk - after.excessInventoryRisk
  const turnoverDiff = before.inventoryTurnoverDays - after.inventoryTurnoverDays

  let comments: string[] = []

  if (log.action_type === 'replenishment_adjust') {
    if (stockoutDiff > 30) {
      comments.push('欠品リスクが高水準だったが、発注増により大幅に低下。')
    } else if (stockoutDiff > 10) {
      comments.push('発注調整により欠品リスクが改善傾向。')
    } else {
      comments.push('発注調整したが、欠品リスクの低下は限定的。')
    }

    if (turnoverDiff < -10) {
      comments.push('在庫回転日数が増加し、過剰在庫リスクに注意が必要。')
    } else {
      comments.push('次はリードタイム短縮施策の検討余地。')
    }
  } else if (log.action_type === 'transfer') {
    if (stockoutDiff > 20) {
      comments.push('移動により店舗間の偏りは是正され、欠品リスクが低下。')
    } else {
      comments.push('移動を実施したが、需要が強い店舗での欠品兆候は継続監視。')
    }

    comments.push('他店舗への影響も確認が必要。')
  } else if (log.action_type === 'markdown_promo') {
    if (excessDiff > 30) {
      comments.push('過剰在庫は改善し、販売速度が向上。')
    } else if (excessDiff > 10) {
      comments.push('値下げにより在庫は減少傾向だが、販売速度の伸びが想定未達。')
    } else {
      comments.push('値下げ実施も効果限定的。値下げ率や露出面の再調整が必要。')
    }

    if (turnoverDiff > 20) {
      comments.push('在庫回転が大幅改善。粗利への影響を確認。')
    }
  }

  return comments.join(' ')
}

// KPI after生成（モック）
const generateKPIAfter = (
  before: KPISnapshot,
  actionType: ActionType
): { after: KPISnapshot; outcomeLabel: OutcomeLabel } => {
  const randomFactor = () => Math.random() * 0.3 + 0.85 // 0.85-1.15

  let stockoutRisk = before.stockoutRisk
  let excessRisk = before.excessInventoryRisk
  let turnoverDays = before.inventoryTurnoverDays
  let salesVelocity = before.salesVelocity
  let stock = before.currentStock

  // 成功確率（70%で改善、20%で中立、10%で悪化）
  const roll = Math.random()
  const success = roll < 0.7
  const neutral = roll >= 0.7 && roll < 0.9

  if (actionType === 'replenishment_adjust') {
    if (success) {
      stockoutRisk = Math.max(0, stockoutRisk - 30 - Math.random() * 20)
      stock = stock + Math.round(salesVelocity * 10 * randomFactor())
    } else if (neutral) {
      stockoutRisk = Math.max(0, stockoutRisk - 10)
      stock = stock + Math.round(salesVelocity * 5)
    } else {
      stockoutRisk = Math.min(100, stockoutRisk + 5)
      excessRisk = Math.min(100, excessRisk + 10)
    }
  } else if (actionType === 'transfer') {
    if (success) {
      stockoutRisk = Math.max(0, stockoutRisk - 25 - Math.random() * 15)
      stock = stock + Math.round(salesVelocity * 7 * randomFactor())
    } else if (neutral) {
      stockoutRisk = Math.max(0, stockoutRisk - 10)
      stock = stock + Math.round(salesVelocity * 3)
    } else {
      stockoutRisk = Math.min(100, stockoutRisk + 5)
    }
  } else if (actionType === 'markdown_promo') {
    if (success) {
      excessRisk = Math.max(0, excessRisk - 35 - Math.random() * 20)
      salesVelocity = salesVelocity * (1.2 + Math.random() * 0.3)
      turnoverDays = Math.max(1, turnoverDays - 40 - Math.random() * 20)
    } else if (neutral) {
      excessRisk = Math.max(0, excessRisk - 10)
      salesVelocity = salesVelocity * 1.1
      turnoverDays = Math.max(1, turnoverDays - 15)
    } else {
      excessRisk = Math.max(0, excessRisk - 5)
      salesVelocity = salesVelocity * 0.95
    }
  }

  const after: KPISnapshot = {
    stockoutRisk: Math.round(stockoutRisk),
    excessInventoryRisk: Math.round(excessRisk),
    inventoryTurnoverDays: Math.round(turnoverDays),
    salesVelocity: Math.round(salesVelocity * 10) / 10,
    currentStock: Math.round(stock),
  }

  const outcome: OutcomeLabel = success
    ? 'improved'
    : neutral
    ? 'neutral'
    : 'worsened'

  return { after, outcomeLabel: outcome }
}

// ステップインジケーターコンポーネント
const StatusStepIndicator = ({ currentStatus }: { currentStatus: string }) => {
  const steps = [
    { id: 'proposed', label: '提案' },
    { id: 'approved', label: '承認' },
    { id: 'executed', label: '実行' },
    { id: 'evaluated', label: '評価' },
  ]

  const getStepIndex = (status: string) => {
    if (status === 'cancelled') return -1
    return steps.findIndex((s) => s.id === status)
  }

  const currentIndex = getStepIndex(currentStatus)

  return (
    <div className="flex items-center gap-1 mb-3">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex
        const isCurrent = index === currentIndex
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-full h-1.5 rounded-full transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gray-200'
                }`}
              />
              <span
                className={`text-xs mt-1 font-medium ${
                  isCurrent
                    ? 'text-blue-700 font-semibold'
                    : isActive
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-2 h-1.5 ${
                  index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ActionsAndOutcomes() {
  const [logs, setLogs] = useState<ActionLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActionLog[]>([])
  const [selectedLog, setSelectedLog] = useState<ActionLog | null>(null)

  // フィルタ状態
  const [filterActionType, setFilterActionType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [logs, filterActionType, filterStatus, filterCategory])

  const loadLogs = () => {
    const allLogs = ActionLogRepository.getAll()
    setLogs(
      allLogs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    )
  }

  const applyFilters = () => {
    let filtered = [...logs]

    if (filterActionType !== 'all') {
      filtered = filtered.filter((log) => log.action_type === filterActionType)
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((log) => log.status === filterStatus)
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter((log) => log.category === filterCategory)
    }

    setFilteredLogs(filtered)
  }

  const handleGenerateOutcome = () => {
    if (!selectedLog || !selectedLog.kpi_snapshot_before) {
      alert('KPI beforeが記録されていないため、評価を生成できません。')
      return
    }

    const { after, outcomeLabel } = generateKPIAfter(
      selectedLog.kpi_snapshot_before,
      selectedLog.action_type
    )

    const autoComment = generateAutoComment(
      selectedLog,
      selectedLog.kpi_snapshot_before,
      after
    )

    const updatedLog: ActionLog = {
      ...selectedLog,
      kpi_snapshot_after: after,
      outcome_label: outcomeLabel,
      auto_comment: autoComment,
      status: 'evaluated',
    }

    ActionLogRepository.save(updatedLog)
    loadLogs()
    setSelectedLog(updatedLog)
  }

  const getActionTypeLabel = (type: ActionType) => {
    switch (type) {
      case 'replenishment_adjust':
        return '発注調整'
      case 'transfer':
        return '在庫移動'
      case 'markdown_promo':
        return '値下げ/販促'
    }
  }

  const getActionTypeIcon = (type: ActionType) => {
    switch (type) {
      case 'replenishment_adjust':
        return <TrendingUp className="w-4 h-4" />
      case 'transfer':
        return <Package className="w-4 h-4" />
      case 'markdown_promo':
        return <Tag className="w-4 h-4" />
    }
  }

  const getOutcomeBadge = (label: OutcomeLabel) => {
    switch (label) {
      case 'improved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            改善
          </span>
        )
      case 'neutral':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            中立
          </span>
        )
      case 'worsened':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            悪化
          </span>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'proposed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
            提案中
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
            承認済
          </span>
        )
      case 'executed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
            実行済
          </span>
        )
      case 'evaluated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-300">
            評価済
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
            中止
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            {status}
          </span>
        )
    }
  }

  const categories = [...new Set(logs.map((log) => log.category))]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          アクション & アウトカム
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          実行されたアクションとKPI差分を確認できます。
        </p>
      </div>

      {/* フィルタ */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アクション種類
            </label>
            <select
              value={filterActionType}
              onChange={(e) => setFilterActionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべて</option>
              <option value="replenishment_adjust">発注調整</option>
              <option value="transfer">在庫移動</option>
              <option value="markdown_promo">値下げ/販促</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべて</option>
              <option value="proposed">提案中</option>
              <option value="approved">承認済</option>
              <option value="executed">実行済</option>
              <option value="evaluated">評価済</option>
              <option value="cancelled">中止</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべて</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ログリストとアウトカム */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ログ一覧 */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">アクションログ</h2>
          {filteredLogs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">該当するアクションログがありません</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.action_id}
                onClick={() => setSelectedLog(log)}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedLog?.action_id === log.action_id
                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* ステップインジケーター */}
                <StatusStepIndicator currentStatus={log.status} />

                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getActionTypeIcon(log.action_type)}
                    <span className="font-semibold text-gray-900">
                      {getActionTypeLabel(log.action_type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(log.status)}
                    {log.outcome_label && getOutcomeBadge(log.outcome_label)}
                  </div>
                </div>
                <p className="text-sm text-gray-900 font-medium mb-1">
                  {log.sku_name}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {log.category} / {log.region}
                  {log.store && ` / ${log.store}`}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(log.timestamp).toLocaleString('ja-JP')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 詳細とKPI差分 */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            アクション詳細 & アウトカム
          </h2>
          {!selectedLog ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                左のログを選択してください
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              {/* 商品情報 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  商品情報
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {selectedLog.sku_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedLog.category} / {selectedLog.region}
                    {selectedLog.store && ` / ${selectedLog.store}`}
                  </p>
                </div>
              </div>

              {/* アクション内容 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  アクション内容
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getActionTypeIcon(selectedLog.action_type)}
                    <span className="font-semibold text-gray-900">
                      {getActionTypeLabel(selectedLog.action_type)}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    {(() => {
                      const payload = selectedLog.action_payload
                      if ('type' in payload && (payload.type === 'increase' || payload.type === 'decrease')) {
                        return (
                          <>
                            <p>
                              提案発注量: <strong>{payload.proposedAmount}</strong>
                            </p>
                            <p>
                              変更率:{' '}
                              <strong
                                className={
                                  payload.percentageChange > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }
                              >
                                {payload.percentageChange > 0 ? '+' : ''}
                                {payload.percentageChange}%
                              </strong>
                            </p>
                          </>
                        )
                      } else if ('fromLocation' in payload) {
                        return (
                          <>
                            <p>
                              移動元: <strong>{payload.fromLocation}</strong>
                            </p>
                            <p>
                              移動先: <strong>{payload.toLocation}</strong>
                            </p>
                            <p>
                              数量: <strong>{payload.quantity}</strong>
                            </p>
                          </>
                        )
                      } else if ('discountRate' in payload) {
                        return (
                          <>
                            <p>
                              値下げ率: <strong>{payload.discountRate}%</strong>
                            </p>
                            <p>
                              タイプ:{' '}
                              <strong>
                                {payload.promoType === 'markdown'
                                  ? '値下げ'
                                  : '販促'}
                              </strong>
                            </p>
                          </>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>
              </div>

              {/* KPI Before/After比較 */}
              {selectedLog.kpi_snapshot_before && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      KPI Before/After 比較
                    </h3>
                    {selectedLog.outcome_label && (
                      <div>{getOutcomeBadge(selectedLog.outcome_label)}</div>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-300">
                          <th className="text-left py-2 px-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                            指標
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Before
                          </th>
                          <th className="text-center py-2 px-1 text-xs font-bold text-gray-700 uppercase tracking-wide">

                          </th>
                          <th className="text-right py-2 px-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                            After
                          </th>
                          <th className="text-right py-2 px-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                            変化
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 text-gray-900 font-medium">欠品リスク</td>
                          <td className="text-right font-semibold px-2">
                            <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-900">
                              {selectedLog.kpi_snapshot_before.stockoutRisk}%
                            </span>
                          </td>
                          <td className="text-center px-1">
                            {selectedLog.kpi_snapshot_after && (
                              <ArrowRight className="w-4 h-4 inline text-blue-400" />
                            )}
                          </td>
                          <td className="text-right font-semibold px-2">
                            {selectedLog.kpi_snapshot_after ? (
                              <span className="inline-block px-2 py-1 bg-blue-50 rounded text-gray-900">
                                {selectedLog.kpi_snapshot_after.stockoutRisk}%
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="text-right px-2">
                            {selectedLog.kpi_snapshot_after && (() => {
                              const diff = selectedLog.kpi_snapshot_before.stockoutRisk - selectedLog.kpi_snapshot_after.stockoutRisk
                              const isImproved = diff > 0
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold ${
                                    isImproved
                                      ? 'bg-green-100 text-green-700'
                                      : diff < 0
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {isImproved ? (
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  ) : diff < 0 ? (
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <Minus className="w-3.5 h-3.5" />
                                  )}
                                  {Math.abs(diff)}pt
                                </span>
                              )
                            })()}
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 text-gray-900 font-medium">過剰在庫リスク</td>
                          <td className="text-right font-semibold px-2">
                            <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-900">
                              {selectedLog.kpi_snapshot_before.excessInventoryRisk}%
                            </span>
                          </td>
                          <td className="text-center px-1">
                            {selectedLog.kpi_snapshot_after && (
                              <ArrowRight className="w-4 h-4 inline text-blue-400" />
                            )}
                          </td>
                          <td className="text-right font-semibold px-2">
                            {selectedLog.kpi_snapshot_after ? (
                              <span className="inline-block px-2 py-1 bg-blue-50 rounded text-gray-900">
                                {selectedLog.kpi_snapshot_after.excessInventoryRisk}%
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="text-right px-2">
                            {selectedLog.kpi_snapshot_after && (() => {
                              const diff = selectedLog.kpi_snapshot_before.excessInventoryRisk - selectedLog.kpi_snapshot_after.excessInventoryRisk
                              const isImproved = diff > 0
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold ${
                                    isImproved
                                      ? 'bg-green-100 text-green-700'
                                      : diff < 0
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {isImproved ? (
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  ) : diff < 0 ? (
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <Minus className="w-3.5 h-3.5" />
                                  )}
                                  {Math.abs(diff)}pt
                                </span>
                              )
                            })()}
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 text-gray-900 font-medium">在庫回転日数</td>
                          <td className="text-right font-semibold px-2">
                            <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-900">
                              {selectedLog.kpi_snapshot_before.inventoryTurnoverDays}日
                            </span>
                          </td>
                          <td className="text-center px-1">
                            {selectedLog.kpi_snapshot_after && (
                              <ArrowRight className="w-4 h-4 inline text-blue-400" />
                            )}
                          </td>
                          <td className="text-right font-semibold px-2">
                            {selectedLog.kpi_snapshot_after ? (
                              <span className="inline-block px-2 py-1 bg-blue-50 rounded text-gray-900">
                                {selectedLog.kpi_snapshot_after.inventoryTurnoverDays}日
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="text-right px-2">
                            {selectedLog.kpi_snapshot_after && (() => {
                              const diff = selectedLog.kpi_snapshot_before.inventoryTurnoverDays - selectedLog.kpi_snapshot_after.inventoryTurnoverDays
                              const isImproved = diff > 0
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold ${
                                    isImproved
                                      ? 'bg-green-100 text-green-700'
                                      : diff < 0
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {isImproved ? (
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  ) : diff < 0 ? (
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <Minus className="w-3.5 h-3.5" />
                                  )}
                                  {Math.abs(diff)}日
                                </span>
                              )
                            })()}
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 text-gray-900 font-medium">販売速度</td>
                          <td className="text-right font-semibold px-2">
                            <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-900">
                              {selectedLog.kpi_snapshot_before.salesVelocity}/日
                            </span>
                          </td>
                          <td className="text-center px-1">
                            {selectedLog.kpi_snapshot_after && (
                              <ArrowRight className="w-4 h-4 inline text-blue-400" />
                            )}
                          </td>
                          <td className="text-right font-semibold px-2">
                            {selectedLog.kpi_snapshot_after ? (
                              <span className="inline-block px-2 py-1 bg-blue-50 rounded text-gray-900">
                                {selectedLog.kpi_snapshot_after.salesVelocity}/日
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="text-right px-2">
                            {selectedLog.kpi_snapshot_after && (() => {
                              const diff = selectedLog.kpi_snapshot_after.salesVelocity - selectedLog.kpi_snapshot_before.salesVelocity
                              const isImproved = diff > 0
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold ${
                                    isImproved
                                      ? 'bg-green-100 text-green-700'
                                      : diff < 0
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {isImproved ? (
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  ) : diff < 0 ? (
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <Minus className="w-3.5 h-3.5" />
                                  )}
                                  {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                </span>
                              )
                            })()}
                          </td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2 text-gray-900 font-medium">現在庫</td>
                          <td className="text-right font-semibold px-2">
                            <span className="inline-block px-2 py-1 bg-gray-100 rounded text-gray-900">
                              {selectedLog.kpi_snapshot_before.currentStock}
                            </span>
                          </td>
                          <td className="text-center px-1">
                            {selectedLog.kpi_snapshot_after && (
                              <ArrowRight className="w-4 h-4 inline text-blue-400" />
                            )}
                          </td>
                          <td className="text-right font-semibold px-2">
                            {selectedLog.kpi_snapshot_after ? (
                              <span className="inline-block px-2 py-1 bg-blue-50 rounded text-gray-900">
                                {selectedLog.kpi_snapshot_after.currentStock}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="text-right px-2">
                            {selectedLog.kpi_snapshot_after && (() => {
                              const diff = selectedLog.kpi_snapshot_after.currentStock - selectedLog.kpi_snapshot_before.currentStock
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold ${
                                    diff > 0
                                      ? 'bg-blue-100 text-blue-700'
                                      : diff < 0
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {diff > 0 ? (
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  ) : diff < 0 ? (
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <Minus className="w-3.5 h-3.5" />
                                  )}
                                  {diff > 0 ? '+' : ''}{diff}
                                </span>
                              )
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 自動コメント */}
              {selectedLog.auto_comment && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    評価コメント
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-900">
                      {selectedLog.auto_comment}
                    </p>
                  </div>
                </div>
              )}

              {/* 評価生成ボタン */}
              {(selectedLog.status === 'approved' || selectedLog.status === 'executed') &&
                selectedLog.kpi_snapshot_before &&
                !selectedLog.kpi_snapshot_after && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleGenerateOutcome}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                    >
                      <Sparkles className="w-5 h-5" />
                      アウトカムを自動生成
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      ※ モックデータとして、ランダムにKPI afterと評価を生成します
                    </p>
                  </div>
                )}

              {/* KPI before がない場合の警告 */}
              {(selectedLog.status === 'approved' || selectedLog.status === 'executed') &&
                !selectedLog.kpi_snapshot_before &&
                !selectedLog.kpi_snapshot_after && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        ⚠️ このアクションはKPI beforeが記録されていないため、評価を生成できません。
                      </p>
                      <p className="text-xs text-yellow-700 mt-2">
                        新しいバージョンではアクション確定時に自動的にKPI beforeが記録されます。
                      </p>
                    </div>
                  </div>
                )}

              {/* メモ */}
              {selectedLog.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    メモ
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedLog.notes}</p>
                  </div>
                </div>
              )}

              {/* メタ情報 */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-gray-600">
                    <span className="font-semibold">実行者:</span>{' '}
                    {selectedLog.owner}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-600">ステータス:</span>
                    {getStatusBadge(selectedLog.status)}
                  </div>
                  <div className="col-span-2 text-gray-600">
                    <span className="font-semibold">タイムスタンプ:</span>{' '}
                    {new Date(selectedLog.timestamp).toLocaleString('ja-JP')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
