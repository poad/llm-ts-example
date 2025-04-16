import { render } from 'solid-js/web';
import './index.css';

import ChatWindow from './chat';

const element = document.getElementById('root');
if (element) {
  render(() => <ChatWindow />, element);
}
