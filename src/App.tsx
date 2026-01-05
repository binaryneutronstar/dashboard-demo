import { MetricCard } from './components/dashboard/MetricCard'
import { ChartCard } from './components/dashboard/ChartCard'
import { DataTable } from './components/dashboard/DataTable'
import { metrics, salesData, categoryData, recentTransactions } from './data/mockData'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            ダッシュボード
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="月次売上推移" data={salesData} type="line" />
          <ChartCard title="カテゴリ別売上" data={categoryData} type="bar" />
        </div>

        {/* Transactions Table */}
        <DataTable transactions={recentTransactions} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Dashboard Demo - Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
