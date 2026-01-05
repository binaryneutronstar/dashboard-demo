# ダッシュボード デモ

モダンなビジネスダッシュボードのデモアプリケーションです。React、TypeScript、Tailwind CSSを使用して構築されています。

![Dashboard Demo](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-blue)

## 機能

- 📊 **リアルタイムメトリクス**: 売上、ユーザー数、コンバージョン率などの主要指標を表示
- 📈 **インタラクティブチャート**: Rechartsを使用した月次売上推移とカテゴリ別分析
- 📋 **データテーブル**: 最近の取引履歴を一覧表示
- 📱 **レスポンシブデザイン**: モバイル、タブレット、デスクトップに対応
- 🎨 **モダンUI**: Tailwind CSSによる洗練されたデザイン

## 技術スタック

- **フロントエンド**: React 18.3.1
- **言語**: TypeScript 5.3.3
- **ビルドツール**: Vite 5.0.8
- **スタイリング**: Tailwind CSS 3.4.0
- **チャート**: Recharts 2.10.3
- **アイコン**: Lucide React 0.303.0

## セットアップ

### 必要要件

- Node.js 18.x以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/dashboard-demo.git
cd dashboard-demo

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

開発サーバーは `http://localhost:5173` で起動します。

## スクリプト

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

## プロジェクト構造

```
dashboard-demo/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── MetricCard.tsx      # メトリクス表示カード
│   │   │   ├── ChartCard.tsx       # チャート表示カード
│   │   │   └── DataTable.tsx       # データテーブル
│   │   └── ui/
│   │       └── Card.tsx            # 再利用可能なカードコンポーネント
│   ├── lib/
│   │   └── utils.ts                # ユーティリティ関数
│   ├── data/
│   │   └── mockData.ts             # デモ用モックデータ
│   ├── App.tsx                     # メインアプリコンポーネント
│   ├── main.tsx                    # エントリーポイント
│   └── index.css                   # グローバルスタイル
├── public/                         # 静的ファイル
├── index.html                      # HTMLテンプレート
├── package.json
├── tsconfig.json                   # TypeScript設定
├── vite.config.ts                  # Vite設定
└── tailwind.config.js              # Tailwind CSS設定
```

## カスタマイズ

### モックデータの変更

`src/data/mockData.ts` を編集して、表示するデータをカスタマイズできます。

### テーマの変更

`tailwind.config.js` を編集して、カラーテーマやその他のスタイルをカスタマイズできます。

### 新しいコンポーネントの追加

`src/components/dashboard/` に新しいコンポーネントを追加し、`App.tsx` でインポートして使用します。

## デプロイ

このプロジェクトは、環境変数で `base` パスを切り替えることで、複数のデプロイ先に対応しています。

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
# GitHub リポジトリの Settings → Pages でブランチを gh-pages に設定
```

または、GitHub Actions で自動デプロイを設定することもできます。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 作者

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

プロジェクトリンク: [https://github.com/yourusername/dashboard-demo](https://github.com/yourusername/dashboard-demo)