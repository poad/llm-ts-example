package com.example.shared

import ai.koog.agents.core.agent.AIAgentService
import ai.koog.agents.features.opentelemetry.feature.OpenTelemetry
import ai.koog.prompt.executor.clients.bedrock.BedrockClientSettings
import ai.koog.prompt.executor.clients.bedrock.BedrockModels
import ai.koog.prompt.executor.llms.all.simpleBedrockExecutor
import com.example.koog_example.BuildKonfig
import io.opentelemetry.api.common.AttributeKey
import io.opentelemetry.exporter.logging.LoggingSpanExporter
import io.opentelemetry.exporter.otlp.http.trace.OtlpHttpSpanExporter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import co.touchlab.kermit.Logger
import java.util.concurrent.TimeUnit

class Agent {

    private val accessKey = BuildKonfig.AWS_ACCESS_KEY_ID
    private val secretKey = BuildKonfig.AWS_SECRET_ACCESS_KEY
    private val sessionToken = BuildKonfig.AWS_SESSION_TOKEN
    private val region = BuildKonfig.AWS_REGION

    private val observabilityBackend = BuildKonfig.OTLP_BACKEND // "jaeger", "langfuse", "langsmith"

    private val observabilityEndpoint = BuildKonfig.OTLP_ENDPOINT
    private val observabilityHeaders = BuildKonfig.OTLP_HEADERS // カンマ区切りの "key1:value1,key2:value2" 形式

    private val agent = AIAgentService.Companion(
        promptExecutor = simpleBedrockExecutor(
            accessKey,
            secretKey,
            sessionToken,
            BedrockClientSettings(region)
        ),
        llmModel = BedrockModels.AmazonNovaMicro,
        installFeatures = {
            // バックエンドに応じてエクスポーターを設定
            when (observabilityBackend) {
                "langfuse" -> {
                    install(OpenTelemetry.Feature) {
                        setServiceInfo("koog-chat-app", "1.0.0")
                        // Add a console logger for local debugging
                        addSpanExporter(LoggingSpanExporter.create())

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

                        // リソース属性を追加
                        addResourceAttributes(
                            mapOf(
                                AttributeKey.stringKey("deployment.environment") to "android",
                                AttributeKey.stringKey("device.platform") to "Android",
                            )
                        )
                    }

                }
                "jaeger" -> {
                    install(OpenTelemetry.Feature) {
                        setServiceInfo("koog-chat-app", "1.0.0")
                        // Add a console logger for local debugging
                        addSpanExporter(LoggingSpanExporter.create())
                        // Jaeger (HTTP)
                        addSpanExporter(
                            OtlpHttpSpanExporter.builder()
                                .setTimeout(30, TimeUnit.SECONDS)
                                .setEndpoint(observabilityEndpoint) // http://10.0.2.2:4318/v1/traces
                                .build()
                        )
                        // リソース属性を追加
                        addResourceAttributes(
                            mapOf(
                                AttributeKey.stringKey("deployment.environment") to "android",
                                AttributeKey.stringKey("device.platform") to "Android",
                            )
                        )
                    }
                }
            }
        }
    )

    private val logger = Logger.withTag("Agent")

    suspend fun execute(query: String): String {
        return withContext(Dispatchers.IO) {
            try {
                agent.createAgentAndRun(query)
            } catch (e: Exception) {
                logger.e("エラー", e)
                "エラーが発生しました: ${e.message}"
            }
        }
    }
}