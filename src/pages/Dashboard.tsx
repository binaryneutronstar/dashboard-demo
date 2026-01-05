import { useState, useEffect } from 'react'
import { InventoryList } from '../components/inventory/InventoryList'
import { ActionConfirmModal } from '../components/inventory/ActionConfirmModal'
import { generateInventoryItems } from '../data/inventoryMockData'
import { ActionLogRepository } from '../repositories/ActionLogRepository'
import type {
  InventoryItem,
  ActionType,
  ActionPayload,
  ActionLog,
  ReplenishmentPayload,
  TransferPayload,
  MarkdownPromoPayload,
} from '../types/inventory'

export function Dashboard() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [selectedActionType, setSelectedActionType] =
    useState<ActionType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionPayload, setActionPayload] = useState<ActionPayload | null>(null)
  const [hasExistingAction, setHasExistingAction] = useState(false)

  useEffect(() => {
    // 初回起動時にサンプルログを初期化
    ActionLogRepository.initializeSampleLogs()

    // 在庫アイテムを生成
    const generatedItems = generateInventoryItems(30)

    // アクティブなアクションがあるSKUをマーク
    const logs = ActionLogRepository.getAll()
    const itemsWithActions = generatedItems.map((item) => {
      const activeLogs = logs.filter(
        (log) =>
          log.sku_id === item.id &&
          (log.status === 'proposed' || log.status === 'approved')
      )
      return {
        ...item,
        hasActiveAction: activeLogs.length > 0,
      }
    })

    setItems(itemsWithActions)
  }, [])

  const handleActionClick = (item: InventoryItem, actionType: ActionType) => {
    setSelectedItem(item)
    setSelectedActionType(actionType)

    // 既存のアクションをチェック
    const existingLogs = ActionLogRepository.getActiveLogsBySku(item.id)
    setHasExistingAction(existingLogs.length > 0)

    // アクションペイロードを生成
    const payload = generateActionPayload(item, actionType)
    setActionPayload(payload)

    setIsModalOpen(true)
  }

  const generateActionPayload = (
    item: InventoryItem,
    actionType: ActionType
  ): ActionPayload => {
    switch (actionType) {
      case 'replenishment_adjust': {
        const currentAmount = Math.round(item.salesVelocity * item.leadTimeDays)
        const shouldIncrease = item.stockoutRisk > 50
        const percentageChange = shouldIncrease ? 50 : -30
        const proposedAmount = Math.round(
          currentAmount * (1 + percentageChange / 100)
        )

        return {
          type: shouldIncrease ? 'increase' : 'decrease',
          currentAmount,
          proposedAmount,
          percentageChange,
        } as ReplenishmentPayload
      }

      case 'transfer': {
        const quantity = Math.round(item.salesVelocity * 7)
        return {
          fromLocation: '倉庫',
          toLocation: item.store || item.region,
          quantity,
        } as TransferPayload
      }

      case 'markdown_promo': {
        const discountRate = item.excessInventoryRisk > 70 ? 30 : 20
        return {
          discountRate,
          promoType: item.excessInventoryRisk > 80 ? 'markdown' : 'promotion',
        } as MarkdownPromoPayload
      }
    }
  }

  const handleConfirm = () => {
    if (!selectedItem || !selectedActionType || !actionPayload) return

    // アクションログを作成
    const actionLog: ActionLog = {
      action_id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      sku_id: selectedItem.id,
      sku_name: selectedItem.name,
      category: selectedItem.category,
      region: selectedItem.region,
      store: selectedItem.store,
      action_type: selectedActionType,
      action_payload: actionPayload,
      rationale_metrics: {
        currentStock: selectedItem.currentStock,
        salesVelocity: selectedItem.salesVelocity,
        leadTimeDays: selectedItem.leadTimeDays,
        inventoryTurnoverDays: selectedItem.inventoryTurnoverDays,
        stockoutRisk: selectedItem.stockoutRisk,
        excessInventoryRisk: selectedItem.excessInventoryRisk,
        priorityScore: selectedItem.priorityScore,
      },
      status: 'approved',
      owner: '在庫管理担当',
      notes: '',
    }

    // ログを保存
    ActionLogRepository.save(actionLog)

    // アイテムの状態を更新
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === selectedItem.id ? { ...item, hasActiveAction: true } : item
      )
    )

    // モーダルを閉じる
    setIsModalOpen(false)
    setSelectedItem(null)
    setSelectedActionType(null)
    setActionPayload(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setSelectedActionType(null)
    setActionPayload(null)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          要対応SKU一覧（優先度順）
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          欠品リスクまたは過剰在庫リスクが高い商品を優先度順に表示しています。
          推奨アクションを確認し、適切な対応を実施してください。
        </p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">総SKU数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">高リスクSKU</p>
          <p className="text-2xl font-bold text-red-700 mt-1">
            {items.filter((item) => item.priorityScore >= 70).length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600">中リスクSKU</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">
            {
              items.filter(
                (item) => item.priorityScore >= 40 && item.priorityScore < 70
              ).length
            }
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">対応中SKU</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {items.filter((item) => item.hasActiveAction).length}
          </p>
        </div>
      </div>

      {/* 在庫リスト */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <InventoryList items={items} onActionClick={handleActionClick} />
      </div>

      {/* アクション確認モーダル */}
      {selectedItem && selectedActionType && actionPayload && (
        <ActionConfirmModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
          item={selectedItem}
          actionType={selectedActionType}
          payload={actionPayload}
          hasExistingAction={hasExistingAction}
        />
      )}
    </div>
  )
}
