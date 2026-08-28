import { mount } from 'svelte';
import App from './App.svelte';

// Tauri builds import the same entry in a webview (no DOMContentLoaded needed in a module scope
// when index.html renders <div id="app">). Guard for the rare case the node exists late.
const app = mount(App, { target: document.getElementById('app')! });

// Export so Vitest/Svelte testing can tear down.
export { app };
