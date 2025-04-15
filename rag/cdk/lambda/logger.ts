import { LogFormatter, LogItem, Logger } from '@aws-lambda-powertools/logger';
import type {
  LogAttributes,
  UnformattedAttributes,
} from '@aws-lambda-powertools/logger/types';

class LocalLogFormatter extends LogFormatter {
  public formatAttributes(
    attributes: UnformattedAttributes,
    additionalLogAttributes: LogAttributes,
  ): LogItem {
    const baseAttributes = {
      logLevel: attributes.logLevel,
      timestamp: this.formatTimestamp(attributes.timestamp), // You can extend this function
      message: attributes.message,
    };
    const logItem = new LogItem({ attributes: baseAttributes });
    // add any attributes not explicitly defined
    logItem.addAttributes(additionalLogAttributes);
    return logItem;
  }
}

const logger = new Logger({
  logFormatter: new LocalLogFormatter(),
});

export { logger };
