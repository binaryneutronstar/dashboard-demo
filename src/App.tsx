import { useState } from 'react'
import { Package, FileText, Trash2 } from 'lucide-react'
import { Dashboard } from './pages/Dashboard'
import { ActionsAndOutcomes } from './pages/ActionsAndOutcomes'
import { ActionLogRepository } from './repositories/ActionLogRepository'

type Tab = 'dashboard' | 'actionsAndOutcomes'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'ダッシュボード', icon: <Package className="w-5 h-5" /> },
    { id: 'actionsAndOutcomes', label: 'アクション & アウトカム', icon: <FileText className="w-5 h-5" /> },
  ]

  const handleResetData = () => {
    if (
      confirm(
        'すべてのアクションログをリセットします。この操作は取り消せません。よろしいですか？'
      )
    ) {
      ActionLogRepository.clear()
      ActionLogRepository.initializeSampleLogs()
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                在庫管理アクショナブルダッシュボード
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                小売本部向け意思決定支援デモ
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="データをリセット"
            >
              <Trash2 className="w-4 h-4" />
              データリセット
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
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
