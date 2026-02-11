# Agent AI SDK

AWS Lambda上でVercel AI SDKを使用し、Amazon BedrockやAzure OpenAIとの対話を行うエージェントアプリケーションです。

## アーキテクチャ

- **AWS Lambda (Node.js 24.x)**: サーバーレスコンピューティング
- **Lambda Function URL**: エンドポイント公開
- **Amazon Bedrock / Azure OpenAI**: LLMバックエンド
- **Vercel AI SDK**: AI/LLM連携ライブラリ
- **AWS CDK**: インフラストラクチャ管理

## 機能

- ストリーミングレスポンス対応
- ToolLoopAgentによるツール呼び出し
- マルチプロバイダー対応（AWS Bedrock、Azure OpenAI）
- セッション管理
- トークン使用量のログ記録

## 必要条件

- Node.js 24.x
- AWS CLI（設定済み）
- AWS CDK
- pnpm

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# ビルド
pnpm run build

# テスト
pnpm run test
```

## デプロイ

```bash
# CDK bootstrap（初回のみ）
npx cdk bootstrap

# デプロイ
npx cdk deploy
```

デプロイ後、Lambda Function URLが出力されます。

## API使用方法

```bash
curl -X POST <Function URL> \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "こんにちは",
    "modelId": "claude-3-sonnet",
    "session": "session-id",
    "id": "query-id"
  }'
```

### リクエストパラメータ

| パラメータ | 型 | 必須 | 説明 |
| --------- | ---- | ---- | ---- |
| `prompt` | string | 是 | ユーザーの入力プロンプト |
| `modelId` | string | 是 | 使用するモデルID |
| `session` | string | 任意 | セッション識別子 |
| `id` | string | 任意 | クエリ識別子 |

## プロジェクト構造

```text
.
├── bin/
│   └── agent-ai-sdk.ts      # CDKエントリポイント
├── lib/
│   └── agent-ai-sdk-stack.ts # CDKスタック定義
├── lambda/
│   ├── index.ts             # Lambdaハンドラー
│   └── handler.ts           # ビジネスロジック
├── test/
│   └── agent-ai-sdk.test.ts # テスト
└── cdk.json                 # CDK設定
```

## 開発コマンド

| コマンド | 説明 |
| ------- | ---- |
| `pnpm run build` | TypeScriptコンパイル |
| `pnpm run watch` | 変更監視モード |
| `pnpm run test` | テスト実行 |
| `npx cdk deploy` | スタックデプロイ |
| `npx cdk diff` | 差分確認 |
| `npx cdk synth` | CloudFormationテンプレート生成 |

## Agents

本プロジェクトは Vercel AI SDK の `ToolLoopAgent` を使用して、LLMとの対話を行います。

### ToolLoopAgent の構成

```typescript
const agent = new ToolLoopAgent({
  model,                              // LLMモデルインスタンス
  instructions: 'You are a helpful assistant.',  // システムプロンプト
  tools: {                            // ツール定義（オプション）
    // カスタムツールをここに追加
  },
  experimental_telemetry: {           // テレメトリ設定（オプション）
    isEnabled: true,
    metadata: {
      model: modelId,
      thread_id: session,
      query_id: id,
    }
  },
});
```

### ツールの追加方法

ToolLoopAgent はツール呼び出しを自動的にループ処理します。カスタムツールを追加する場合:

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const agent = new ToolLoopAgent({
  model,
  instructions: 'You are a helpful assistant.',
  tools: {
    getWeather: tool({
      description: '指定された都市の天気を取得します',
      parameters: z.object({
        city: z.string().describe('都市名'),
      }),
      execute: async ({ city }) => {
        // 天気APIを呼び出す処理
        return { temperature: 25, condition: 'sunny' };
      },
    }),
    // 他のツールを追加...
  },
});
```

### ストリーミング設定

スムーズなストリーミングレスポンスを実現するため、`smoothStream` を使用:

```typescript
const stream = await agent.stream({
  messages,
  experimental_transform: smoothStream({
    delayInMs: 20,      // チャンク間の遅延（デフォルト: 10ms）
    chunking: 'line',   // チャンク分割方法: 'word' | 'line'（デフォルト: 'word'）
  }),
});
```

### ステップ完了コールバック

各ステップ（ツール呼び出しや応答生成）完了時の処理:

```typescript
const stream = await agent.stream({
  messages,
  onStepFinish: async ({ usage, finishReason, toolCalls }) => {
    // トークン使用量の記録
    logger.info('Step completed:', {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      finishReason,           // 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other'
      toolsUsed: toolCalls?.map(tc => tc.toolName),
    });
  },
});
```

### セッション管理

会話履歴はメモリ内に保持され、複数ターンの対話が可能:

```typescript
const messages: ModelMessage[] = [];

// ユーザー入力を追加
messages.push({ role: 'user', content: prompt });

// エージェント実行
const stream = await agent.stream({ messages });

// アシスタント応答を履歴に追加
messages.push({ role: 'assistant', content: response });
```

**注意**: Lambdaのステートレス性により、セッションは同じLambdaインスタンス内でのみ保持されます。

## モデル設定

使用可能なモデルは `common-core` パッケージの `models` で定義されています。対応プラットフォーム:

- **AWS**: Amazon Bedrock
- **Azure**: Azure OpenAI

## IAMポリシー

Lambda実行ロールには以下の権限が付与されています:

- `AWSLambdaExecute`
- `CloudFrontReadOnlyAccess`
- `bedrock:InvokeModel*`
- `logs:PutLogEvents`

## ライセンス

MIT
