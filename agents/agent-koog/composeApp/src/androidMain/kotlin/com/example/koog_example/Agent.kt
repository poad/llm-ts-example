package com.example.koog_example

import ai.koog.agents.core.agent.AIAgent
import ai.koog.agents.core.agent.AIAgentService
import ai.koog.agents.features.opentelemetry.feature.OpenTelemetry
import ai.koog.prompt.executor.clients.bedrock.BedrockModels
import ai.koog.prompt.executor.llms.all.simpleBedrockExecutor
import ai.koog.utils.io.use
import io.opentelemetry.api.common.AttributeKey
import io.opentelemetry.exporter.logging.LoggingSpanExporter
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.TimeUnit

class Agent {

  private val accessKey = BuildConfig.AWS_ACCESS_KEY_ID
  private val secretKey = BuildConfig.AWS_SECRET_ACCESS_KEY
  private val sessionToken = BuildConfig.AWS_SESSION_TOKEN

  private val observabilityBackend = BuildConfig.OTLP_BACKEND // "jaeger", "langfuse", "langsmith"

  private val observabilityEndpoint = BuildConfig.OTLP_ENDPOINT
  private val observabilityHeaders =
    BuildConfig.OTLP_HEADERS // カンマ区切りの "key1:value1,key2:value2" 形式

  private val agent = AIAgentService(
    promptExecutor = simpleBedrockExecutor(accessKey, secretKey, sessionToken),
    llmModel = BedrockModels.AmazonNovaMicro,
    installFeatures = {
      install(OpenTelemetry) {
        setServiceInfo("koog-chat-app", "1.0.0")
        // Add a console logger for local debugging
        addSpanExporter(LoggingSpanExporter.create())

        // バックエンドに応じてエクスポーターを設定
        when (observabilityBackend) {
          "langfuse" -> {
            val builder = OtlpHttpSpanExporter.builder()
              .setTimeout(30, TimeUnit.SECONDS)
              .setEndpoint(observabilityEndpoint) // http://10.0.2.2:4318/v1/traces
            // ヘッダー文字列を安全に分割
            val headerParts = observabilityHeaders.split(":", limit = 2)
            if (headerParts.size == 2) {
              builder.addHeader(headerParts[0], headerParts[1])
            }
            addSpanExporter(
              builder
                .build()
            )
          }

          else -> {
            // Jaeger (HTTP)
            addSpanExporter(
              OtlpHttpSpanExporter.builder()
                .setTimeout(30, TimeUnit.SECONDS)
                .setEndpoint(observabilityEndpoint) // http://10.0.2.2:4318/v1/traces
                .build()
            )
          }
        }

        // 詳細ログを環境に応じて制御
        setVerbose(BuildConfig.DEBUG)

        // リソース属性を追加
        addResourceAttributes(
          mapOf(
            AttributeKey.stringKey("deployment.environment") to "android",
            AttributeKey.stringKey("device.platform") to "Android",
          )
        )
      }
    }
  )

  suspend fun execute(query: String): String {
    return withContext(Dispatchers.IO) {
      try {
        agent.createAgentAndRun(query)
      } catch (e: Exception) {
        "エラーが発生しました: ${e.message}"
      }
    }
  }
}
