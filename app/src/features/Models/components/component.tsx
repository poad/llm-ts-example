export function ModelSelector(props: {
  onChange: (model: string) => void
}) {
  return (<>
    <select onChange={(e) => props.onChange(e.target.value)}>
      <option value='gpt' selected>GPT-4o</option>
      <option value='aws'>Cohere Command R+ v1 (AWS Bedrock)</option>
      <option value='anthropic'>Anthropic Claude 3.5 Sonnet</option>
    </select>

  </>);
}

export default ModelSelector;
