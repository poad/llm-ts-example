export function ModelSelector(props: {
  onChange: (model: string) => void
  class?: string;
  id?: string;
}) {
  return (<>
    <select onChange={(e) => props.onChange(e.target.value)} id={props.id} class={props.class}>
      <option value='llama32-3b' selected>Meta LLama 3.2 3B Instruct (AWS Bedrock)</option>
      <option value='llama32-1b'>Meta LLama 3.2 1B Instruct (AWS Bedrock)</option>
      <option value='gpt-4o' >GPT-4o</option>
      <option value='gpt-4o-mini'>GPT-4o mini</option>
      <option value='cohere'>Cohere Command R+ v1 (AWS Bedrock)</option>
      <option value='anthropic'>Anthropic Claude 3.5 Sonnet</option>
    </select>

  </>);
}

export default ModelSelector;
