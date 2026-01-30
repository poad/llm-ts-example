# Chat App with AI SDK

Next.jsとAI SDKを使用したチャットアプリケーションです。

## 技術スタック

- **Next.js 16** - Reactフレームワーク
- **AI SDK** - Vercel AI SDK
- **Amazon Bedrock** - LLMプロバイダー
- **Radix UI** - UIコンポーネント
- **Tailwind CSS** - スタイリング
- **Zod** - データバリデーション

## セットアップ

依存関係をインストールします:

```bash
pnpm install
```

環境変数を設定します:

`.env.local` ファイルを作成し、以下の環境変数を設定してください:

```env
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

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
pnpm lint-fix
```
