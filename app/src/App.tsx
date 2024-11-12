import { createResource, createSignal, For, Match, Setter, Switch } from 'solid-js';
import sha256 from 'crypto-js/sha256';
import './App.css';
import ModelSelector from './features/Models';
import { v7 as uuidv7 } from 'uuid';

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
  message: string;
}[]>) {
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
        message: result.map((item) => new TextDecoder().decode(item)).reduce((acc, cur) => acc.concat(cur)) ?? '',
      }]));
      return result;
    },
  ).catch((e) => setHistory((prev) => prev.concat([{ type: 'system', message: `Error: ${JSON.stringify(e)}` }])));
}

function App() {
  const sessionId = uuidv7();


  const [input, setInput] = createSignal<string>();
  const [model, setModel] = createSignal<string>('gpt');
  const [prompt, setPrompt] = createSignal<string>();
  const [data] = createResource(prompt, (question) => {
    return fetchApi(question, model(), sessionId, setHistory);
  });
  const [history, setHistory] = createSignal<{
    type: 'system' | 'user';
    message: string;
  }[]>([]);

  return (
    <>
      <div id='container'>
        <div id='history-container'>
          <For each={history()}>
            {(item) => (
              <div class={`history history-${item.type}`}>
                <span class='role'>{item.type === 'user' ? 'あなた' : 'AI' }:</span>{item.message}
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
          <input type='text' onChange={(event) => setInput(() => event.target.value)} id='input-box' placeholder='質問を入力してください。' />
          <ModelSelector id='model-selector' onChange={(value) => setModel(() => value)} />
          <button id='send-button' onClick={() => setPrompt(() => {
            const question = input();
            setInput(() => '');
            setHistory((prev) => prev.concat([{type: 'user', message: question ?? ''}]));
            return question;
          })}>聞く</button>
        </div>
      </div>
    </>
  );
}

export default App;
