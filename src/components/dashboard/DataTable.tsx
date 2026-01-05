import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { formatCurrency } from '../../lib/utils'
import type { Transaction } from '../../data/mockData'

interface DataTableProps {
  transactions: Transaction[]
}

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
}

const statusLabels = {
  completed: '完了',
  pending: '保留中',
  failed: '失敗',
}

export function DataTable({ transactions }: DataTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近の取引</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  取引ID
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  顧客名
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  金額
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  ステータス
                </th>
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  日付
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="py-3 text-sm text-gray-900">
                    {transaction.customer}
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        statusColors[transaction.status]
                      }`}
                    >
                      {statusLabels[transaction.status]}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {transaction.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
