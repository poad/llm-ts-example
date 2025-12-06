import { APIGatewayProxyEvent } from 'aws-lambda';
export declare const handle: ({ message: message, model: model }: {
    message: string;
    model: string;
}, output: NodeJS.WritableStream) => Promise<void>;
export declare const handler: import("aws-lambda").StreamifyHandler<APIGatewayProxyEvent, void>;
export default handler;
