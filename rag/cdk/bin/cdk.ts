#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {
  CloudfrontCdnTemplateStack,
  Config,
} from '../lib/cdk-stack.js';

const app = new cdk.App();

const env = app.node.tryGetContext('env');
const config: Config & { stackName: string } = env
  ? app.node.tryGetContext(env)
  : app.node.tryGetContext('default');

const endpoint = app.node.tryGetContext('oai-endpoint');
const instanceName = app.node.tryGetContext('oai-instance-name');
const apiKey = app.node.tryGetContext('oai-api-key');
const embeddingsDeployName = app.node.tryGetContext('oai-embeddings-deploy');
const apiVersion = app.node.tryGetContext('oai-api-version');

const pineconeIndex = app.node.tryGetContext('pinecone-index');
const pineconeApiKey = app.node.tryGetContext('pinecone-api-key');

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

const pinecone = {
  index: pineconeIndex ?? '',
  apiKey: pineconeApiKey,
};

new CloudfrontCdnTemplateStack(app, config.stackName, {
  appName: 'rag-example',
  bucketName: config.bucketName,
  cloudfront: config.cloudfront,
  environment: env,
  endpoint,
  instanceName,
  apiKey,
  embeddingsDeployName,
  apiVersion,
  langfuse,
  pinecone,
  env: {
    account: app.account,
    region: app.region,
  },
  langsmith,
});
