import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
interface CloudfrontCdnTemplateStackProps extends cdk.StackProps {
    appName: string;
}
export declare class CloudfrontCdnTemplateStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: CloudfrontCdnTemplateStackProps);
}
export {};
