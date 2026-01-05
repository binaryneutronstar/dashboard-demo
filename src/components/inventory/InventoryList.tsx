import { AlertCircle, TrendingUp, Package, Tag, ArrowDown } from 'lucide-react'
import type { InventoryItem, ActionType } from '../../types/inventory'

interface InventoryListProps {
  items: InventoryItem[]
  onActionClick: (item: InventoryItem, actionType: ActionType) => void
}

export function InventoryList({ items, onActionClick }: InventoryListProps) {
  const getPriorityBadge = (score: number) => {
    if (score >= 70) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          高
        </span>
      )
    } else if (score >= 40) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          中
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          低
        </span>
      )
    }
  }

  const getActionButton = (item: InventoryItem, actionType: ActionType) => {
    const isRecommended =
      item.recommendedAction && item.recommendedAction.type === actionType

    let icon
    let label
    let buttonClass = ''

    switch (actionType) {
      case 'replenishment_adjust':
        icon = <TrendingUp className="w-3.5 h-3.5" />
        label = '発注'
        buttonClass = isRecommended
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm'
          : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
        break
      case 'transfer':
        icon = <Package className="w-3.5 h-3.5" />
        label = '移動'
        buttonClass = isRecommended
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm'
          : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
        break
      case 'markdown_promo':
        icon = <Tag className="w-3.5 h-3.5" />
        label = '販促'
        buttonClass = isRecommended
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm'
          : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
        break
    }

    return (
      <button
        onClick={() => onActionClick(item, actionType)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-xs font-semibold transition-all ${buttonClass}`}
        title={isRecommended ? item.recommendedAction?.description : ''}
      >
        {icon}
        <span>{label}</span>
      </button>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100">
            <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
              優先度
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
              商品名
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
              カテゴリ
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
              地域/店舗
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
              現在庫
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
              販売速度
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
              欠品リスク
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
              過剰在庫
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
              推奨アクション
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              アクション
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {items.map((item, index) => (
            <tr
              key={item.id}
              className={`hover:bg-blue-50/50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              }`}
            >
              <td className="px-3 py-2 border-r border-gray-100">
                <div className="flex items-center gap-1.5">
                  {getPriorityBadge(item.priorityScore)}
                  <span className="text-xs text-gray-500 font-mono" title={`スコア: ${item.priorityScore}`}>
                    {item.priorityScore}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 border-r border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {item.name}
                    </span>
                    {item.hasActiveAction && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        対応中
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{item.id}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-sm text-gray-700 font-medium border-r border-gray-100">
                {item.category}
              </td>
              <td className="px-3 py-2 text-sm text-gray-700 border-r border-gray-100">
                <div className="font-medium">{item.region}</div>
                {item.store && (
                  <div className="text-xs text-gray-500 mt-0.5">{item.store}</div>
                )}
              </td>
              <td className="px-3 py-2 text-right text-sm font-bold text-gray-900 border-r border-gray-100">
                {item.currentStock}
              </td>
              <td className="px-3 py-2 text-right text-sm text-gray-700 border-r border-gray-100">
                <span className="font-semibold">{item.salesVelocity}</span><span className="text-xs text-gray-500">/日</span>
              </td>
              <td className="px-3 py-2 text-right border-r border-gray-100">
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-sm font-semibold ${
                      item.stockoutRisk > 70
                        ? 'text-red-600'
                        : item.stockoutRisk > 40
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {item.stockoutRisk}%
                  </span>
                  {item.actionEffect && item.actionEffect.projectedStockoutRisk !== item.stockoutRisk && (
                    <div className="flex items-center gap-1 text-xs">
                      <ArrowDown className="w-3 h-3 text-blue-600" />
                      <span className="text-blue-600 font-medium">
                        {item.actionEffect.projectedStockoutRisk}%
                      </span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 text-right border-r border-gray-100">
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-sm font-semibold ${
                      item.excessInventoryRisk > 70
                        ? 'text-red-600'
                        : item.excessInventoryRisk > 40
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {item.excessInventoryRisk}%
                  </span>
                  {item.actionEffect && item.actionEffect.projectedExcessRisk !== item.excessInventoryRisk && (
                    <div className="flex items-center gap-1 text-xs">
                      <ArrowDown className="w-3 h-3 text-blue-600" />
                      <span className="text-blue-600 font-semibold">
                        {item.actionEffect.projectedExcessRisk}%
                      </span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 border-r border-gray-100">
                <div className="space-y-1.5">
                  {item.recommendedAction ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700">
                          {item.recommendedAction.label}
                        </span>
                      </div>
                      {item.actionEffect && (
                        <div className="inline-block px-2 py-1 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded text-xs text-emerald-800 font-medium">
                          💡 {item.actionEffect.expectedImpact}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1.5">
                  {getActionButton(item, 'replenishment_adjust')}
                  {getActionButton(item, 'transfer')}
                  {getActionButton(item, 'markdown_promo')}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
