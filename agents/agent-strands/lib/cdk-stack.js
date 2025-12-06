import * as cdk from 'aws-cdk-lib';
import { buildCommon, buildFrontend } from './process/setup.js';
export class CloudfrontCdnTemplateStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { appName, } = props;
        buildCommon();
        buildFrontend();
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
                assumedBy: new cdk.aws_iam.ServicePrincipal('cdk.aws_lambda.amazonaws.com'),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxHQUFHLE1BQU0sYUFBYSxDQUFDO0FBRW5DLE9BQU8sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFNaEUsTUFBTSxPQUFPLDBCQUEyQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3ZELFlBQ0UsS0FBZ0IsRUFDaEIsRUFBVSxFQUNWLEtBQXNDO1FBRXRDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sRUFDSixPQUFPLEdBQ1IsR0FBRyxLQUFLLENBQUM7UUFFVixXQUFXLEVBQUUsQ0FBQztRQUNkLGFBQWEsRUFBRSxDQUFDO1FBRWhCLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQztRQUM3QixJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSw4QkFBOEIsRUFBRTtZQUM5RCxZQUFZLEVBQUUsZUFBZSxZQUFZLEVBQUU7WUFDM0MsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTztZQUN4QyxTQUFTLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTztTQUM5QyxDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRztZQUNqQixxQkFBcUIsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEtBQUs7U0FDaEUsQ0FBQztRQUVGLE1BQU0sRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQ2xFLE9BQU8sRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQzNDLFlBQVksRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxNQUFNO1lBQ2hELEtBQUssRUFBRSxtQkFBbUI7WUFDMUIsWUFBWTtZQUNaLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLFFBQVEsRUFBRTtnQkFDUixNQUFNLEVBQUUsUUFBUTtnQkFDaEIsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsR0FBRztnQkFDOUMsTUFBTSxFQUFFLDBGQUEwRjtnQkFDbEcsMEJBQTBCO2FBQzNCO1lBQ0QsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksRUFBRSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxtQ0FBbUMsRUFBRTtnQkFDcEUsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyw4QkFBOEIsQ0FBQztnQkFDM0UsZUFBZSxFQUFFO29CQUNmLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLGtCQUFrQixDQUFDO29CQUN0RSxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQywwQkFBMEIsQ0FBQztpQkFDL0U7Z0JBQ0QsY0FBYyxFQUFFO29CQUNkLGdCQUFnQixFQUFFLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7d0JBQy9DLFVBQVUsRUFBRTs0QkFDVixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO2dDQUM5QixNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSztnQ0FDaEMsT0FBTyxFQUFFO29DQUNQLHNCQUFzQjtvQ0FDdEIsbUJBQW1CO2lDQUNwQjtnQ0FDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUM7NkJBQ2pCLENBQUM7eUJBQ0g7cUJBQ0YsQ0FBQztpQkFDSDthQUNGLENBQUM7WUFDRixhQUFhLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSTtZQUNoRCxxQkFBcUIsRUFBRSxVQUFVLENBQUMscUJBQXFCO1NBQ3hELENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3hELFFBQVEsRUFBRSxFQUFFO1lBQ1osUUFBUSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsSUFBSTtZQUNqRCxVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsZUFBZTtTQUN0RCxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBidWlsZENvbW1vbiwgYnVpbGRGcm9udGVuZCB9IGZyb20gJy4vcHJvY2Vzcy9zZXR1cC5qcyc7XG5cbmludGVyZmFjZSBDbG91ZGZyb250Q2RuVGVtcGxhdGVTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBhcHBOYW1lOiBzdHJpbmdcbn1cblxuZXhwb3J0IGNsYXNzIENsb3VkZnJvbnRDZG5UZW1wbGF0ZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3IoXG4gICAgc2NvcGU6IENvbnN0cnVjdCxcbiAgICBpZDogc3RyaW5nLFxuICAgIHByb3BzOiBDbG91ZGZyb250Q2RuVGVtcGxhdGVTdGFja1Byb3BzLFxuICApIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGFwcE5hbWUsXG4gICAgfSA9IHByb3BzO1xuXG4gICAgYnVpbGRDb21tb24oKTtcbiAgICBidWlsZEZyb250ZW5kKCk7XG5cbiAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBhcHBOYW1lO1xuICAgIG5ldyBjZGsuYXdzX2xvZ3MuTG9nR3JvdXAodGhpcywgJ0Fwb2xsb0xhbWJkYUZ1bmN0aW9uTG9nR3JvdXAnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL2xhbWJkYS8ke2Z1bmN0aW9uTmFtZX1gLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIHJldGVudGlvbjogY2RrLmF3c19sb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRldk9wdGlvbnMgPSB7XG4gICAgICBhcHBsaWNhdGlvbkxvZ0xldmVsVjI6IGNkay5hd3NfbGFtYmRhLkFwcGxpY2F0aW9uTG9nTGV2ZWwuVFJBQ0UsXG4gICAgfTtcblxuICAgIGNvbnN0IGZuID0gbmV3IGNkay5hd3NfbGFtYmRhX25vZGVqcy5Ob2RlanNGdW5jdGlvbih0aGlzLCAnTGFtYmRhJywge1xuICAgICAgcnVudGltZTogY2RrLmF3c19sYW1iZGEuUnVudGltZS5OT0RFSlNfMjRfWCxcbiAgICAgIGFyY2hpdGVjdHVyZTogY2RrLmF3c19sYW1iZGEuQXJjaGl0ZWN0dXJlLkFSTV82NCxcbiAgICAgIGVudHJ5OiAnLi9sYW1iZGEvaW5kZXgudHMnLFxuICAgICAgZnVuY3Rpb25OYW1lLFxuICAgICAgcmV0cnlBdHRlbXB0czogMCxcbiAgICAgIGJ1bmRsaW5nOiB7XG4gICAgICAgIHRhcmdldDogJ25vZGUyNCcsXG4gICAgICAgIG1pbmlmeTogdHJ1ZSxcbiAgICAgICAgZm9ybWF0OiBjZGsuYXdzX2xhbWJkYV9ub2RlanMuT3V0cHV0Rm9ybWF0LkVTTSxcbiAgICAgICAgYmFubmVyOiAnaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gXFwnbW9kdWxlXFwnO2NvbnN0IHJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKGltcG9ydC5tZXRhLnVybCk7JyxcbiAgICAgICAgLy8gLi4uZGV2T3B0aW9ucy5idW5kbGluZyxcbiAgICAgIH0sXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24ubWludXRlcygxKSxcbiAgICAgIHJvbGU6IG5ldyBjZGsuYXdzX2lhbS5Sb2xlKHRoaXMsICdBcG9sbG9MYW1iZGFGdW5jdGlvbkV4ZWN1dGlvblJvbGUnLCB7XG4gICAgICAgIGFzc3VtZWRCeTogbmV3IGNkay5hd3NfaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2Nkay5hd3NfbGFtYmRhLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgICAgY2RrLmF3c19pYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FXU0xhbWJkYUV4ZWN1dGUnKSxcbiAgICAgICAgICBjZGsuYXdzX2lhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQ2xvdWRGcm9udFJlYWRPbmx5QWNjZXNzJyksXG4gICAgICAgIF0sXG4gICAgICAgIGlubGluZVBvbGljaWVzOiB7XG4gICAgICAgICAgJ2JlZHJvY2stcG9saWN5JzogbmV3IGNkay5hd3NfaWFtLlBvbGljeURvY3VtZW50KHtcbiAgICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgICAgbmV3IGNkay5hd3NfaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgZWZmZWN0OiBjZGsuYXdzX2lhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgJ2JlZHJvY2s6SW52b2tlTW9kZWwqJyxcbiAgICAgICAgICAgICAgICAgICdsb2dzOlB1dExvZ0V2ZW50cycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSksXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIGxvZ2dpbmdGb3JtYXQ6IGNkay5hd3NfbGFtYmRhLkxvZ2dpbmdGb3JtYXQuSlNPTixcbiAgICAgIGFwcGxpY2F0aW9uTG9nTGV2ZWxWMjogZGV2T3B0aW9ucy5hcHBsaWNhdGlvbkxvZ0xldmVsVjIsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLmF3c19sYW1iZGEuRnVuY3Rpb25VcmwodGhpcywgJ0xhbWJkYUZ1bmN0aW9uVXJsJywge1xuICAgICAgZnVuY3Rpb246IGZuLFxuICAgICAgYXV0aFR5cGU6IGNkay5hd3NfbGFtYmRhLkZ1bmN0aW9uVXJsQXV0aFR5cGUuTk9ORSxcbiAgICAgIGludm9rZU1vZGU6IGNkay5hd3NfbGFtYmRhLkludm9rZU1vZGUuUkVTUE9OU0VfU1RSRUFNLFxuICAgIH0pO1xuICB9XG59XG4iXX0=