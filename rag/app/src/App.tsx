import './App.css';
import { Chat } from './features/chat';

import { models } from '@llm-ts-example/common-core';
import { v7 as uuidv7 } from 'uuid';

function App() {
  const sessionId = uuidv7();

  return <Chat models={models} sessionId={sessionId} />;
}

export default App;
