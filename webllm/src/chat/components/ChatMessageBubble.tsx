import { ChatWindowMessage } from '../schema/ChatWindowMessage';
import { JSX } from 'solid-js/jsx-runtime';

export default function ChatMessageBubble(props: {
  message: ChatWindowMessage;
  aiEmoji?: JSX.Element;
  onRemovePressed?: () => void;
}) {
  const { role, content } = props.message;

  const colorclass = role === 'human' ? 'bg-sky-600' : 'bg-slate-50 text-black';
  const alignmentclass = role === 'human' ? 'ml-auto' : 'mr-auto';
  const prefix = role === 'human' ? '🧑' : props.aiEmoji;

  return (
    <div
      class={`${alignmentclass} ${colorclass} rounded-sm px-4 py-2 max-w-[80%] mb-8 flex flex-col`}
    >
      <div class="flex hover:group group">
        <div class="mr-2">
          {prefix}
        </div>
        <div class="whitespace-pre-wrap">
          {/* TODO: Remove. Hacky fix, stop sequences don't seem to work with WebLLM yet. */}
          {content.trim().split('\nInstruct:')[0].split('\nInstruction:')[0]}
        </div>
        <div class="cursor-pointer opacity-0 hover:opacity-100 relative left-2 bottom-1" onMouseUp={props?.onRemovePressed}>
          ✖️
        </div>
      </div>
    </div>
  );
}
