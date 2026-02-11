import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AgentAiSdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const functionName = 'agent-ai-sdk-api';
    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${functionName}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_DAY,
    });

    const fn = new nodejs.NodejsFunction(this, 'Lambda', {
      functionName,
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: './lambda/index.ts',
      retryAttempts: 0,
      logGroup,
      timeout: cdk.Duration.seconds(30),
      loggingFormat: lambda.LoggingFormat.JSON,
      applicationLogLevelV2: lambda.ApplicationLogLevel.TRACE,
      systemLogLevelV2: lambda.SystemLogLevel.INFO,
      bundling: {
        target: 'node24',
        minify: true,
        format: nodejs.OutputFormat.ESM,
        nodeModules: ['@smithy/eventstream-codec'],
      },
      role: new iam.Role(this, 'FunctionExecutionRole', {
        roleName: `${functionName}-role`,
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaExecute'),
          iam.ManagedPolicy.fromAwsManagedPolicyName('CloudFrontReadOnlyAccess'),
        ],
        inlinePolicies: {
          'bedrock-policy': new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  'bedrock:InvokeModel*',
                  'logs:PutLogEvents',
                ],
                resources: ['*'],
              }),
            ],
          }),
        },
      }),
    });

    new lambda.FunctionUrl(this, 'FunctionURL', {
      function: fn,
      authType: lambda.FunctionUrlAuthType.NONE,
    });
  }
}
