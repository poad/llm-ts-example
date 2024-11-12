export function ModelSelector(props: {
  onChange: (model: string) => void
}) {
  return (<>
    <select onChange={(e) => props.onChange(e.target.value)}>
      <option value='gpt-4o' selected>GPT-4o</option>
      <option value='gpt-4o-mini'>GPT-4o mini</option>
      <option value='cohere'>Cohere Command R+ v1 (AWS Bedrock)</option>
      <option value='anthropic'>Anthropic Claude 3.5 Sonnet</option>
      <option value='llama32-3b'>Meta LLama 3.2 3B Instruct (AWS Bedrock)</option>
      <option value='llama32-1b'>Meta LLama 3.2 1B Instruct (AWS Bedrock)</option>
    </select>

  </>);
}

export default ModelSelector;
