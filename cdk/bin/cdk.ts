#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {
  CloudfrontCdnTemplateStack,
  Config,
} from '../lib/cdk-stack';

const app = new cdk.App();

const env = app.node.tryGetContext('env',);
const config: Config & { stackName: string } = env
  ? app.node.tryGetContext(env,)
  : app.node.tryGetContext('default',);

const endpoint = app.node.tryGetContext('oai-endpoint',);
const apiKey = app.node.tryGetContext('oai-api-key',);
const deployName = app.node.tryGetContext('oai-deploy',);
const apiVersion = app.node.tryGetContext('oai-api-version',);

new CloudfrontCdnTemplateStack(app, config.stackName, {
  ...config,
  appName: 'llm-ts-example',
  environment: env,
  endpoint,
  apiKey,
  deployName,
  apiVersion,
  env: {
    account: app.account,
    region: app.region,
  },
},);
