plugins {
    // this is necessary to avoid the plugins to be loaded multiple times
    // in each subproject's classloader
    alias(libs.plugins.androidApplication) apply false
    alias(libs.plugins.androidLibrary) apply false
    alias(libs.plugins.kotlinAndroid) apply false
    alias(libs.plugins.composeMultiplatform) apply false
    alias(libs.plugins.composeCompiler) apply false
    alias(libs.plugins.kotlinMultiplatform) apply false
    alias(libs.plugins.androidKotlinMultiplatformLibrary) apply false
    alias(libs.plugins.buildkonfig) apply false
    alias(libs.plugins.androidLint) apply false
}

buildscript {
  dependencies {
    // For KGP
    classpath(libs.kotlin.gradle.plugin)

    // For KSP
    classpath(libs.symbol.processing.gradle.plugin)
  }
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
