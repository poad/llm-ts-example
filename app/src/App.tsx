import { createResource, createSignal, For, Setter, Show } from 'solid-js';
import sha256 from 'crypto-js/sha256';
import './App.css';

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

async function fetchApi(question: string, model: string, setHistory: Setter<string[]>) {
  const body = JSON.stringify({ question, model });
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
  const [input, setInput] = createSignal<string>();
  const [model, setModel] = createSignal<string>('gpt');
  const [prompt, setPrompt] = createSignal<string>();
  const [data] = createResource(prompt, (question) => {
    return fetchApi(question, model(), setHistory);
  });
  const [history, setHistory] = createSignal<string[]>([]);

  return (
    <>
      <div>
        <input type='text' onChange={(event) => setInput(() => event.target.value)} style={{ 'margin-right': '0.5rem' }} />
        <select onChange={(e) => setModel(() => e.target.value)}>
          <option value='gpt' selected>GPT-4o</option>
          <option value='aws'>Cohere Command R+ v1 (AWS Bedrock)</option>
          <option value='anthropic'>Anthropic Claude 3.5 Sonnet</option>
        </select>
        <button onClick={() => setPrompt(() => {
          const question = input();
          setInput(() => '');
          return question;
        })}>聞く</button>
      </div>
      <div style={{ width: '40vw', 'text-align': 'left', margin: 'auto' }}>
        <Show when={data.loading}>
          <span>loading...</span>
        </Show>
        <Show when={data.error}>
          <span>Error: {data.error}</span>
        </Show>
        <Show when={!data.error && !data.loading}>
          <For each={history()}>
            {(item) => <p>{item}</p>}
          </For>
        </Show>
      </div>
    </>
  );
}

export default App;
