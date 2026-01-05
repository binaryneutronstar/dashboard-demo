import { X } from 'lucide-react'
import type {
  InventoryItem,
  ActionType,
  ActionPayload,
} from '../../types/inventory'

interface ActionConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  item: InventoryItem
  actionType: ActionType
  payload: ActionPayload
  hasExistingAction: boolean
}

export function ActionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  actionType,
  payload,
  hasExistingAction,
}: ActionConfirmModalProps) {
  if (!isOpen) return null

  const getActionTitle = () => {
    switch (actionType) {
      case 'replenishment_adjust':
        return '発注量調整'
      case 'transfer':
        return '在庫移動'
      case 'markdown_promo':
        return '値下げ/販促'
    }
  }

  const getPayloadDescription = () => {
    if ('type' in payload && (payload.type === 'increase' || payload.type === 'decrease')) {
        return (
          <div>
            <p className="text-sm mb-2">
              <span className="font-semibold">現在発注量:</span>{' '}
              {(payload as any).currentAmount}
            </p>
            <p className="text-sm mb-2">
              <span className="font-semibold">提案発注量:</span>{' '}
              {(payload as any).proposedAmount}
            </p>
            <p className="text-sm">
              <span className="font-semibold">変更率:</span>{' '}
              <span
                className={
                  (payload as any).percentageChange > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {(payload as any).percentageChange > 0 ? '+' : ''}
                {(payload as any).percentageChange}%
              </span>
            </p>
          </div>
        )
    } else if ('fromLocation' in payload) {
          return (
            <div>
              <p className="text-sm mb-2">
                <span className="font-semibold">移動元:</span>{' '}
                {(payload as any).fromLocation}
              </p>
              <p className="text-sm mb-2">
                <span className="font-semibold">移動先:</span>{' '}
                {(payload as any).toLocation}
              </p>
              <p className="text-sm">
                <span className="font-semibold">数量:</span>{' '}
                {(payload as any).quantity}
              </p>
            </div>
          )
    } else {
      return (
            <div>
              <p className="text-sm mb-2">
                <span className="font-semibold">値下げ率:</span>{' '}
                {(payload as any).discountRate}%
              </p>
              <p className="text-sm">
                <span className="font-semibold">タイプ:</span>{' '}
                {(payload as any).promoType === 'markdown'
                  ? '値下げ'
                  : '販促'}
              </p>
            </div>
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {getActionTitle()}の確認
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {item.name} ({item.category} / {item.region})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 既存アクション警告 */}
        {hasExistingAction && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ この商品には既にアクティブなアクションが存在します。
              重複実行にご注意ください。
            </p>
          </div>
        )}

        {/* 提案内容 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            提案内容
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            {getPayloadDescription()}
          </div>
        </div>

        {/* 根拠指標 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            根拠指標
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">現在庫</p>
              <p className="text-sm font-semibold">{item.currentStock}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">販売速度</p>
              <p className="text-sm font-semibold">
                {item.salesVelocity}/日
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">欠品リスク</p>
              <p
                className={`text-sm font-semibold ${
                  item.stockoutRisk > 70
                    ? 'text-red-600'
                    : item.stockoutRisk > 40
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {item.stockoutRisk}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">過剰在庫リスク</p>
              <p
                className={`text-sm font-semibold ${
                  item.excessInventoryRisk > 70
                    ? 'text-red-600'
                    : item.excessInventoryRisk > 40
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {item.excessInventoryRisk}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">在庫回転日数</p>
              <p className="text-sm font-semibold">
                {item.inventoryTurnoverDays}日
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">リードタイム</p>
              <p className="text-sm font-semibold">{item.leadTimeDays}日</p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            確定して実行
          </button>
        </div>
      </div>
    </div>
  )
}
