export interface MetricData {
  title: string
  value: string
  change: number
  icon: string
}

export interface ChartDataPoint {
  name: string
  value: number
  category?: string
}

export interface Transaction {
  id: string
  customer: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  date: string
}

export const metrics: MetricData[] = [
  {
    title: '総売上',
    value: '¥12,345,678',
    change: 12.5,
    icon: 'trendingUp',
  },
  {
    title: 'アクティブユーザー',
    value: '8,234',
    change: 8.2,
    icon: 'users',
  },
  {
    title: '新規登録',
    value: '1,234',
    change: -3.1,
    icon: 'userPlus',
  },
  {
    title: 'コンバージョン率',
    value: '3.24%',
    change: 5.7,
    icon: 'target',
  },
]

export const salesData: ChartDataPoint[] = [
  { name: '1月', value: 4000 },
  { name: '2月', value: 3000 },
  { name: '3月', value: 5000 },
  { name: '4月', value: 4500 },
  { name: '5月', value: 6000 },
  { name: '6月', value: 5500 },
  { name: '7月', value: 7000 },
  { name: '8月', value: 6500 },
  { name: '9月', value: 8000 },
  { name: '10月', value: 7500 },
  { name: '11月', value: 9000 },
  { name: '12月', value: 10000 },
]

export const categoryData: ChartDataPoint[] = [
  { name: 'エレクトロニクス', value: 4000 },
  { name: 'ファッション', value: 3000 },
  { name: '食品', value: 2000 },
  { name: '書籍', value: 2780 },
  { name: 'その他', value: 1890 },
]

export const recentTransactions: Transaction[] = [
  {
    id: 'TXN001',
    customer: '山田太郎',
    amount: 125000,
    status: 'completed',
    date: '2024-01-15',
  },
  {
    id: 'TXN002',
    customer: '佐藤花子',
    amount: 89000,
    status: 'completed',
    date: '2024-01-15',
  },
  {
    id: 'TXN003',
    customer: '鈴木一郎',
    amount: 45000,
    status: 'pending',
    date: '2024-01-14',
  },
  {
    id: 'TXN004',
    customer: '田中美咲',
    amount: 198000,
    status: 'completed',
    date: '2024-01-14',
  },
  {
    id: 'TXN005',
    customer: '高橋健太',
    amount: 67000,
    status: 'failed',
    date: '2024-01-13',
  },
]
