# LangChain.js Agent with Next.js

LangChain.js、LangGraph.js、Next.js、Vercel AI SDK を使用したAIエージェントアプリケーションです。

## 技術スタック

- **Next.js 16** - Reactフレームワーク
- **React 19.2.3** - UIライブラリ
- **Vercel AI SDK 6.0.62** - AIアプリケーションフレームワーク
- **LangChain.js 1.2.15** - LLMアプリケーションフレームワーク
- **LangGraph.js 1.1.2** - エージェントの状態管理
- **AWS Bedrock** - LLMプロバイダー（Amazon Novaシリーズ）
- **OpenInference** - OpenTelemetryトレーシング
- **Radix UI** - UIコンポーネント
- **Tailwind CSS 4** - スタイリング
- **TypeScript 5.9.3** - 型定義

## セットアップ

依存関係をインストールします:

```bash
pnpm install
```

## 環境変数

AWS 認証情報が必要です。以下のいずれかの方法で設定してください:

1. AWS 認証情報を環境変数として設定
2. AWS 認証情報を `~/.aws/credentials` に配置
3. IAM ロールを使用

## 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認します。

## ビルド

```bash
pnpm build
```

## 本番環境での実行

```bash
pnpm start
```

## リント

```bash
pnpm lint
```

## テスト

```bash
pnpm vitest
```

## タイプチェック

```bash
pnpm tsc --noEmit
```

## プロジェクト構造

```
.
├── app/                    # Next.js App Router
│   ├── api/chat/          # チャットAPIエンドポイント
│   │   ├── route.ts       # メインのAPIルート
│   │   └── instrumentation.ts  # OpenTelemetryインストゥルメンテーション
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # UIコンポーネント
│   └── ai-elements/      # AI SDK用カスタムコンポーネント
├── lib/                  # ユーティリティ関数
└── public/              # 静的ファイル
```

## 機能

- Amazon Nova シリーズ（Micro / Lite）に対応したAIエージェント
- ストリーミングレスポンス
- ファイル添付サポート
- ソースURL表示
- 推論プロセスの表示
- OpenTelemetryによるトレーシング
