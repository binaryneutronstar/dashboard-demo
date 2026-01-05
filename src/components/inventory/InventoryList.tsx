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
    let colorClass = 'border-gray-300 text-gray-700 hover:bg-gray-50'

    switch (actionType) {
      case 'replenishment_adjust':
        icon = <TrendingUp className="w-4 h-4" />
        label = '発注調整'
        if (isRecommended) colorClass = 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
        break
      case 'transfer':
        icon = <Package className="w-4 h-4" />
        label = '在庫移動'
        if (isRecommended) colorClass = 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
        break
      case 'markdown_promo':
        icon = <Tag className="w-4 h-4" />
        label = '値下げ/販促'
        if (isRecommended) colorClass = 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
        break
    }

    return (
      <button
        onClick={() => onActionClick(item, actionType)}
        className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${colorClass}`}
        title={isRecommended ? item.recommendedAction?.description : ''}
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              優先度
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              商品名
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              カテゴリ
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              地域/店舗
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
              現在庫
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
              販売速度
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
              欠品リスク
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
              過剰在庫
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              推奨アクション
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
              アクション
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {getPriorityBadge(item.priorityScore)}
                  <span className="text-xs text-gray-500" title={`スコア: ${item.priorityScore}`}>
                    {item.priorityScore}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {item.name}
                  </span>
                  {item.hasActiveAction && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      対応中
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{item.id}</span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {item.category}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {item.region}
                {item.store && (
                  <>
                    <br />
                    <span className="text-xs text-gray-500">{item.store}</span>
                  </>
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                {item.currentStock}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {item.salesVelocity}/日
              </td>
              <td className="px-4 py-3 text-right">
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
              <td className="px-4 py-3 text-right">
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
                      <span className="text-blue-600 font-medium">
                        {item.actionEffect.projectedExcessRisk}%
                      </span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-1">
                  {item.recommendedAction ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        {item.recommendedAction.label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                  {item.actionEffect && (
                    <div className="text-xs text-gray-600 max-w-xs">
                      {item.actionEffect.expectedImpact}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
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
