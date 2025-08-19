
# LangGraph Deep Agent サンプル

LangGraphとMCP（Model Context Protocol）を使用したDeep Agentの実装例です。

## 参考リンク

- [Deep Agents 公式サイト](https://docs.langchain.com/labs/deep-agents/quickstart)

## 概要

`deepagents`ライブラリを使用してDeep Agentを構築し、複数のMCPサーバーと連携して情報収集機能を提供します。

## 主な機能

- Deep Agentアーキテクチャの実装
- MCP統合による機能拡張
- AWS Bedrock連携
- 日本語対応の研究エージェント

## 使用技術

- `deepagents`: Deep Agent作成
- `@langchain/mcp-adapters`: MCPクライアント
- `@langchain/aws`: AWS Bedrock統合
- TypeScript + Node.js

## MCPサーバー

- **Sequential Thinking**: 構造化思考機能
- **Context7**: インターネット検索・情報取得

## 使用方法

```bash
# 開発実行
pnpm dev

# ビルド
pnpm build

# 本番実行
pnpm start

# テスト
pnpm test

# リント
pnpm lint
```

## 設定

- モデル: `openai.gpt-oss-20b-1:0` (AWS Bedrock経由)
- リージョン: us-west-2
- 温度: 0（決定論的応答）
- 最大トークン: 4096
