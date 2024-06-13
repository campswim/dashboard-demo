import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/styles.scss';

ReactDOM.render(
  process.env.REACT_APP_ENV.includes('development') ? 
  (
    <StrictMode>
      <App />
    </StrictMode>
  )
  :
  (
    <App />
  ),
  document.getElementById('root')
);
 