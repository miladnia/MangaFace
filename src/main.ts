import App from './App';

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error("The element 'root' not found in document.");
  }
  App.render(root);
});
