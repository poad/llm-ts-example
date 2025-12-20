import org.jetbrains.compose.desktop.application.dsl.TargetFormat
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)

    // Add Kotlin serialization plugin for Koog API support
    kotlin("plugin.serialization") version "2.3.0"
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_17)
        }
    }

    sourceSets {
        androidMain.dependencies {
            implementation(compose.preview)
            implementation(libs.androidx.activity.compose)
        }
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(compose.ui)
            implementation(libs.androidx.material.icons.core)
            implementation(compose.components.resources)
            implementation(compose.components.uiToolingPreview)
            implementation(libs.androidx.lifecycle.viewmodelCompose)
            implementation(libs.androidx.lifecycle.runtimeCompose)
            implementation(libs.opentelemetry.logback.appender.x.x)
            implementation(libs.slf4j.api)
            implementation(libs.logback.android)
        }
        commonTest.dependencies {
            implementation(libs.kotlin.test)
        }
    }
}

android {
    namespace = "com.example.koog_example"
    compileSdk = libs.versions.android.compileSdk.get().toInt()

    defaultConfig {
        applicationId = "com.example.koog_example"
        minSdk = libs.versions.android.minSdk.get().toInt()
        targetSdk = libs.versions.android.targetSdk.get().toInt()
        versionCode = 1
        versionName = "1.0"

        // 環境変数から読み込んでBuildConfigに埋め込む
        buildConfigField("String", "AWS_ACCESS_KEY_ID", "\"${System.getenv("AWS_ACCESS_KEY_ID") ?: ""}\"")
        buildConfigField("String", "AWS_SECRET_ACCESS_KEY", "\"${System.getenv("AWS_SECRET_ACCESS_KEY") ?: ""}\"")
        buildConfigField("String", "AWS_SESSION_TOKEN", "\"${System.getenv("AWS_SESSION_TOKEN") ?: ""}\"")
        buildConfigField("String", "AWS_REGION", "\"${System.getenv("AWS_REGION") ?: "us-west-2"}\"")

        buildConfigField("String", "OTLP_BACKEND", "\"${System.getenv("OTLP_BACKEND") ?: ""}\"")
        buildConfigField("String", "OTLP_ENDPOINT", "\"${System.getenv("OTLP_ENDPOINT") ?: "http://10.0.2.2:4318/v1/traces"}\"")
        buildConfigField("String", "OTLP_HEADERS", "\"${System.getenv("LANGFUSE_API_KEY") ?: ""}\"")
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
        dex {
            useLegacyPackaging = false
        }
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = true
            // 検証コードなのでproguard設定はしない
        }
        getByName("debug") {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    debugImplementation(compose.uiTooling)
    implementation(libs.koog.agents)
    implementation(libs.opentelemetry.exporter.otlp)
    implementation(libs.opentelemetry.exporter.logging)
}

repositories {
  google()
  // Use Maven Central for resolving dependencies.
  mavenCentral()
  // Add JetBrains repository for Koog framework
  maven {
    url = uri("https://packages.jetbrains.team/maven/p/grazi/grazie-platform-public")
  }
}

configurations.all {
  // FIXME exclude netty from Koog dependencies?
  exclude(group = "io.netty", module = "*")
  exclude(group = "org.apache.httpcomponents.httpclient5", module = "*")
  exclude(group = "org.apache.httpcomponents.core5", module = "*")
}
