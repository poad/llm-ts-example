# agent-koog

これは Android をターゲットとした Kotlin Multiplatform プロジェクトです。
Kotlin Multiplatform による Amazon Bedrock を使った Koog によるチャットボットエージェントライブラリと、そのフロントエンドとなる Android アプリです。

- [/app](./app/src)は、フロントエンドとなる Android アプリです。
- [/share](./share/src) は Compose Multiplatformアプリケーション間で共有されるコード用です。

## 環境変数

サンプルアプリのため、AWSの一時的なクレデンシャルや OpenTelemetry Observer の設定はビルド時に環境変数から解決しています。
Android Studio を使用する場合は、Android Studio の起動時に設定されている必要があります。

| 環境変数名 | 必須か？ | 設定する値の説明 | デフォルト値 |
| -------- | ---- | -------------- | ---------- |
| AWS_ACCESS_KEY_ID | 必須 | AWS のアクセスキーID (AWS IAM Identity Center の一時的なクレデンシャルの値で可) | (なし) |
| AWS_SECRET_ACCESS_KEY | 必須 | AWS のシークレットキー (AWS IAM Identity Center の一時的なクレデンシャルの値で可) | (なし) |
| AWS_SESSION_TOKEN | 条件次第 | AWS のセッショントークン (AWS IAM Identity Center の一時的なクレデンシャルの場合は必須) | (なし) |
| AWS_REGION | 任意 | AWS のリージョン | us-west-2 |
| OTLP_BACKEND | 条件次第 | 使用する Observer を指定。指定されない場合や不正値の場合は OpenTelemetry のトレーシングを送信しません。指定可能なObserver は現状、 jaeger または langfuse。※ langfuse は動作未確認 | (なし) |
| OTLP_ENDPOINT | 任意 | OpenTelemetry Observer のエンドポイント URL。OTLP_BACKEND に jaeger または langfuse が指定されている場合にのみ使われます。 | <http://10.0.2.2:4318/v1/traces> |
| OTLP_HEADERS | 任意 | Observer にテレメトリーを送信する際に付与する HTTP リクエストヘッダーを `ヘッダー名:値` 形式で指定できます。複数指定する場合は `,` 区切りとする想定ですが、現状は 1 つのみの指定しか対応していません。 | (なし) |

### macOS で環境変数を設定して Android Studio を起動する方法

```shell
# (環境変数を export で設定)
export AWS_ACCESS_KEY_ID=XXXX
# (環境変数の設定の記述を割愛)

# Android Studio を起動
open -a "Android Studio"
```

## Androidアプリケーションのビルドと実行

Androidアプリの開発バージョンをビルドして実行するには、IDEのツールバーにある実行ウィジェットから実行構成を使用するか、ターミナルから直接ビルドしてください:

- macOS/Linuxの場合

  ```shell
  ./gradlew :composeApp:assembleDebug
  ```

- Windowsの場合

  ```shell
  .\gradlew.bat :composeApp:assembleDebug
  ```

---
[Kotlin Multiplatform](https://www.jetbrains.com/help/kotlin-multiplatform-dev/get-started.html)について詳しく学ぶ…

## 可観測性(Observability)

Langfuse などの SaaS を使用する前に、ローカルで Jaeger を使用して確認して、OpenTelemetry のトレースがきちんと登録できることを確認した上で SaaS を使うことで、アプリ側の計装や Android のネットワーク設定の問題か SaaS との連携固有の問題なのかを切り分けできます。

### Jaeger の起動方法

`$download_url` は <https://www.jaegertracing.io/download/> からダウンロードURLを調べて取得したURLに置き換えてください。

```shell
# Jaeger を起動
curl -sSL "$download_url" -o jaeger.tar.gz
tar -xzf jaeger.tar.gz
cd jaeger
COLLECTOR_OTLP_ENABLED=true ./jaeger \
  --set=receivers.otlp.protocols.grpc.endpoint=0.0.0.0:4317 \
  --set=receivers.otlp.protocols.http.endpoint=0.0.0.0:4318
```

<http://localhost:16686/search> にアクセスしてください
