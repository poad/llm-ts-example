import { APIGatewayProxyEvent } from 'aws-lambda';
export declare const handle: ({ question: message, model: model }: {
    question: string;
    model: string;
}, output: NodeJS.WritableStream) => Promise<void>;
export declare const handler: import("aws-lambda").StreamifyHandler<APIGatewayProxyEvent, void>;
export default handler;
