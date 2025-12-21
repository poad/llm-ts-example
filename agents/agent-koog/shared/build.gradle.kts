import com.codingfeline.buildkonfig.compiler.FieldSpec.Type

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.androidKotlinMultiplatformLibrary)
    alias(libs.plugins.androidLint)
    alias(libs.plugins.buildkonfig)

    // Add Kotlin serialization plugin for Koog API support
    kotlin("plugin.serialization") version "2.3.0"
}

kotlin {

    // Target declarations - add or remove as needed below. These define
    // which platforms this KMP module supports.
    // See: https://kotlinlang.org/docs/multiplatform-discover-project.html#targets
    androidLibrary {
        namespace = "com.example.shared"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
        minSdk = libs.versions.android.minSdk.get().toInt()

        withJava() // enable java compilation support
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)
        }

        withHostTestBuilder {
        }

        withDeviceTestBuilder {
            sourceSetTreeName = "test"
        }.configure {
            instrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        }

        packaging {
            resources {
                excludes += "/META-INF/{AL2.0,LGPL2.1}"
            }
            dex {
                useLegacyPackaging = false
            }
        }
    }

    sourceSets {
        androidMain {
            dependencies {
                implementation(compose.preview)
                implementation(libs.androidx.activity.compose)
                implementation(libs.kotlinx.coroutines.core)
            }
        }
        commonMain {
            // BuildKonfig の出力ディレクトリをソースに追加
            kotlin.srcDir("build/generated/buildkonfig")

            dependencies {
                implementation(libs.kotlin.stdlib)
                implementation(compose.runtime)
                implementation(compose.foundation)
                implementation(compose.material3)
                implementation(compose.ui)
                implementation(libs.androidx.material.icons.core)
                implementation(compose.components.resources)
                implementation(compose.components.uiToolingPreview)
                implementation(libs.androidx.lifecycle.viewmodelCompose)
                implementation(libs.androidx.lifecycle.runtimeCompose)
                implementation(libs.androidx.appcompat)
                implementation(libs.opentelemetry.logback.appender.x.x)
                implementation(libs.slf4j.api)
                implementation(libs.logback.android)
                implementation(libs.koog.agents)
                implementation(libs.opentelemetry.exporter.otlp)
                implementation(libs.opentelemetry.exporter.logging)
                implementation(libs.kermit)
            }
        }
        commonTest {
            dependencies {
                implementation(libs.kotlin.test)
            }
        }

        getByName("androidDeviceTest") {
            dependencies {
                implementation(libs.androidx.runner)
                implementation(libs.androidx.core)
                implementation(libs.androidx.testExt.junit)
            }
        }
    }
}

buildkonfig {
    packageName = "com.example.koog_example"
    defaultConfigs {
        // 環境変数から読み込んでBuildConfigに埋め込む
        buildConfigField(Type.STRING, "AWS_ACCESS_KEY_ID", System.getenv("AWS_ACCESS_KEY_ID") ?: "")
        buildConfigField(
            Type.STRING,
            "AWS_SECRET_ACCESS_KEY",
            System.getenv("AWS_SECRET_ACCESS_KEY") ?: ""
        )
        buildConfigField(Type.STRING, "AWS_SESSION_TOKEN", System.getenv("AWS_SESSION_TOKEN") ?: "")
        buildConfigField(Type.STRING, "AWS_REGION", System.getenv("AWS_REGION") ?: "us-west-2")

        buildConfigField(Type.STRING, "OTLP_BACKEND", System.getenv("OTLP_BACKEND") ?: "")
        buildConfigField(
            Type.STRING,
            "OTLP_ENDPOINT",
            System.getenv("OTLP_ENDPOINT") ?: "http://10.0.2.2:4318/v1/traces"
        )
        buildConfigField(Type.STRING, "OTLP_HEADERS", System.getenv("LANGFUSE_API_KEY") ?: "")
    }
}

// すべての Kotlin コンパイルタスクが BuildKonfig に依存するように設定
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    dependsOn("generateBuildKonfig")
}

configurations.all {
    // FIXME exclude netty from Koog dependencies?
    exclude(group = "io.netty", module = "*")
    exclude(group = "org.apache.httpcomponents.httpclient5", module = "*")
    exclude(group = "org.apache.httpcomponents.core5", module = "*")
}
