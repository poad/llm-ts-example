# Weather MCP Server

TypeScriptで実装された天気予報MCP (Model Context Protocol) サーバーです。

## セットアップ

依存関係をインストールします:

```bash
pnpm install
```

## ビルド

```bash
pnpm build
```

## 実行

```bash
node build/index.js
```

## 機能

- 日本の天気予報情報を提供
- MCPプロトコルに準拠したサーバー実装

## 技術スタック

- **TypeScript** - プログラミング言語
- **MCP SDK** - Model Context Protocol SDK
- **Zod** - データバリデーション
