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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxHQUFHLE1BQU0sYUFBYSxDQUFDO0FBT25DLE1BQU0sT0FBTywwQkFBMkIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN2RCxZQUNFLEtBQWdCLEVBQ2hCLEVBQVUsRUFDVixLQUFzQyxFQUN0QztRQUNBLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sRUFDSixPQUFPLEdBQ1IsR0FBRyxLQUFLLENBQUM7UUFFVixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUM7UUFDN0IsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsOEJBQThCLEVBQUU7WUFDOUQsWUFBWSxFQUFFLGVBQWUsWUFBWSxFQUFFO1lBQzNDLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU87U0FDOUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxVQUFVLEdBQUc7WUFDakIscUJBQXFCLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLO1NBQ2hFLENBQUM7UUFFRixNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUNsRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVztZQUMzQyxZQUFZLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTTtZQUNoRCxLQUFLLEVBQUUsbUJBQW1CO1lBQzFCLFlBQVk7WUFDWixhQUFhLEVBQUUsQ0FBQztZQUNoQixRQUFRLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFLFFBQVE7Z0JBQ2hCLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxHQUFHLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLEdBQUc7Z0JBQzlDLE1BQU0sRUFBRSwwRkFBMEY7Z0JBQ2xHLDBCQUEwQjthQUMzQjtZQUNELFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLEVBQUUsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsbUNBQW1DLEVBQUU7Z0JBQ3BFLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUM7Z0JBQ25FLGVBQWUsRUFBRTtvQkFDZixHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDdEUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsMEJBQTBCLENBQUM7aUJBQy9FO2dCQUNELGNBQWMsRUFBRTtvQkFDZCxnQkFBZ0IsRUFBRSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO3dCQUMvQyxVQUFVLEVBQUU7NEJBQ1YsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQztnQ0FDOUIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUs7Z0NBQ2hDLE9BQU8sRUFBRTtvQ0FDUCxzQkFBc0I7b0NBQ3RCLG1CQUFtQjtpQ0FDcEI7Z0NBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDOzZCQUNqQixDQUFDO3lCQUNIO3FCQUNGLENBQUM7aUJBQ0g7YUFDRixDQUFDO1lBQ0YsYUFBYSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUk7WUFDaEQscUJBQXFCLEVBQUUsVUFBVSxDQUFDLHFCQUFxQjtTQUN4RCxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN4RCxRQUFRLEVBQUUsRUFBRTtZQUNaLFFBQVEsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLElBQUk7WUFDakQsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLGVBQWU7U0FDdEQsQ0FBQyxDQUFDO0lBQUEsQ0FDSjtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5pbnRlcmZhY2UgQ2xvdWRmcm9udENkblRlbXBsYXRlU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgYXBwTmFtZTogc3RyaW5nXG59XG5cbmV4cG9ydCBjbGFzcyBDbG91ZGZyb250Q2RuVGVtcGxhdGVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHNjb3BlOiBDb25zdHJ1Y3QsXG4gICAgaWQ6IHN0cmluZyxcbiAgICBwcm9wczogQ2xvdWRmcm9udENkblRlbXBsYXRlU3RhY2tQcm9wcyxcbiAgKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB7XG4gICAgICBhcHBOYW1lLFxuICAgIH0gPSBwcm9wcztcblxuICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGFwcE5hbWU7XG4gICAgbmV3IGNkay5hd3NfbG9ncy5Mb2dHcm91cCh0aGlzLCAnQXBvbGxvTGFtYmRhRnVuY3Rpb25Mb2dHcm91cCcsIHtcbiAgICAgIGxvZ0dyb3VwTmFtZTogYC9hd3MvbGFtYmRhLyR7ZnVuY3Rpb25OYW1lfWAsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgcmV0ZW50aW9uOiBjZGsuYXdzX2xvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfREFZLFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGV2T3B0aW9ucyA9IHtcbiAgICAgIGFwcGxpY2F0aW9uTG9nTGV2ZWxWMjogY2RrLmF3c19sYW1iZGEuQXBwbGljYXRpb25Mb2dMZXZlbC5UUkFDRSxcbiAgICB9O1xuXG4gICAgY29uc3QgZm4gPSBuZXcgY2RrLmF3c19sYW1iZGFfbm9kZWpzLk5vZGVqc0Z1bmN0aW9uKHRoaXMsICdMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBjZGsuYXdzX2xhbWJkYS5SdW50aW1lLk5PREVKU18yNF9YLFxuICAgICAgYXJjaGl0ZWN0dXJlOiBjZGsuYXdzX2xhbWJkYS5BcmNoaXRlY3R1cmUuQVJNXzY0LFxuICAgICAgZW50cnk6ICcuL2xhbWJkYS9pbmRleC50cycsXG4gICAgICBmdW5jdGlvbk5hbWUsXG4gICAgICByZXRyeUF0dGVtcHRzOiAwLFxuICAgICAgYnVuZGxpbmc6IHtcbiAgICAgICAgdGFyZ2V0OiAnbm9kZTI0JyxcbiAgICAgICAgbWluaWZ5OiB0cnVlLFxuICAgICAgICBmb3JtYXQ6IGNkay5hd3NfbGFtYmRhX25vZGVqcy5PdXRwdXRGb3JtYXQuRVNNLFxuICAgICAgICBiYW5uZXI6ICdpbXBvcnQgeyBjcmVhdGVSZXF1aXJlIH0gZnJvbSBcXCdtb2R1bGVcXCc7Y29uc3QgcmVxdWlyZSA9IGNyZWF0ZVJlcXVpcmUoaW1wb3J0Lm1ldGEudXJsKTsnLFxuICAgICAgICAvLyAuLi5kZXZPcHRpb25zLmJ1bmRsaW5nLFxuICAgICAgfSxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5taW51dGVzKDEpLFxuICAgICAgcm9sZTogbmV3IGNkay5hd3NfaWFtLlJvbGUodGhpcywgJ0Fwb2xsb0xhbWJkYUZ1bmN0aW9uRXhlY3V0aW9uUm9sZScsIHtcbiAgICAgICAgYXNzdW1lZEJ5OiBuZXcgY2RrLmF3c19pYW0uU2VydmljZVByaW5jaXBhbCgnbGFtYmRhLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgICAgY2RrLmF3c19pYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FXU0xhbWJkYUV4ZWN1dGUnKSxcbiAgICAgICAgICBjZGsuYXdzX2lhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQ2xvdWRGcm9udFJlYWRPbmx5QWNjZXNzJyksXG4gICAgICAgIF0sXG4gICAgICAgIGlubGluZVBvbGljaWVzOiB7XG4gICAgICAgICAgJ2JlZHJvY2stcG9saWN5JzogbmV3IGNkay5hd3NfaWFtLlBvbGljeURvY3VtZW50KHtcbiAgICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgICAgbmV3IGNkay5hd3NfaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgZWZmZWN0OiBjZGsuYXdzX2lhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgJ2JlZHJvY2s6SW52b2tlTW9kZWwqJyxcbiAgICAgICAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIGxvZ2dpbmdGb3JtYXQ6IGNkay5hd3NfbGFtYmRhLkxvZ2dpbmdGb3JtYXQuSlNPTixcbiAgICAgIGFwcGxpY2F0aW9uTG9nTGV2ZWxWMjogZGV2T3B0aW9ucy5hcHBsaWNhdGlvbkxvZ0xldmVsVjIsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLmF3c19sYW1iZGEuRnVuY3Rpb25VcmwodGhpcywgJ0xhbWJkYUZ1bmN0aW9uVXJsJywge1xuICAgICAgZnVuY3Rpb246IGZuLFxuICAgICAgYXV0aFR5cGU6IGNkay5hd3NfbGFtYmRhLkZ1bmN0aW9uVXJsQXV0aFR5cGUuTk9ORSxcbiAgICAgIGludm9rZU1vZGU6IGNkay5hd3NfbGFtYmRhLkludm9rZU1vZGUuUkVTUE9OU0VfU1RSRUFNLFxuICAgIH0pO1xuICB9XG59XG4iXX0=