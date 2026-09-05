# DHR Companion — offline local RAG

The companion now follows a real local pipeline:

```text
GPS or demo landmark → local semantic embedding → IndexedDB retrieval + location bias → on-device LLM → answer
```

No request is made to a cloud AI API. The app’s PWA shell, corpus and retrieval engine are cached by the service worker.

## Run

```powershell
node server.js
```

Open `http://localhost:4173`. Use **Guide settings** to switch simulated locations or opt into GPS. The app shows a landmark notification when the nearest known DHR point changes.

## What is genuinely local now

- On first launch, `data/dhr-knowledge.json` is read from the app bundle, vectorized, and persisted in the `dhr-companion-local-rag` IndexedDB database. Subsequent retrieval reads the documents and their vectors from IndexedDB.
- Retrieval uses cosine similarity of local 128-dimensional feature-hashed semantic embeddings, with synonym normalization and geographic/route proximity bias. It is not a keyword-ranking path.
- The answer prompt includes only the selected local source notes and current landmark. The provider is explicitly told not to invent facts outside that context.
- GPS is processed in the browser. The nearest DHR landmark biases retrieval, and the geolocation watch triggers a new heritage-moment card on approach.
- When a generator is unavailable, the app uses a local extractive reader that selects relevant sentences from retrieved notes. It has no cloud dependency and no canned response templates.

## On-device Gemma

`llm-provider.js` contains a production-shaped `MediaPipeGemmaProvider`: it loads the official MediaPipe `FilesetResolver` and `LlmInference`, initializes a locally hosted `.litertlm` Gemma model, and calls `generateResponse()` with the retrieved RAG prompt. It also supports loading a model file selected from the user’s device in **Guide settings**.

A model binary and the MediaPipe browser runtime are intentionally not committed here: web-converted Gemma files are very large and have their own distribution licence. To activate Gemma generation, add these locally (and then load the page once so the service worker caches them):

```text
vendor/mediapipe/genai_bundle.mjs
vendor/mediapipe/wasm/…
models/gemma-3n-E2B-it-int4-Web.litertlm
```

These paths are the defaults in `llm-provider.js`; alternatively choose a downloaded `.litertlm` file in the UI. Browsers with a compatible built-in local Prompt API are also tried. If neither runtime is present, the status honestly reads **Local retrieval reader** and the extractive offline fallback remains active.

Google’s official guide documents that MediaPipe LLM Inference runs models fully on-device in WebGPU-capable browsers, uses `@mediapipe/tasks-genai`, and initializes a local model with `modelAssetPath` / `generateResponse`. The same guide notes that the MediaPipe API is maintenance-mode and recommends LiteRT-LM for new work; the provider boundary keeps that upgrade isolated.

## Demo script

1. Start at the default Batasia Loop position and ask, “Why does the train loop here?”
2. Open **Guide settings**, choose Ghum or Tindharia, and ask the same broad question again. The surfaced sources change because of location-aware semantic retrieval.
3. Open **Offline library** to show the material is labelled IndexedDB/vector-ready.
4. Disconnect after the first load. Simulated location, IndexedDB retrieval, and the installed local model/fallback continue without signal.
