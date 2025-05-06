import './App.css';
import { v7 as uuidv7 } from 'uuid';
import { Chat } from './features/chat';
import { models } from './constnts';

function App() {
  const sessionId = uuidv7();

  return (
    <Chat models={models} sessionId={sessionId} />
  );
}

export default App;
