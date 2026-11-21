/* @refresh reload */
import App from './App';

import { createRouter } from '@solidjs/router';
import { render } from '@solidjs/web';

import './index.css';

const root = document.getElementById('root');

const Router = createRouter({
  routes: [{ path: '/', component: App }],
});
if (root) {
  render(() => <Router>{(props) => props.children}</Router>, root);
}
