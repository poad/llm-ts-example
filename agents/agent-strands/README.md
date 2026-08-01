# Agent（Bedrock AgentCore Runtime 上で動作する AI エージェント）

[Strands Agents SDK](https://github.com/strands-agents/sdk)（TypeScript）を使って実装された、Amazon Bedrock AgentCore Runtime 上で動作する AI エージェントです。AWS のシステムアーキテクチャ設計を支援するアシスタントとして動作します。

## 概要

- **モデル**：Amazon Bedrock の基盤モデル（呼び出し時にモデル ID を指定、デフォルトは `us.amazon.nova-micro-v1:0`）
- **リージョン**：`us-east-1`
- **ツール**：`aws-knowledge-mcp-server`（`https://knowledge-mcp.global.api.aws`）を MCP（Model Context Protocol）経由で利用し、AWS ドキュメントに基づいた回答・アーキテクチャ提案を行う
- **システムプロンプト**：AWS 知識に基づいて回答し、情報がなければ「わからない」と明言する／出典を明示する／複数のアーキテクチャパターンを提示する／質問と同じ言語で応答する、という方針で構成
- **実行環境**：`bedrock-agentcore` パッケージの `BedrockAgentCoreApp` を使い、AgentCore Runtime の呼び出し（invocation）ハンドラとしてリクエストを受け付け、SSE（Server-Sent Events）でテキストデルタをストリーミング返却

## ディレクトリ構成

agent/
├── src/
│   ├── index.ts                          # AgentCore Runtime のエントリポイント（リクエスト受付・ストリーミング応答）
│   ├── agent.ts                          # Strands Agent の生成・OTel トレーサーの初期化
│   ├── logger.ts                         # AWS Lambda Powertools ベースのロガー
│   ├── tools/
│   │   └── aws-tool.ts                   # aws-knowledge-mcp-server への MCP クライアント／ツール一覧取得
│   └── observability/
│       ├── exporters.ts                  # OTel の Trace/Logs/Metrics エクスポーター初期化（Databricks 送信）
│       └── access-token-manager.ts       # Databricks OAuth M2M アクセストークンのメモリキャッシュ管理
├── package.json
├── tsconfig.json
└── vite.config.ts

## リクエスト仕様

`POST` で送信されたペイロードは以下のスキーマで検証されます。

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `message` | string | `"こんにちは！"` | ユーザーからの入力メッセージ |
| `model` | string | `"us.amazon.nova-micro-v1:0"` | 使用する Bedrock モデル ID |

応答は SSE イベント（`event: message`、`data: { text: string }`）としてストリーミングされます。

## Observability（可観測性）

`ENABLE_TRACING` / `ENABLE_LOGS` / `ENABLE_METRICS` の環境変数（`"true"` 文字列）により、OpenTelemetry の Trace・Logs・Metrics をそれぞれ有効化できます。有効化した場合、Databricks の OTLP/HTTP エンドポイント（Unity Catalog テーブル）へエクスポートされます。

必要な環境変数：

| 環境変数 | 説明 |
| --- | --- |
| `DATABRICKS_WORKSPACE_URL` | Databricks ワークスペースの URL |
| `DATABRICKS_OAUTH_CLIENT_ID` | サービスプリンシパルのクライアント ID |
| `DATABRICKS_OAUTH_CLIENT_SECRET` | サービスプリンシパルのシークレット |
| `DATABRICKS_UC_SCHEMA_NAME` | Unity Catalog のスキーマ名 |
| `DATABRICKS_UC_TABLE_PREFIX` | 送信先テーブル名のプレフィックス（例：`{prefix}_otel_spans`） |

Databricks 側の設定が不足している場合は Observability 機能をスキップし、通常どおりエージェントは動作します。

## よく使うコマンド

```bash
pnpm build       # rimraf で dist/.agentcore-staging をクリーンアップ → vite build → 本番用依存関係を .agentcore-staging に展開
pnpm watch       # ファイル変更を監視してビルド
pnpm test        # vitest によるユニットテスト
pnpm lint        # ESLint
pnpm lint-fix    # ESLint（自動修正）
```

`pnpm build` で生成される `agent/.agentcore-staging` は、`cdk/` の `AgentCoreStack`（`AgentRuntimeArtifact.fromCodeAsset()`）から直接参照され、AgentCore Runtime のデプロイアセットとして使われます（ECR は使用しません）。

## 関連

- インフラ定義：[../cdk/README.md](../cdk/README.md)
- チャット UI：[../frontend/README.md](../frontend/README.md)
