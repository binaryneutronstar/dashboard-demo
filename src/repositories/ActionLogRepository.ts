import type { ActionLog, Evaluation } from '../types/inventory'

const STORAGE_KEY = 'inventory_action_logs'

export class ActionLogRepository {
  // 全ログ取得
  static getAll(): ActionLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load action logs:', error)
      return []
    }
  }

  // ID指定で取得
  static getById(actionId: string): ActionLog | null {
    const logs = this.getAll()
    return logs.find((log) => log.action_id === actionId) || null
  }

  // SKU別のアクティブなログを取得
  static getActiveLogsBySku(skuId: string): ActionLog[] {
    const logs = this.getAll()
    return logs.filter(
      (log) =>
        log.sku_id === skuId &&
        (log.status === 'proposed' || log.status === 'approved')
    )
  }

  // 保存（新規または更新）
  static save(log: ActionLog): void {
    try {
      const logs = this.getAll()
      const index = logs.findIndex((l) => l.action_id === log.action_id)

      if (index >= 0) {
        logs[index] = log
      } else {
        logs.push(log)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
    } catch (error) {
      console.error('Failed to save action log:', error)
      throw error
    }
  }

  // ステータス更新
  static updateStatus(actionId: string, status: ActionLog['status']): void {
    const log = this.getById(actionId)
    if (log) {
      log.status = status
      this.save(log)
    }
  }

  // 評価を追加
  static addEvaluation(actionId: string, evaluation: Evaluation): void {
    const log = this.getById(actionId)
    if (log) {
      log.evaluation = evaluation
      this.save(log)
    }
  }

  // 期間フィルタ
  static getByDateRange(startDate: Date, endDate: Date): ActionLog[] {
    const logs = this.getAll()
    return logs.filter((log) => {
      const logDate = new Date(log.timestamp)
      return logDate >= startDate && logDate <= endDate
    })
  }

  // フィルタリング
  static filter(filters: {
    actionType?: string
    status?: string
    category?: string
    region?: string
  }): ActionLog[] {
    let logs = this.getAll()

    if (filters.actionType) {
      logs = logs.filter((log) => log.action_type === filters.actionType)
    }
    if (filters.status) {
      logs = logs.filter((log) => log.status === filters.status)
    }
    if (filters.category) {
      logs = logs.filter((log) => log.category === filters.category)
    }
    if (filters.region) {
      logs = logs.filter((log) => log.region === filters.region)
    }

    return logs
  }

  // 全削除（リセット用）
  static clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  // サンプルログの初期化
  static initializeSampleLogs(): void {
    const existingLogs = this.getAll()
    if (existingLogs.length > 0) return // 既にデータがあれば何もしない

    const sampleLogs: ActionLog[] = [
      {
        action_id: 'sample-001',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
        sku_id: 'SKU-0001',
        sku_name: 'アパレル_商品1',
        category: 'アパレル',
        region: '東京',
        store: '本店',
        action_type: 'replenishment_adjust',
        action_payload: {
          type: 'increase',
          currentAmount: 100,
          proposedAmount: 150,
          percentageChange: 50,
        },
        rationale_metrics: {
          currentStock: 45,
          salesVelocity: 8.5,
          leadTimeDays: 7,
          inventoryTurnoverDays: 5,
          stockoutRisk: 85,
          excessInventoryRisk: 10,
          priorityScore: 82,
        },
        status: 'executed',
        owner: '在庫管理担当A',
        notes: '欠品リスク高のため発注増を承認',
        evaluation: {
          result: 'improved',
          mockMetrics: {
            stockoutReduction: 65,
            stockChange: 105,
            salesChange: 12,
          },
          learnings: '発注増により欠品を回避。売上も12%向上した。',
          nextActions: '同様の販売速度の商品も監視強化',
          evaluatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      },
      {
        action_id: 'sample-002',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        sku_id: 'SKU-0015',
        sku_name: '食品_商品15',
        category: '食品',
        region: '大阪',
        action_type: 'markdown_promo',
        action_payload: {
          discountRate: 20,
          promoType: 'markdown',
        },
        rationale_metrics: {
          currentStock: 450,
          salesVelocity: 2.1,
          leadTimeDays: 5,
          inventoryTurnoverDays: 214,
          stockoutRisk: 5,
          excessInventoryRisk: 88,
          priorityScore: 71,
        },
        status: 'executed',
        owner: '在庫管理担当B',
        notes: '在庫回転が遅く、賞味期限も近いため値下げ実施',
        evaluation: {
          result: 'improved',
          mockMetrics: {
            stockChange: -180,
            salesChange: 45,
            marginChange: -8,
          },
          learnings: '値下げで在庫は減少したが、粗利は低下。早期の判断が重要。',
          nextActions: '賞味期限管理を強化し、早めのアクションを取る',
          evaluatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      },
      {
        action_id: 'sample-003',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        sku_id: 'SKU-0023',
        sku_name: '家電_商品23',
        category: '家電',
        region: '名古屋',
        store: '駅前店',
        action_type: 'transfer',
        action_payload: {
          fromLocation: '倉庫',
          toLocation: '駅前店',
          quantity: 30,
        },
        rationale_metrics: {
          currentStock: 12,
          salesVelocity: 3.2,
          leadTimeDays: 10,
          inventoryTurnoverDays: 4,
          stockoutRisk: 72,
          excessInventoryRisk: 15,
          priorityScore: 68,
        },
        status: 'approved',
        owner: '在庫管理担当C',
        notes: '倉庫に在庫あり。移動で対応',
      },
    ]

    sampleLogs.forEach((log) => this.save(log))
  }
}
