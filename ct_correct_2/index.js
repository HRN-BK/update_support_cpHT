// Sử dụng các thư viện từ window (loaded từ CDN)
const React = window.React;
const ReactDOM = window.ReactDOM;

// Thành phần BrowserRouter từ React Router không có sẵn
// nên thay thế bằng div đơn giản
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 