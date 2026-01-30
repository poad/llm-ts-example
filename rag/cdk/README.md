# RAG Chatbot on AWS

RAG (Retrieval Augmented Generation) を使用したチャットボットのAWS CDKデプロイテンプレートです。

## デプロイ

```bash
pnpm install && pnpm dlx aws-cdk@latest deploy
```

## オプション

### OpenInference

以下の環境変数に `true` を指定すると、[OpenInference](https://github.com/Arize-ai/openinference/) による OpenTelemetry (OTel) Tracing の Export が有効になります。

- `ENABLED_OPENINFERENCE_TELEMETRY`

また、OpenInferenceのトレースは環境変数`COLLECTOR_ENDPOINT`で指定された OTel Collector にgRPCで伝送されます。
環境変数`COLLECTOR_ENDPOINT`が未指定の場合は`http://localhost:6006/v1/traces`が使用されます。

ただし、環境変数`ENABLED_OPENINFERENCE_TELEMETRY`に`true`を指定した場合に限ります。
