import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider } from "./lib/convex.js";
import { convex } from "./lib/convex.js";
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConvexProvider client={convex}>
      <App />
      </ConvexProvider>
);

