import { createResource, createSignal, For, Match, Setter, Switch } from 'solid-js';
import sha256 from 'crypto-js/sha256';
import './App.css';
import ModelSelector from './features/Models';
import { v7 as uuidv7 } from 'uuid';
import { SolidMarkdown } from 'solid-markdown';

const models = [
  {
    id: 'llama32-3b',
    name: 'Meta LLama 3.2 3B Instruct (AWS Bedrock)',
    selected: true,
  },
  {
    id: 'llama32-1b',
    name: 'Meta LLama 3.2 1B Instruct (AWS Bedrock)',
    selected: false,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    selected: false,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    selected: false,
  },
  {
    id: 'cohere',
    name: 'Cohere Command R+ v1 (AWS Bedrock)',
    selected: false,
  },
  {
    id: 'nova-micro',
    name: 'Amazon Nove Micro (AWS Bedrock)',
    selected: false,
  },
  {
    id: 'nova-lite',
    name: 'Amazon Nove Lite (AWS Bedrock)',
    selected: false,
  },
  {
    id: 'nova-pro',
    name: 'Amazon Nove Pro (AWS Bedrock)',
    selected: false,
  },
  // {
  //   id: 'anthropic',
  //   name: 'Anthropic Claude 3.5 Sonnet v1',
  //   selected: false,
  // },
];

async function read(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  items: Uint8Array[],
) {
  const item = (await reader.read()).value;
  if (!item) {
    return items;
  }
  return read(reader, items.concat([item]));
}

async function readAll(source: ReadableStream<Uint8Array> | null) {
  if (!source) {
    return [];
  }
  const reader = source.getReader();
  return await read(reader, []);
}

async function fetchApi(question: string, model: string, sessionId: string, setHistory: Setter<{
  type: 'system' | 'user';
  model?: string;
  message: string;
}[]>, setPrompt: Setter<string>) {
  const body = JSON.stringify({ question, model, sessionId });
  const hash = sha256(body);
  return fetch(
    '/api/',
    {
      method: 'post',
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-amz-content-sha256': hash.toString(),
      },
    },
  ).then(
    async (resp) => {
      const result = await readAll(resp.body);
      setHistory((prev) => prev.concat([{
        type: 'system',
        model,
        message: result.map((item) => new TextDecoder().decode(item)).reduce((acc, cur) => acc.concat(cur)) ?? '',
      }]));
      return result;
    },
  ).catch(
    (e) => setHistory((prev) => prev.concat([{ type: 'system', model, message: `Error: ${JSON.stringify(e)}` }])),
  )
    .finally(() => setPrompt(() => ''));
}

function App() {
  const sessionId = uuidv7();

  const [input, setInput] = createSignal<string>('');
  const [model, setModel] = createSignal<string>(models.find((it) => it.selected)?.id ??'llama32-3b');
  const [prompt, setPrompt] = createSignal<string>('');
  const [data] = createResource(prompt, (question) => {
    if (question && question.length > 0) {
      return fetchApi(question, model(), sessionId, setHistory, setPrompt);
    }
  });
  const [history, setHistory] = createSignal<{
    type: 'system' | 'user';
    model?: string;
    message: string;
  }[]>([]);

  return (
    <>
      <div id='container'>
        <div id='history-container'>
          <For each={history()}>
            {(item) => (
              <div class={`history history-${item.type}`}>
                <div class='role'>{item.type === 'user' ? 'あなた' : models.find((it) => it.id === item.model)?.name ?? item.model}</div>
                <div class='message'><SolidMarkdown children={item.message} /></div>
              </div>
            )}
          </For>
          <Switch>
            <Match when={data.loading}>
              <div class='history history-system'>loading...</div>
            </Match>
            <Match when={data.error}>
              <div class='history history-system'>Error: {data.error}</div>
            </Match>
          </Switch>
        </div>
        <div id='input-bar'>
          <input type='text' onChange={(event) => setInput(() => event.target.value)} value={input()} id='input-box' placeholder='質問を入力してください。' />
          <ModelSelector id='model-selector' onChange={(value) => setModel(() => value)} models={models} />
          <button id='send-button' onClick={() => setPrompt(() => {
            const question = input();
            setInput(() => '');
            setHistory((prev) => prev.concat([{ type: 'user', message: question ?? '' }]));
            return question;
          })}>聞く</button>
        </div>
      </div>
    </>
  );
}

export default App;
