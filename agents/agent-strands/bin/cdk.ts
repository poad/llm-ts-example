#!/usr/bin/env node
import {
  CloudfrontCdnTemplateStack,
} from '../lib/cdk-stack.js';
import * as cdk from 'aws-cdk-lib';

const app = new cdk.App();

new CloudfrontCdnTemplateStack(app, 'agent-strands-lambda-example', {
  appName: 'agent-strands-lambda-example',
  env: {
    account: app.account,
    region: app.region,
  },
});
