import { For } from 'solid-js/web';

export function ModelSelector(props: {
  models: {
    id: string;
    name: string;
    selected: boolean;
  }[],
  onChange: (model: string) => void
  class?: string;
  id?: string;
}) {
  return (<>
    <select onChange={(e) => props.onChange(e.target.value)} id={props.id} class={props.class}>
      <For each={props.models}>
        {(item) => (
          <option value={item.id} selected={item.selected}>{item.name}</option>
        )}
      </For>
    </select>

  </>);
}
