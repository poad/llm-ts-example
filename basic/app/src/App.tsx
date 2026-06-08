import './App.css';
import { Chat } from './features/chat/components/Chat';
import { v7 as uuidv7 } from 'uuid';
import { models } from '@llm-ts-example/common-core';

function App() {
  const sessionId = uuidv7();

  return (
    <Chat models={models} sessionId={sessionId} />
  );
}

export default App;
