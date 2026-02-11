# llm-ts-example

LLM (Large Language Model) の実装例を集めたTypeScriptプロジェクトです。LangChain.js、LangGraph.js、Next.js、MCPなど様々なフレームワークとツールを使用したAIエージェントとアプリケーションの実装を紹介しています。

## プロジェクト一覧

### Basic Chat

- [Basic Chat](./basic/) - LangChain.jsとLangGraph.jsを使用した基本的なチャットボット

### RAG (Retrieval Augmented Generation)

- [RAG](./rag/) - LangChain.jsとLangGraph.jsを使用したRAG実装例

### Chat App

- [Chat App](./chat-app/) - Next.jsとAI SDKを使用したチャットアプリケーション

### Agents

- [AI SDK](./agents/agent-ai-sdk/) - Vercel AI SDKとAWS Lambdaによるエージェント実装（Amazon Bedrock/Azure OpenAI対応）
- [Claude Agent SDK](./agents/agent-claude-agent-sdk/) - Claude Agent SDKによるエージェント実装
- [LangChain.js Agent](./agents/agent-langchain/) - LangChain.jsによるエージェント実装
- [LangChain.js Agent (Next.js)](./agents/agent-langchain-nextjs/) - Next.jsとLangChain.jsによるエージェント実装
- [Mastra](./agents/agent-mastra/) - Mastraフレームワークによるエージェント実装
- [Strands TypeScript SDK](./agents/agent-strands/) - Strands TypeScript SDKによるエージェント実装

### MCP (Model Context Protocol)

- [MCP Servers](./mcp/servers/) - MCPサーバーの実装例
  - [Weather](./mcp/servers/weather/) - 天気予報MCPサーバー
  - [Weather HTTP](./mcp/servers/weather-http/) - HTTP経由の天気予報MCPサーバー
- [MCP Clients](./mcp/clients/) - MCPクライアントの実装例
  - [TypeScript Client](./mcp/clients/mcp-client-typescript/) - TypeScriptによるMCPクライアント
  - [HTTP Client](./mcp/clients/mcp-client-http/) - HTTP経由のMCPクライアント

### Common

- [Common](./common/) - 共通ユーティリティとコンポーネント

## 技術スタック

- **言語**: TypeScript
- **パッケージマネージャー**: pnpm
- **LLM**: LangChain.js, LangGraph.js, AI SDK
- **フロントエンド**: Next.js, Solid.js
- **インフラ**: AWS CDK
- **MCP**: Model Context Protocol SDK

## 開発環境のセットアップ

```bash
pnpm install
```

## テスト

```bash
pnpm test
```

## リント

```bash
pnpm lint
```
