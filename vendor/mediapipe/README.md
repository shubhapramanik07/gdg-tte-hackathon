# Local MediaPipe runtime

Place a locally bundled copy of the MediaPipe GenAI browser runtime at `genai_bundle.mjs` and its matching WASM files under `wasm/`. The app deliberately references local paths so that after the first service-worker cache, model inference does not need a CDN.

The expected JavaScript exports are `FilesetResolver` and `LlmInference`, as provided by `@mediapipe/tasks-genai`.
