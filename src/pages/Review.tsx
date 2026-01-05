import { useState, useEffect } from 'react'
import { ActionLogRepository } from '../repositories/ActionLogRepository'
import type {
  ActionLog,
  Evaluation,
  EvaluationResult,
} from '../types/inventory'
import { CheckCircle, XCircle, MinusCircle, Save } from 'lucide-react'

export function Review() {
  const [logs, setLogs] = useState<ActionLog[]>([])
  const [selectedLog, setSelectedLog] = useState<ActionLog | null>(null)
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult>('improved')
  const [learnings, setLearnings] = useState('')
  const [nextActions, setNextActions] = useState('')

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    if (selectedLog?.evaluation) {
      setEvaluationResult(selectedLog.evaluation.result)
      setLearnings(selectedLog.evaluation.learnings)
      setNextActions(selectedLog.evaluation.nextActions)
    } else {
      setEvaluationResult('improved')
      setLearnings('')
      setNextActions('')
    }
  }, [selectedLog])

  const loadLogs = () => {
    const allLogs = ActionLogRepository.getAll()
    // 承認済みまたは実行済みのログのみ
    const reviewableLogs = allLogs.filter(
      (log) => log.status === 'approved' || log.status === 'executed' || log.status === 'cancelled'
    )
    setLogs(
      reviewableLogs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    )
  }

  const generateMockMetrics = (
    log: ActionLog,
    result: EvaluationResult
  ): Evaluation['mockMetrics'] => {
    const { action_type, rationale_metrics } = log

    // 結果に基づいてモック指標を生成
    const isSuccess = result === 'improved'
    const isNeutral = result === 'neutral'

    const metrics: Evaluation['mockMetrics'] = {}

    switch (action_type) {
      case 'replenishment_adjust':
        if (isSuccess) {
          metrics.stockoutReduction = Math.round(
            rationale_metrics.stockoutRisk * 0.6 + Math.random() * 20
          )
          metrics.stockChange = Math.round(
            rationale_metrics.currentStock * 0.4 + Math.random() * 50
          )
          metrics.salesChange = Math.round(5 + Math.random() * 15)
        } else if (isNeutral) {
          metrics.stockoutReduction = Math.round(Math.random() * 20)
          metrics.stockChange = Math.round(Math.random() * 30 - 15)
          metrics.salesChange = Math.round(Math.random() * 10 - 5)
        } else {
          metrics.stockoutReduction = -Math.round(Math.random() * 10)
          metrics.stockChange = -Math.round(Math.random() * 30)
          metrics.salesChange = -Math.round(Math.random() * 10)
        }
        break

      case 'transfer':
        if (isSuccess) {
          metrics.stockoutReduction = Math.round(
            rationale_metrics.stockoutRisk * 0.5
          )
          metrics.salesChange = Math.round(8 + Math.random() * 12)
        } else if (isNeutral) {
          metrics.stockoutReduction = Math.round(Math.random() * 15)
          metrics.salesChange = Math.round(Math.random() * 8 - 4)
        } else {
          metrics.stockoutReduction = -Math.round(Math.random() * 5)
          metrics.salesChange = -Math.round(Math.random() * 8)
        }
        break

      case 'markdown_promo':
        if (isSuccess) {
          metrics.stockChange = -Math.round(
            rationale_metrics.currentStock * 0.4 + Math.random() * 100
          )
          metrics.salesChange = Math.round(20 + Math.random() * 30)
          metrics.marginChange = -Math.round(5 + Math.random() * 10)
        } else if (isNeutral) {
          metrics.stockChange = -Math.round(Math.random() * 50)
          metrics.salesChange = Math.round(Math.random() * 15 - 5)
          metrics.marginChange = -Math.round(Math.random() * 8)
        } else {
          metrics.stockChange = Math.round(Math.random() * 20)
          metrics.salesChange = -Math.round(Math.random() * 10)
          metrics.marginChange = -Math.round(10 + Math.random() * 10)
        }
        break
    }

    return metrics
  }

  const handleSaveEvaluation = () => {
    if (!selectedLog) return

    const mockMetrics = generateMockMetrics(selectedLog, evaluationResult)

    const evaluation: Evaluation = {
      result: evaluationResult,
      mockMetrics,
      learnings,
      nextActions,
      evaluatedAt: new Date().toISOString(),
    }

    ActionLogRepository.addEvaluation(selectedLog.action_id, evaluation)

    // ステータスを更新（評価済みは executed に）
    if (selectedLog.status === 'approved') {
      ActionLogRepository.updateStatus(selectedLog.action_id, 'executed')
    }

    // リロード
    loadLogs()
    alert('評価を保存しました')
  }

  const getResultBadge = (result: EvaluationResult) => {
    switch (result) {
      case 'improved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            改善
          </span>
        )
      case 'neutral':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
            <MinusCircle className="w-4 h-4" />
            中立
          </span>
        )
      case 'worsened':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" />
            悪化
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">アクション評価</h1>
        <p className="text-sm text-gray-600 mt-1">
          実行したアクションの結果を評価し、学びを記録してください。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ログ一覧 */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            評価対象アクション
          </h2>
          {logs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">評価対象のアクションがありません</p>
            </div>
          ) : (
            logs.map((log) => (
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
                  <span className="font-semibold text-gray-900">
                    {log.sku_name}
                  </span>
                  {log.evaluation ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      評価済
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      未評価
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {log.action_type === 'replenishment_adjust'
                    ? '発注調整'
                    : log.action_type === 'transfer'
                    ? '在庫移動'
                    : '値下げ/販促'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleDateString('ja-JP')}
                </p>
              </div>
            ))
          )}
        </div>

        {/* 評価フォーム */}
        <div className="sticky top-4">
          {selectedLog ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                評価入力
              </h3>

              <div className="space-y-6">
                {/* アクション情報 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    対象アクション
                  </p>
                  <p className="text-sm text-gray-900">{selectedLog.sku_name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedLog.category} / {selectedLog.region}
                  </p>
                </div>

                {/* 評価結果 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    結果
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setEvaluationResult('improved')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        evaluationResult === 'improved'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CheckCircle
                        className={`w-6 h-6 mx-auto mb-1 ${
                          evaluationResult === 'improved'
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <p className="text-sm font-medium">改善</p>
                    </button>
                    <button
                      onClick={() => setEvaluationResult('neutral')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        evaluationResult === 'neutral'
                          ? 'border-gray-500 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MinusCircle
                        className={`w-6 h-6 mx-auto mb-1 ${
                          evaluationResult === 'neutral'
                            ? 'text-gray-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <p className="text-sm font-medium">中立</p>
                    </button>
                    <button
                      onClick={() => setEvaluationResult('worsened')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        evaluationResult === 'worsened'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <XCircle
                        className={`w-6 h-6 mx-auto mb-1 ${
                          evaluationResult === 'worsened'
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <p className="text-sm font-medium">悪化</p>
                    </button>
                  </div>
                </div>

                {/* 学び */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    学び・気づき
                  </label>
                  <textarea
                    value={learnings}
                    onChange={(e) => setLearnings(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="このアクションから得られた学びや気づきを記録してください"
                  />
                </div>

                {/* 次のアクション */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    次のアクション案
                  </label>
                  <textarea
                    value={nextActions}
                    onChange={(e) => setNextActions(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="今後取るべきアクションや改善策を記録してください"
                  />
                </div>

                {/* 保存ボタン */}
                <button
                  onClick={handleSaveEvaluation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Save className="w-5 h-5" />
                  評価を保存
                </button>

                {/* 既存の評価 */}
                {selectedLog.evaluation && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      保存済みの評価
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">結果:</span>
                        {getResultBadge(selectedLog.evaluation.result)}
                      </div>
                      {selectedLog.evaluation.mockMetrics && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {Object.entries(selectedLog.evaluation.mockMetrics).map(
                            ([key, value]) =>
                              value !== undefined && (
                                <div key={key} className="text-sm">
                                  <p className="text-xs text-gray-600">
                                    {key === 'stockChange'
                                      ? '在庫変化'
                                      : key === 'stockoutReduction'
                                      ? '欠品リスク減少'
                                      : key === 'salesChange'
                                      ? '売上変化'
                                      : key === 'marginChange'
                                      ? '粗利変化'
                                      : key}
                                  </p>
                                  <p
                                    className={`font-semibold ${
                                      value > 0
                                        ? 'text-green-600'
                                        : value < 0
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {value > 0 ? '+' : ''}
                                    {value}
                                    {key.includes('Risk') ||
                                    key.includes('Change')
                                      ? key.includes('stock') && !key.includes('Risk')
                                        ? ''
                                        : '%'
                                      : ''}
                                  </p>
                                </div>
                              )
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        評価日時:{' '}
                        {new Date(
                          selectedLog.evaluation.evaluatedAt
                        ).toLocaleString('ja-JP')}
                      </p>
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
