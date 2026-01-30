# HTTP MCP Client with Amazon Bedrock

HTTP経由でMCPサーバーと通信するAmazon Bedrockクライアントです。

## セットアップ

依存関係をインストールします:

```bash
pnpm -r build
```

## 実行

Weather HTTPサーバーとHTTP MCPクライアントを並行して実行します:

```bash
pnpm -r --parallel --filter weather-http --filter mcp-client-http start
```

## 機能

- HTTP経由のMCPサーバー通信
- Amazon Bedrockとの統合
- 並行実行による効率的な開発

## 技術スタック

- **TypeScript** - プログラミング言語
- **MCP SDK** - Model Context Protocol SDK
- **Amazon Bedrock SDK** - AWS SDK for JavaScript
- **pnpm workspaces** - モノレpo管理
