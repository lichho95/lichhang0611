import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { wedding } from './wedding.config';

// Khi F5/refresh, luôn trở về đầu câu chuyện thay vì restore vị trí scroll cũ.
if (wedding.sections.opening) {
  window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
