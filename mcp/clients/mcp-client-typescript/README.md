# MCP Client with Amazon Bedrock

Amazon Bedrockを使用したMCP (Model Context Protocol) クライアントのTypeScript実装です。

参考: <https://community.aws/content/2v8m09JtrzZ4VVsOD4mBflVZqq3/yet-another-mcp-client-for-bedrock>

## セットアップ

依存関係をインストールします:

```bash
pnpm -r build
```

`.env` ファイルを作成し、必要な環境変数を設定してください。

## 実行

```bash
node build/index.js
```

## 機能

- Amazon Bedrockとの統合
- MCPプロトコルを使用したツール呼び出し
- TypeScriptによる型安全な実装

## 技術スタック

- **TypeScript** - プログラミング言語
- **MCP SDK** - Model Context Protocol SDK
- **Amazon Bedrock SDK** - AWS SDK for JavaScript
