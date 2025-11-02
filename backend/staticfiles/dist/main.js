import { App } from './App.js';
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (!root) {
        console.error('Не найден контейнер #root');
        return;
    }
    if (typeof ReactDOM.createRoot === 'function') {
        const rootInstance = ReactDOM.createRoot(root);
        rootInstance.render(React.createElement(App, null));
    }
    else {
        ReactDOM.render(React.createElement(App, null), root);
    }
});
