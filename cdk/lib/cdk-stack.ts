import * as cdk from 'aws-cdk-lib';
import { Construct, } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as awslogs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { buildFrontend, } from './process/setup';
import * as deployment from 'aws-cdk-lib/aws-s3-deployment';

export interface Config extends cdk.StackProps {
  bucketName: string;
  appName: string;
  cloudfront: {
    comment: string;
  };
}

interface CloudfrontCdnTemplateStackProps extends Config {
  environment?: string;
  endpoint: string;
  apiKey: string;
  deployName: string;
  apiVersion: string;
}

export class CloudfrontCdnTemplateStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: CloudfrontCdnTemplateStackProps,
  ) {
    super(scope, id, props,);

    const {
      bucketName,
      appName,
      environment,
      cloudfront: { comment, },
      endpoint,
      apiKey,
      deployName,
      apiVersion,
    } = props;

    buildFrontend();

    const functionName = `${environment ? `${environment}-` : ''}llm-ts-example-api`;
    const logs = new awslogs.LogGroup(this, 'ApolloLambdaFunctionLogGroup', {
      logGroupName: `/aws/lambda/${functionName}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: awslogs.RetentionDays.ONE_DAY,
    },);

    const devOptions = {
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        sourceMap: true,
        sourceMapMode: nodejs.SourceMapMode.BOTH,
        sourcesContent: true,
        keepNames: true,

      },
    };

    const apiRootPath = '/api/';

    const fn = new nodejs.NodejsFunction(this, 'Lambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: './lambda/index.ts',
      functionName,
      retryAttempts: 0,
      environment: {
        ...devOptions.environment,
        API_ROOT_PATH: apiRootPath,
        AZURE_OPENAI_API_INSTANCE_NAME: endpoint,
        AZURE_OPENAI_API_DEPLOYMENT_NAME: deployName,
        AZURE_OPENAI_API_KEY: apiKey,
        AZURE_OPENAI_API_VERSION: apiVersion,
      },
      bundling: {
        minify: true,
        ...devOptions.bundling,
      },
      timeout: cdk.Duration.minutes(1),
      role: new iam.Role(this, 'ApolloLambdaFunctionExecutionRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com',),
        inlinePolicies: {
          'logs-policy': new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  'logs:CreateLogStream',
                  'logs:PutLogEvents',
                ],
                resources: [`${logs.logGroupArn}:*`,],
              },),
            ],
          },),
        },
      },),
    },);

    const s3bucket = new s3.Bucket(this, 'S3Bucket', {
      bucketName,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      encryption: s3.BucketEncryption.S3_MANAGED,
    },);

    const cf = new cloudfront.Distribution(this, 'CloudFront', {
      comment,
      defaultBehavior: {
        origin: new origins.HttpOrigin(s3bucket.bucketWebsiteDomainName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        },),
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        [`${apiRootPath}*`]: {
          origin: new origins.FunctionUrlOrigin(fn.addFunctionUrl({
            authType: cdk.aws_lambda.FunctionUrlAuthType.AWS_IAM,
            invokeMode: cdk.aws_lambda.InvokeMode.RESPONSE_STREAM,
          },),
          {
            originPath: apiRootPath,
            readTimeout: cdk.Duration.minutes(1),
          },),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
      },
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    },);

    const deployRole = new iam.Role(this, 'DeployWebsiteRole', {
      roleName: `${appName}-deploy-role`,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com',),
      inlinePolicies: {
        's3-policy': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:*',],
              resources: [`${s3bucket.bucketArn}/`, `${s3bucket.bucketArn}/*`,],
            },),
          ],
        },),
      },
    },);

    new deployment.BucketDeployment(this, 'DeployWebsite', {
      sources: [deployment.Source.asset(`${process.cwd()}/../app/dist`,),],
      destinationBucket: s3bucket,
      destinationKeyPrefix: '/',
      exclude: ['.DS_Store', '*/.DS_Store',],
      prune: true,
      retainOnDelete: false,
      role: deployRole,
    },);

    // OAC
    const cfnOriginAccessControl =
      new cdk.aws_cloudfront.CfnOriginAccessControl(
        this,
        'OriginAccessControl',
        {
          originAccessControlConfig: {
            name: `OAC for Lambda Functions URL (${functionName})`,
            originAccessControlOriginType: 'lambda',
            signingBehavior: 'always',
            signingProtocol: 'sigv4',
          },
        },
      );

    const cfnDistribution = cf.node.defaultChild as cdk.aws_cloudfront.CfnDistribution;

    // Set OAC
    cfnDistribution.addPropertyOverride(
      'DistributionConfig.Origins.1.OriginAccessControlId',
      cfnOriginAccessControl.attrId,
    );

    // Add permission Lambda Function URLs
    fn.addPermission('AllowCloudFrontServicePrincipal', {
      principal: new cdk.aws_iam.ServicePrincipal('cloudfront.amazonaws.com',),
      action: 'lambda:InvokeFunctionUrl',
      sourceArn: `arn:aws:cloudfront::${cdk.Stack.of(this,).account}:distribution/${cf.distributionId}`,
    },);

    new cdk.CfnOutput(this, 'AccessURLOutput', {
      value: `https://${cf.distributionDomainName}`,
    },);
  }
}
