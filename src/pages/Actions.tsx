import { useState, useEffect } from 'react'
import { ActionLogRepository } from '../repositories/ActionLogRepository'
import type { ActionLog, ActionStatus, ActionType } from '../types/inventory'
import { Clock, Package, TrendingUp, Tag, CheckCircle, XCircle, Circle } from 'lucide-react'

export function Actions() {
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
    setLogs(allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
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

  const getStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case 'proposed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <Circle className="w-3 h-3" />
            提案中
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Circle className="w-3 h-3 fill-current" />
            承認済
          </span>
        )
      case 'executed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            実行済
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            中止
          </span>
        )
    }
  }

  const categories = [...new Set(logs.map((log) => log.category))]

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">アクションログ</h1>
        <p className="text-sm text-gray-600 mt-1">
          実行されたアクションの履歴を確認できます。
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

      {/* ログリスト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ログ一覧 */}
        <div className="space-y-3">
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
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getActionTypeIcon(log.action_type)}
                    <span className="font-semibold text-gray-900">
                      {getActionTypeLabel(log.action_type)}
                    </span>
                  </div>
                  {getStatusBadge(log.status)}
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

        {/* ログ詳細 */}
        <div className="sticky top-4">
          {selectedLog ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                アクション詳細
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    アクションID
                  </p>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedLog.action_id}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    商品情報
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedLog.sku_name} ({selectedLog.sku_id})
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedLog.category} / {selectedLog.region}
                    {selectedLog.store && ` / ${selectedLog.store}`}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    実行日時
                  </p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedLog.timestamp).toLocaleString('ja-JP')}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    担当者
                  </p>
                  <p className="text-sm text-gray-900">{selectedLog.owner}</p>
                </div>

                {selectedLog.notes && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      メモ
                    </p>
                    <p className="text-sm text-gray-900">{selectedLog.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    根拠指標
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-600">現在庫</p>
                      <p className="text-sm font-semibold">
                        {selectedLog.rationale_metrics.currentStock}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">販売速度</p>
                      <p className="text-sm font-semibold">
                        {selectedLog.rationale_metrics.salesVelocity}/日
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">欠品リスク</p>
                      <p className="text-sm font-semibold">
                        {selectedLog.rationale_metrics.stockoutRisk}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">過剰在庫リスク</p>
                      <p className="text-sm font-semibold">
                        {selectedLog.rationale_metrics.excessInventoryRisk}%
                      </p>
                    </div>
                  </div>
                </div>

                {selectedLog.evaluation && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      評価
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm">
                        <span className="font-semibold">結果:</span>{' '}
                        {selectedLog.evaluation.result === 'improved'
                          ? '改善'
                          : selectedLog.evaluation.result === 'neutral'
                          ? '中立'
                          : '悪化'}
                      </p>
                      {selectedLog.evaluation.learnings && (
                        <p className="text-sm mt-2">
                          <span className="font-semibold">学び:</span>{' '}
                          {selectedLog.evaluation.learnings}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                左側からアクションを選択してください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
