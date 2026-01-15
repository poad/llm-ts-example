import { LanguageModelLike } from '@langchain/core/language_models/base';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { createAgent } from 'langchain';

export const createApp = ({ model }: { model: LanguageModelLike & BaseChatModel, modelName: string }) => {
  const agent = createAgent({
    model,
    tools: [],
    systemPrompt: `Answer the user's question to the best of your ability.
    However, please keep your answers brief and in the same language as the question.

    {question}`,
  });

  return agent;
};
