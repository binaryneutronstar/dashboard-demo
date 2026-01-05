# 在庫管理アクショナブルダッシュボード

**小売本部向け意思決定支援デモアプリケーション**

このアプリケーションは、在庫データの可視化ではなく、**本部が日々行う意思決定を具体的なアクションとして提案**し、**実行判断の痕跡（ログ）と振り返り（評価）**まで含めた一連の業務ループを再現する非破壊デモです。

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-blue)

## 🎯 コンセプト

### アクショナブルとは？

- **5分以内に「何をすべきか」を理解できる**
- **グラフを見て考えるのではなく、提案に対して判断できる**
- **意思決定 → 実行 → 評価 のループ**を可視化

### 非破壊デモ

- 外部API・DB・認証なし（モックデータのみ）
- 実世界のシステム更新は行わない
- データはブラウザ内（localStorage）で完結
- 初回起動時にサンプルログを自動生成

## ✨ 主な機能

### 1. ダッシュボード（意思決定画面）

**画面の主役は「要対応SKUリスト」**

- 優先度順に表示（欠品リスク・過剰在庫リスクを総合評価）
- 各SKUの詳細指標を一覧表示
  - 現在庫、販売速度、リードタイム
  - 在庫回転日数、欠品リスク、過剰在庫リスク
  - 推奨アクション
- **3種類のアクション**を実行可能：
  1. **発注量調整**（increase/decrease）
  2. **在庫移動**（transfer: 店舗間または倉庫→店舗）
  3. **値下げ/販促**（markdown/promo）

#### アクション実行フロー

1. SKUを選択し、アクションボタンをクリック
2. **確認モーダル**で提案内容と根拠指標を確認
3. 既存アクションがある場合は警告表示
4. 確定すると **ログに記録**され、SKUに「対応中」バッジが表示

### 2. アクションログ（履歴管理）

- 実行/確定されたアクションを一覧表示
- **フィルタリング機能**:
  - アクション種類（発注調整・在庫移動・値下げ/販促）
  - ステータス（提案中・承認済・実行済・中止）
  - カテゴリ
- ログ詳細表示：
  - アクションID、商品情報、実行日時
  - 担当者、メモ
  - 根拠指標のスナップショット
  - 評価（評価済みの場合）

### 3. アクション評価（振り返り）

- 実行したアクションの結果を評価
- **評価項目**:
  - 結果（改善・中立・悪化）
  - 擬似実績（在庫変化・欠品リスク減少・売上変化・粗利変化）
  - 学び・気づき（フリーテキスト）
  - 次のアクション案（フリーテキスト）
- 評価は localStorage に永続化

## 🚀 クイックスタート

### 必要要件

- Node.js 18.x 以上
- npm または yarn

### インストールと起動

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

### 初回起動時

- モックデータ（30件のSKU）が自動生成されます
- サンプルアクションログ（3件）が自動生成されます
- すべてのデータは localStorage に保存されます

### データリセット

画面右上の「データリセット」ボタンで、すべてのアクションログを初期状態に戻せます。

## 📦 プロジェクト構造

```
dashboard-demo/
├── src/
│   ├── types/
│   │   └── inventory.ts           # 型定義
│   ├── data/
│   │   └── inventoryMockData.ts   # モックデータ生成
│   ├── repositories/
│   │   └── ActionLogRepository.ts # localStorage永続化
│   ├── components/
│   │   └── inventory/
│   │       ├── InventoryList.tsx       # SKUリストテーブル
│   │       └── ActionConfirmModal.tsx  # アクション確認モーダル
│   ├── pages/
│   │   ├── Dashboard.tsx          # ダッシュボード
│   │   ├── Actions.tsx            # アクションログ
│   │   └── Review.tsx             # アクション評価
│   ├── App.tsx                    # メインアプリ（タブナビゲーション）
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔧 技術スタック

- **フロントエンド**: React 18.3.1
- **言語**: TypeScript 5.3.3
- **ビルドツール**: Vite 5.0.8
- **スタイリング**: Tailwind CSS 3.4.0
- **アイコン**: Lucide React 0.303.0
- **永続化**: localStorage（ブラウザ内）

## 📊 データ設計

### モックデータの特徴

- **リアルな不確実性**: きれいすぎない数字、外れ値、偏りを含む
- **一貫したロジック**: 欠品リスク・過剰在庫リスク・優先度スコアの計算
- **推奨アクション**: ルールベースで自動生成
  - 欠品リスク高 → 発注増 or 移動
  - 過剰在庫高 → 値下げ/販促 or 移動

### アクションログの構造

```typescript
interface ActionLog {
  action_id: string
  timestamp: string
  sku_id: string
  sku_name: string
  category: string
  region: string
  store?: string
  action_type: 'replenishment_adjust' | 'transfer' | 'markdown_promo'
  action_payload: ActionPayload // 提案内容の詳細
  rationale_metrics: RationaleMetrics // 根拠指標のスナップショット
  status: 'proposed' | 'approved' | 'executed' | 'cancelled'
  owner: string
  notes?: string
  evaluation?: Evaluation // 評価データ
}
```

## 🎓 受け入れ条件（実装確認）

✅ (1) Dashboard で要対応リストが優先度順に表示され、各行に推奨アクションと根拠がある
✅ (2) アクションボタン押下で確認モーダルが出て、確定するとログに残る
✅ (3) Actions ページでログの絞り込み・詳細閲覧ができる
✅ (4) Review ページで評価入力ができ、保存され、再読み込み後も残る
✅ (5) Dashboard 側でアクション済みが表示され、重複アクションに注意喚起が出る

## 🔄 将来の拡張ポイント

このデモは、将来的に実データに差し替えやすい構造になっています。

### Repository 差し替え

現在: `ActionLogRepository` (localStorage)
将来: REST API / GraphQL / Supabase 等に差し替え

```typescript
// 例: API版に差し替え
export class ActionLogApiRepository {
  static async getAll(): Promise<ActionLog[]> {
    const response = await fetch('/api/action-logs')
    return response.json()
  }
  // ... その他のメソッド
}
```

### モックデータ差し替え

現在: `generateInventoryItems()` (ランダム生成)
将来: 実在庫データAPI / CSV インポート等に差し替え

### 認証・マルチユーザー対応

現在: 単一ユーザー（個人デモ）
将来: Auth0 / Firebase Auth 等で認証を追加

### リアルタイム更新

現在: ページリロードで更新
将来: WebSocket / Polling で自動更新

## 📝 スクリプト

```bash
# 開発サーバーを起動
npm run dev

# 本番用にビルド（Vercel用）
npm run build

# GitHub Pages用にビルド
npm run build:gh-pages

# ビルドしたアプリをプレビュー
npm run preview

# Lintを実行
npm run lint
```

## 🌐 デプロイ

### Vercel（推奨）

1. [Vercel](https://vercel.com) にログイン
2. GitHubリポジトリを接続
3. プロジェクト設定:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. デプロイ実行

Vercelは自動的に `base: '/'` でビルドされます。

### GitHub Pages

```bash
# GitHub Pages用にビルド（base: '/dashboard-demo/'）
npm run build:gh-pages

# dist フォルダを gh-pages ブランチにデプロイ
```

## ⚠️ 注意事項

- このアプリケーションは**デモ専用**です。実際の業務システムとしての利用は想定していません。
- データは**ブラウザのlocalStorageに保存**されるため、ブラウザのキャッシュをクリアすると消えます。
- 外部との通信は一切行いません（API呼び出しなし）。

## 📄 ライセンス

Apache License 2.0

## 👤 作者

Dashboard Demo Project

---

**このアプリケーションの目的**: 在庫管理における意思決定のプロセスを「アクション」として明確化し、その実行と評価のループを可視化することで、より良い意思決定を支援すること。
