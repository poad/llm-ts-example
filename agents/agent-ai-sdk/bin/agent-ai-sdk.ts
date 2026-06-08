#!/usr/bin/env node
import { AgentAiSdkStack } from '../lib/agent-ai-sdk-stack.js';
import * as cdk from 'aws-cdk-lib/core';

const app = new cdk.App();
const stack = new AgentAiSdkStack(app, 'AgentAiSdk', {
});
cdk.RemovalPolicies.of(stack).apply(cdk.RemovalPolicy.DESTROY);
