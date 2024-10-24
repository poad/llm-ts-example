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

async function fetchApi(question: string, model: string, sessionId: string, setHistory: Setter<string[]>) {
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
    }).then(async (resp) => {
    const result = await readAll(resp.body);
    setHistory((prev) => prev.concat([result.map((item) => new TextDecoder().decode(item)).reduce((acc, cur) => acc.concat(cur)) ?? '']));
    return result;
  });
}

function App() {
  const sessionId = uuidv7();


  const [input, setInput] = createSignal<string>();
  const [model, setModel] = createSignal<string>('gpt');
  const [prompt, setPrompt] = createSignal<string>();
  const [data] = createResource(prompt, (question) => {
    return fetchApi(question, model(), sessionId, setHistory);
  });
  const [history, setHistory] = createSignal<string[]>([]);

  return (
    <>
      <div>
        <input type='text' onChange={(event) => setInput(() => event.target.value)} style={{ 'margin-right': '0.5rem' }} />
        <ModelSelector onChange={(value) => setModel(() => value)} />
        <button onClick={() => setPrompt(() => {
          const question = input();
          setInput(() => '');
          return question;
        })}>聞く</button>
      </div>
      <div style={{ width: '40vw', 'text-align': 'left', margin: 'auto' }}>
        <Switch>
          <Match when={data.loading}>
            <span>loading...</span>
          </Match>
          <Match when={data.error}>
            <span>Error: {data.error}</span>
          </Match>
          <Match when={!data.error && !data.loading}>
            <For each={history()}>
              {(item) => <p>{item}</p>}
            </For>
          </Match>
        </Switch>
      </div>
    </>
  );
}

export default App;
