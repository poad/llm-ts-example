#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {
  CloudfrontCdnTemplateStack,
} from '../lib/cdk-stack.js';

const app = new cdk.App();

new CloudfrontCdnTemplateStack(app, 'agent-strands-lambda-example', {
  appName: 'agent-strands-lambda-example',
  env: {
    account: app.account,
    region: app.region,
  },
});
