import { createAgent, initChatModel } from 'langchain';

export const createApp = async ({ model: { model, options} }: { model: {
  model: string;
  options: Record<string, string | number | boolean | Record<string, string> | undefined>;
}, modelName: string }) => {
  const agent = createAgent({
    model: await initChatModel(model, options),
    tools: [],
    systemPrompt: `Answer the user's question to the best of your ability.
    However, please keep your answers brief and in the same language as the question.

    {question}`,
  });

  return agent;
};
