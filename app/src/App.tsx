import { createResource, createSignal, For, Show } from 'solid-js';
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

function App() {
  const [input, setInput] = createSignal<string>();
  const [prompt, setPrompt] = createSignal<string>();
  const [data] = createResource(prompt, (question) => {
    const body = JSON.stringify({ question });
    const hash = sha256(body);
    return fetch(
      '/api/',
      {
        method: 'post',
        body: JSON.stringify({ question }),
        headers: {
          'Content-Type': 'application/json',
          'x-amz-content-sha256': hash.toString(),
        },
      }).then(async (resp) => {
      const result = await readAll(resp.body);
      setHistory((prev) => prev.concat([result.map((item) => new TextDecoder().decode(item)).reduce((acc, cur) => acc.concat(cur)) ?? '']));
      return result;
    });
  });
  const [history, setHistory] = createSignal<string[]>([]);

  return (
    <>
      <div>
        <input type='text' onChange={(event) => setInput(() => event.target.value)} style={{ 'margin-right': '0.5rem' }} />
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
