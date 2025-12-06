import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface CloudfrontCdnTemplateStackProps extends cdk.StackProps {
  appName: string
}

export class CloudfrontCdnTemplateStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: CloudfrontCdnTemplateStackProps,
  ) {
    super(scope, id, props);

    const {
      appName,
    } = props;

    const functionName = appName;
    new cdk.aws_logs.LogGroup(this, 'ApolloLambdaFunctionLogGroup', {
      logGroupName: `/aws/lambda/${functionName}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: cdk.aws_logs.RetentionDays.ONE_DAY,
    });

    const devOptions = {
      applicationLogLevelV2: cdk.aws_lambda.ApplicationLogLevel.TRACE,
    };

    const fn = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'Lambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_24_X,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      entry: './lambda/index.ts',
      functionName,
      retryAttempts: 0,
      bundling: {
        target: 'node24',
        minify: true,
        format: cdk.aws_lambda_nodejs.OutputFormat.ESM,
        banner: 'import { createRequire } from \'module\';const require = createRequire(import.meta.url);',
        // ...devOptions.bundling,
      },
      memorySize: 256,
      timeout: cdk.Duration.minutes(1),
      role: new cdk.aws_iam.Role(this, 'ApolloLambdaFunctionExecutionRole', {
        assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaExecute'),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('CloudFrontReadOnlyAccess'),
        ],
        inlinePolicies: {
          'bedrock-policy': new cdk.aws_iam.PolicyDocument({
            statements: [
              new cdk.aws_iam.PolicyStatement({
                effect: cdk.aws_iam.Effect.ALLOW,
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
      loggingFormat: cdk.aws_lambda.LoggingFormat.JSON,
      applicationLogLevelV2: devOptions.applicationLogLevelV2,
    });

    new cdk.aws_lambda.FunctionUrl(this, 'LambdaFunctionUrl', {
      function: fn,
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      invokeMode: cdk.aws_lambda.InvokeMode.RESPONSE_STREAM,
    });
  }
}
