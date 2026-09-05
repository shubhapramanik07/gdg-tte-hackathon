# DHR Companion

An offline-first heritage guide for the Darjeeling Himalayan Railway.

## Run the MVP

Run `node server.js` and visit `http://localhost:4173` for the complete simulated demo. The project includes its own tiny static server, so it has no package installation step. Visit it once while online; the service worker then caches the app shell for offline use.

## Demo flow

1. The default journey position is Batasia Loop. A landmark prompt appears automatically.
2. Ask “Why does the train loop here?” or use a suggested prompt. The response is retrieved from the embedded local heritage library, with the current landmark ranked first.
3. Open **Guide settings** and switch through landmarks to demonstrate context-aware behaviour. The journey map does the same in a judge-friendly visual mode.
4. Turn off the network after the service worker has cached the shell: the knowledge base, retrieval and response fallback still run entirely in the browser.

## Architecture

- `app.js` contains a curated, browser-local DHR knowledge base and lightweight lexical embedding/retrieval scoring. Current location gets a deliberate relevance boost.
- The primary answer path is `window.DHRLocalLLM.generate()`, a small adapter intended for a locally packaged MediaPipe LLM Inference + Gemma model. Because a model binary is not included in this hackathon starter, the reliable default is the local factual answer composer. It retains RAG grounding and works in every modern browser.
- `sw.js` caches the application shell; no APIs, API keys or server are required.
- GPS selects the nearest curated landmark when supported. Simulated journey mode is always available.

The sources in the library are concise interpretation notes curated for demo use. For production, expand the local corpus with verified DHR archival and UNESCO material, and package a quantized on-device model as part of the app build.
