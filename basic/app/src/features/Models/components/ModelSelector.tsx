import { For } from 'solid-js/web';

export function ModelSelector(props: {
  models: {
    id: string;
    name: string;
    selected: boolean;
    disabled?: boolean;
  }[],
  onChange: (model: string) => void
  class?: string;
  id?: string;
}) {
  return (<>
    <select onChange={(e) => props.onChange(e.target.value)} id={props.id} class={props.class}>
      <For each={props.models.filter((it) => !it.disabled)}>
        {(item) => (
          <option value={item.id} selected={item.selected}>{item.name}</option>
        )}
      </For>
    </select>

  </>);
}
