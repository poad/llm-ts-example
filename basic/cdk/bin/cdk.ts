#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {
  CloudfrontCdnTemplateStack,
  Config,
} from '../lib/cdk-stack.js';

const app = new cdk.App();

interface ConfigProps { stackName: string }

const env = app.node.tryGetContext('env');
const config: Config & ConfigProps = env
  ? app.node.tryGetContext(env)
  : app.node.tryGetContext('default');

const endpoint = app.node.tryGetContext('oai-endpoint');
const instanceName = app.node.tryGetContext('oai-instance-name');
const apiKey = app.node.tryGetContext('oai-api-key');
const apiVersion = app.node.tryGetContext('oai-api-version');

const langfusePk: string | undefined = app.node.tryGetContext('langfuse-public-key');
const langfuseSk: string | undefined = app.node.tryGetContext('langfuse-secret-key');
const langfuseEndpoint: string = app.node.tryGetContext('langfuse-endpoint') ?? 'https://us.cloud.langfuse.com';

const langsmithApiKey: string | undefined = app.node.tryGetContext('langsmith-api-key');
const langfuseProject: string | undefined = app.node.tryGetContext('langsmith-project');
const langsmithEndpoint: string = app.node.tryGetContext('langsmith-endpoint') ?? 'https://api.smith.langchain.com';

const langfuse = langfuseSk && langfusePk ? {
  sk: langfuseSk,
  pk: langfusePk,
  endpoint: langfuseEndpoint,
} : undefined;

const langsmith = langsmithApiKey && langfuseProject ? {
  apiKey: langsmithApiKey,
  project: langfuseProject,
  endpoint: langsmithEndpoint,
} : undefined;

const anthoropicApiKey = app.node.tryGetContext('anthropic-api-key');
const claudeModel  = app.node.tryGetContext('claude-model');

new CloudfrontCdnTemplateStack(app, config.stackName, {
  appName: 'llm-ts-example',
  bucketName: config.bucketName,
  cloudfront: config.cloudfront,
  environment: env,
  endpoint,
  instanceName,
  apiKey,
  apiVersion,
  langfuse,
  anthoropicApiKey,
  claudeModel,
  env: {
    account: app.account,
    region: app.region,
  },
  langsmith,
});
