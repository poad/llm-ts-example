#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {
  CloudfrontCdnTemplateStack,
  Config,
} from '../lib/cdk-stack.js';

const app = new cdk.App();

interface ConfigProps {
  readonly stackName: string
}

const env = app.node.tryGetContext('env');
const config: Config & ConfigProps = env
  ? app.node.tryGetContext(env)
  : app.node.tryGetContext('default');

const endpoint = app.node.tryGetContext('oai-endpoint');
const instanceName = app.node.tryGetContext('oai-instance-name');
const apiKey = app.node.tryGetContext('oai-api-key');
const apiVersion = app.node.tryGetContext('oai-api-version');

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
  anthoropicApiKey,
  claudeModel,
  env: {
    account: app.account,
    region: app.region,
  },
});
