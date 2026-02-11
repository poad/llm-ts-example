#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { AgentAiSdkStack } from '../lib/agent-ai-sdk-stack.js';

const app = new cdk.App();
const stack = new AgentAiSdkStack(app, 'agent-ai-sdk-stack', {
});
cdk.RemovalPolicies.of(stack).apply(cdk.RemovalPolicy.DESTROY);
