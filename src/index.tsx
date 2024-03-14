import ReactDOM from 'react-dom/client';
import React from 'react';


document.body.innerHTML = '<div id="app"></div>';

const el: HTMLElement | null = document.getElementById('app');
if (el === null) {
    throw new Error("No app element in index.html")
}
const root = ReactDOM.createRoot(el);

const App = React.lazy(() => import("./App"));

root.render(<App />)