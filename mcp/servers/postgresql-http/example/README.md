# PostgreSQL HTTP MCP Example

PostgreSQL MCPサーバーのHTTP実装の使用例です。

## セットアップ

Docker Composeを使用してPostgreSQLサーバーを起動します:

```bash
docker compose up -d
```

## 機能

- MCPプロトコルを使用したデータベース操作
- HTTP経由のMCPサーバー通信

## 技術スタック

- **Docker** - コンテナ化
- **PostgreSQL** - データベース
- **MCP SDK** - Model Context Protocol SDK
