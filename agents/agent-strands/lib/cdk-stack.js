import * as cdk from 'aws-cdk-lib';
export class CloudfrontCdnTemplateStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { appName, } = props;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxHQUFHLE1BQU0sYUFBYSxDQUFDO0FBT25DLE1BQU0sT0FBTywwQkFBMkIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN2RCxZQUNFLEtBQWdCLEVBQ2hCLEVBQVUsRUFDVixLQUFzQztRQUV0QyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQ0osT0FBTyxHQUNSLEdBQUcsS0FBSyxDQUFDO1FBRVYsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDO1FBQzdCLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLDhCQUE4QixFQUFFO1lBQzlELFlBQVksRUFBRSxlQUFlLFlBQVksRUFBRTtZQUMzQyxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLFNBQVMsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPO1NBQzlDLENBQUMsQ0FBQztRQUVILE1BQU0sVUFBVSxHQUFHO1lBQ2pCLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsS0FBSztTQUNoRSxDQUFDO1FBRUYsTUFBTSxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDbEUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDM0MsWUFBWSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLE1BQU07WUFDaEQsS0FBSyxFQUFFLG1CQUFtQjtZQUMxQixZQUFZO1lBQ1osYUFBYSxFQUFFLENBQUM7WUFDaEIsUUFBUSxFQUFFO2dCQUNSLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxHQUFHO2dCQUM5QyxNQUFNLEVBQUUsMEZBQTBGO2dCQUNsRywwQkFBMEI7YUFDM0I7WUFDRCxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEMsSUFBSSxFQUFFLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLG1DQUFtQyxFQUFFO2dCQUNwRSxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO2dCQUNuRSxlQUFlLEVBQUU7b0JBQ2YsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsa0JBQWtCLENBQUM7b0JBQ3RFLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLDBCQUEwQixDQUFDO2lCQUMvRTtnQkFDRCxjQUFjLEVBQUU7b0JBQ2QsZ0JBQWdCLEVBQUUsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQzt3QkFDL0MsVUFBVSxFQUFFOzRCQUNWLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7Z0NBQzlCLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLO2dDQUNoQyxPQUFPLEVBQUU7b0NBQ1Asc0JBQXNCO29DQUN0QixtQkFBbUI7aUNBQ3BCO2dDQUNELFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQzs2QkFDakIsQ0FBQzt5QkFDSDtxQkFDRixDQUFDO2lCQUNIO2FBQ0YsQ0FBQztZQUNGLGFBQWEsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJO1lBQ2hELHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxxQkFBcUI7U0FDeEQsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDeEQsUUFBUSxFQUFFLEVBQUU7WUFDWixRQUFRLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJO1lBQ2pELFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxlQUFlO1NBQ3RELENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuaW50ZXJmYWNlIENsb3VkZnJvbnRDZG5UZW1wbGF0ZVN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIGFwcE5hbWU6IHN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgQ2xvdWRmcm9udENkblRlbXBsYXRlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihcbiAgICBzY29wZTogQ29uc3RydWN0LFxuICAgIGlkOiBzdHJpbmcsXG4gICAgcHJvcHM6IENsb3VkZnJvbnRDZG5UZW1wbGF0ZVN0YWNrUHJvcHMsXG4gICkge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3Qge1xuICAgICAgYXBwTmFtZSxcbiAgICB9ID0gcHJvcHM7XG5cbiAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBhcHBOYW1lO1xuICAgIG5ldyBjZGsuYXdzX2xvZ3MuTG9nR3JvdXAodGhpcywgJ0Fwb2xsb0xhbWJkYUZ1bmN0aW9uTG9nR3JvdXAnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL2xhbWJkYS8ke2Z1bmN0aW9uTmFtZX1gLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIHJldGVudGlvbjogY2RrLmF3c19sb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRldk9wdGlvbnMgPSB7XG4gICAgICBhcHBsaWNhdGlvbkxvZ0xldmVsVjI6IGNkay5hd3NfbGFtYmRhLkFwcGxpY2F0aW9uTG9nTGV2ZWwuVFJBQ0UsXG4gICAgfTtcblxuICAgIGNvbnN0IGZuID0gbmV3IGNkay5hd3NfbGFtYmRhX25vZGVqcy5Ob2RlanNGdW5jdGlvbih0aGlzLCAnTGFtYmRhJywge1xuICAgICAgcnVudGltZTogY2RrLmF3c19sYW1iZGEuUnVudGltZS5OT0RFSlNfMjRfWCxcbiAgICAgIGFyY2hpdGVjdHVyZTogY2RrLmF3c19sYW1iZGEuQXJjaGl0ZWN0dXJlLkFSTV82NCxcbiAgICAgIGVudHJ5OiAnLi9sYW1iZGEvaW5kZXgudHMnLFxuICAgICAgZnVuY3Rpb25OYW1lLFxuICAgICAgcmV0cnlBdHRlbXB0czogMCxcbiAgICAgIGJ1bmRsaW5nOiB7XG4gICAgICAgIHRhcmdldDogJ25vZGUyNCcsXG4gICAgICAgIG1pbmlmeTogdHJ1ZSxcbiAgICAgICAgZm9ybWF0OiBjZGsuYXdzX2xhbWJkYV9ub2RlanMuT3V0cHV0Rm9ybWF0LkVTTSxcbiAgICAgICAgYmFubmVyOiAnaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gXFwnbW9kdWxlXFwnO2NvbnN0IHJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKGltcG9ydC5tZXRhLnVybCk7JyxcbiAgICAgICAgLy8gLi4uZGV2T3B0aW9ucy5idW5kbGluZyxcbiAgICAgIH0sXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcygxKSxcbiAgICAgIHJvbGU6IG5ldyBjZGsuYXdzX2lhbS5Sb2xlKHRoaXMsICdBcG9sbG9MYW1iZGFGdW5jdGlvbkV4ZWN1dGlvblJvbGUnLCB7XG4gICAgICAgIGFzc3VtZWRCeTogbmV3IGNkay5hd3NfaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2xhbWJkYS5hbWF6b25hd3MuY29tJyksXG4gICAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICAgIGNkay5hd3NfaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBV1NMYW1iZGFFeGVjdXRlJyksXG4gICAgICAgICAgY2RrLmF3c19pYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0Nsb3VkRnJvbnRSZWFkT25seUFjY2VzcycpLFxuICAgICAgICBdLFxuICAgICAgICBpbmxpbmVQb2xpY2llczoge1xuICAgICAgICAgICdiZWRyb2NrLXBvbGljeSc6IG5ldyBjZGsuYXdzX2lhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgICAgIG5ldyBjZGsuYXdzX2lhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIGVmZmVjdDogY2RrLmF3c19pYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICdiZWRyb2NrOkludm9rZU1vZGVsKicsXG4gICAgICAgICAgICAgICAgICAnbG9nczpQdXRMb2dFdmVudHMnLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICBsb2dnaW5nRm9ybWF0OiBjZGsuYXdzX2xhbWJkYS5Mb2dnaW5nRm9ybWF0LkpTT04sXG4gICAgICBhcHBsaWNhdGlvbkxvZ0xldmVsVjI6IGRldk9wdGlvbnMuYXBwbGljYXRpb25Mb2dMZXZlbFYyLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5hd3NfbGFtYmRhLkZ1bmN0aW9uVXJsKHRoaXMsICdMYW1iZGFGdW5jdGlvblVybCcsIHtcbiAgICAgIGZ1bmN0aW9uOiBmbixcbiAgICAgIGF1dGhUeXBlOiBjZGsuYXdzX2xhbWJkYS5GdW5jdGlvblVybEF1dGhUeXBlLk5PTkUsXG4gICAgICBpbnZva2VNb2RlOiBjZGsuYXdzX2xhbWJkYS5JbnZva2VNb2RlLlJFU1BPTlNFX1NUUkVBTSxcbiAgICB9KTtcbiAgfVxufVxuIl19