import { createSignal, For, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { SolidMarkdown } from 'solid-markdown';
import sha256 from 'crypto-js/sha256';
import { ModelSelector } from '../../Models';

interface ChatMessage {
  id: number;
  type: 'system' | 'user';
  model?: string;
  message: string;
  streaming?: boolean;
}

interface Model {
  id: string;
  name: string;
  selected: boolean;
}

interface ChatProps {
  sessionId: string;
  models: Model[]
}

export function Chat(props: ChatProps) {
  // 履歴を管理するstore
  const [history, setHistory] = createStore<ChatMessage[]>([]);

  // 現在の表示テキストと入力
  const [input, setInput] = createSignal('');

  const [model, setModel] = createSignal<string>(props.models.find((it) => it.selected)?.id ?? 'nova-micro');

  const [isLoading, setIsLoading] = createSignal(false);

  // スクロール用の参照
  let messagesContainerRef: HTMLDivElement | undefined;

  // スクロールを最下部に固定する関数
  function scrollToBottom() {
    if (messagesContainerRef) {
      messagesContainerRef.scrollTop = messagesContainerRef.scrollHeight;
    }
  };

  function addMessageAndScroll(message: ChatMessage) {
    setHistory((prev) => [
      ...prev,
      message,
    ]);
    scrollToBottom();
  }

  onMount(scrollToBottom);

  async function pipeStream(
    reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>,
    id: number,
    decoder: TextDecoder,
  ) {

    const { done, value } = await reader.read();
    if (done) {
      setHistory(prev =>
        prev.map(msg =>
          msg.id === id
            ? {
              ...msg,
              streaming: false,
            }
            : msg,
        ),
      );
      scrollToBottom();
      return;
    };

    const chunk = decoder.decode(value, { stream: true });

    // リアルタイムでメッセージを更新
    setHistory(prev =>
      prev.map(msg =>
        msg.id === id
          ? {
            ...msg,
            message: msg.message + chunk,
            streaming: true,
          }
          : msg,
      ),
    );
    scrollToBottom();
    await pipeStream(reader, id, decoder);
  }

  // ストリーミングフェッチ関数
  async function fetchStreamingContent(input: string, model: string) {
    const body = JSON.stringify({ question: input, model, sessionId: props.sessionId });
    const hash = sha256(body);
    const endpoint = import.meta.env.VITE_API_URL ?? '';
    const response = await fetch(
      `${endpoint}/api/`,
      {
        method: 'post',
        body,
        headers: {
          'Content-Type': 'application/json',
          'x-amz-content-sha256': hash.toString(),
        },
      },
    );

    if (!response.body) {
      throw new Error('ストリーミングに失敗');
    }

    setIsLoading(false);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const lastAssistantMessageId = Math.max(
      ...history.map(m => m.id),
      0,
    );

    const assistantMessageId = lastAssistantMessageId + 1;

    // 空のシステムメッセージを追加
    addMessageAndScroll({
      id: assistantMessageId,
      type: 'system',
      message: '',
      model,
      streaming: true,
    });

    await pipeStream(reader, assistantMessageId, decoder);
  };

  async function handleSubmit() {
    const question = input().trim();
    if (!question) return;

    // 入力欄をクリア
    setInput('');

    const newMessageId = history.length > 0
      ? Math.max(...history.map(m => m.id)) + 1
      : 1;

    addMessageAndScroll({
      id: newMessageId,
      type: 'user',
      message: question,
    });

    try {
      setIsLoading(true);
      await fetchStreamingContent(question, model());
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div id='container'>
      {/* 履歴リスト */}
      <div class="mt-4" id='history-container' ref={messagesContainerRef}>
        <For each={history}>
          {(item) => (
            <div class={`history history-${item.type}`}>
              <div class='role'>{item.type === 'user' ? 'あなた' : props.models.find((it) => it.id === item.model)?.name ?? item.model}</div>
              <div class='message'><SolidMarkdown children={item.message} /></div>
            </div>
          )}
        </For>
        <div class='loading'>
          {isLoading() ? '考え中...' : ''}
        </div>
      </div>

      <div id='input-bar'>
        <input
          id='input-box'
          type="text"
          value={input()}
          onInput={(e) => setInput(e.target.value)}
          placeholder="質問を入力..."
        />
        <ModelSelector id='model-selector' onChange={(value) => setModel(() => value)} models={props.models} />
        <button
          onClick={handleSubmit}
          disabled={isLoading()}
          id='send-button'
        >
          送信
        </button>
      </div>
    </div>
  );
};
