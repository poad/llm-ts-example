import { For } from 'solid-js/web';

interface Model {
  id: string;
  name: string;
  selected: boolean;
  disabled?: boolean;
}

interface ModelSelectorProps {
  models: Model[],
  onChange: (model: string) => void
  class?: string;
  id?: string;
}

export function ModelSelector(props: ModelSelectorProps) {
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
