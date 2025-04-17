import './App.css';
import { v7 as uuidv7 } from 'uuid';
import { Chat } from './features/chat/components/Chat';

const models = [
  {
    id: 'nova-micro',
    name: 'Amazon Nove Micro (AWS Bedrock)',
    selected: true,
  },
  {
    id: 'nova-lite',
    name: 'Amazon Nove Lite (AWS Bedrock)',
    selected: false,
  },
  {
    id: 'nova-pro',
    name: 'Amazon Nove Pro (AWS Bedrock)',
    selected: false,
  },
  {
    id: 'llama32-3b',
    name: 'Meta LLama 3.2 3B Instruct (AWS Bedrock)',
    selected: false,
  },
  {
    id: 'llama32-1b',
    name: 'Meta LLama 3.2 1B Instruct (AWS Bedrock)',
    selected: false,
  },
  {
    id: 'llama33-70b',
    name: 'Meta LLama 3.3 70B Instruct (AWS Bedrock)',
    selected: false,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    selected: false,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    selected: false,
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    selected: false,
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1-mini',
    selected: false,
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1-nano',
    selected: false,
  },
  // {
  //   id: 'claude-3.7-sonnet-v1',
  //   name: 'Claude 3.7 Sonnet v1 (AWS Bedrock)',
  //   selected: false,
  // },
  // {
  //   id: 'claude-3.5-sonnet-v2',
  //   name: 'Claude 3.5 Sonnet v2 (AWS Bedrock)',
  //   selected: false,
  // },
  // {
  //   id: 'claude-3.5-sonnet-v1',
  //   name: 'Claude 3.5 Sonnet v1 (AWS Bedrock)',
  //   selected: false,
  // },
  {
    id: 'o1-mini',
    name: 'o1 mini',
    selected: false,
  },
  {
    id: 'o3-mini',
    name: 'o3 mini',
    selected: false,
  },
  {
    id: 'o4-mini',
    name: 'o4 mini',
    selected: false,
  },
  {
    id: 'o1',
    name: 'GPT-o1',
    selected: false,
  },
  {
    id: 'cohere',
    name: 'Cohere Command R+ v1 (AWS Bedrock)',
    selected: false,
  },
];

function App() {
  const sessionId = uuidv7();

  return (
    <Chat models={models} sessionId={sessionId} />
  );
}

export default App;
