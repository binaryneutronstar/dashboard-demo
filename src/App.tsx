import { useState, useEffect } from 'react'
import { Package, FileText, Trash2, Info } from 'lucide-react'
import { Dashboard } from './pages/Dashboard'
import { ActionsAndOutcomes } from './pages/ActionsAndOutcomes'
import { ActionLogRepository } from './repositories/ActionLogRepository'

type Tab = 'dashboard' | 'actionsAndOutcomes'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showDemoInfo, setShowDemoInfo] = useState(false)
  const [unevaluatedCount, setUnevaluatedCount] = useState(0)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'ダッシュボード', icon: <Package className="w-5 h-5" /> },
    { id: 'actionsAndOutcomes', label: 'アクション & アウトカム', icon: <FileText className="w-5 h-5" /> },
  ]

  // 未評価アウトカム数を計算
  const updateUnevaluatedCount = () => {
    const logs = ActionLogRepository.getAll()
    const count = logs.filter(
      (log) =>
        (log.status === 'approved' || log.status === 'executed') &&
        log.kpi_snapshot_before &&
        !log.kpi_snapshot_after
    ).length
    setUnevaluatedCount(count)
  }

  // 初期ロード時とタブ切り替え時に更新
  useEffect(() => {
    updateUnevaluatedCount()
  }, [activeTab])

  // カスタムイベントをリスニングして更新
  useEffect(() => {
    const handleLogsUpdate = () => {
      updateUnevaluatedCount()
    }

    window.addEventListener('actionLogsUpdated', handleLogsUpdate)
    return () => {
      window.removeEventListener('actionLogsUpdated', handleLogsUpdate)
    }
  }, [])

  const handleResetData = () => {
    if (
      confirm(
        'すべてのアクションログをリセットします。この操作は取り消せません。よろしいですか？'
      )
    ) {
      ActionLogRepository.clear()
      ActionLogRepository.initializeSampleLogs()
      // カスタムイベントを発火してカウントを更新
      window.dispatchEvent(new Event('actionLogsUpdated'))
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                在庫管理アクショナブルダッシュボード
              </h1>
              <p className="text-sm text-gray-700 mt-1 font-medium">
                小売本部向け意思決定支援デモ
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDemoInfo(!showDemoInfo)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                title="デモについて"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">デモについて</span>
              </button>
              <button
                onClick={handleResetData}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="データをリセット"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">データリセット</span>
              </button>
            </div>
          </div>

          {/* デモ情報パネル */}
          {showDemoInfo && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                このデモについて
              </h3>
              <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                <li>モックデータのみを使用し、外部APIや認証はありません</li>
                <li>データはブラウザのlocalStorageに保存されます</li>
                <li>商品名・拠点名はダミーデータです（実在しません）</li>
                <li>アクションの実行は非破壊的で、実システムへの影響はありません</li>
                <li>評価生成は70%成功/20%中立/10%悪化の確率でランダム生成されます</li>
              </ul>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-4 rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700 bg-white shadow-sm'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-blue-50/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'actionsAndOutcomes' && unevaluatedCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse">
                    {unevaluatedCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'actionsAndOutcomes' && <ActionsAndOutcomes />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            在庫管理アクショナブルダッシュボード - 非破壊デモ（localStorage使用）
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
