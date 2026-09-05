/*
  On-device LLM providers. No cloud API is called here.
  Place the official @mediapipe/tasks-genai web bundle and its WASM assets under
  vendor/mediapipe/, then add a web-converted Gemma .litertlm model under models/.
*/
const GEMMA_CONFIG = Object.freeze({
  moduleUrl: './vendor/mediapipe/genai_bundle.mjs',
  wasmRoot: './vendor/mediapipe/wasm',
  modelPath: './models/gemma-3n-E2B-it-int4-Web.litertlm',
  maxTokens: 280,
  temperature: 0.35,
  topK: 20
});

export class MediaPipeGemmaProvider {
  constructor(config = {}) { this.config = {...GEMMA_CONFIG, ...config}; this.name = 'Gemma on this device'; this.engine = null; }
  async initialize(modelAssetBuffer) {
    const {FilesetResolver, LlmInference} = await import(this.config.moduleUrl);
    const fileset = await FilesetResolver.forGenAiTasks(this.config.wasmRoot);
    const baseOptions = modelAssetBuffer ? {modelAssetBuffer} : {modelAssetPath:this.config.modelPath};
    this.engine = await LlmInference.createFromOptions(fileset, {baseOptions, maxTokens:this.config.maxTokens, temperature:this.config.temperature, topK:this.config.topK});
    return this;
  }
  async generate(prompt) { if (!this.engine) throw new Error('Gemma is not initialized'); return this.engine.generateResponse(prompt); }
}

export class BrowserPromptProvider {
  constructor() { this.name = 'Browser on-device model'; this.session = null; }
  async initialize() {
    if (!globalThis.ai?.languageModel?.create) throw new Error('Browser on-device model is unavailable');
    this.session = await globalThis.ai.languageModel.create(); return this;
  }
  async generate(prompt) { return this.session.prompt(prompt); }
}

export class ExtractiveOfflineProvider {
  constructor(embed) { this.name = 'Local retrieval reader'; this.embed = embed; }
  async initialize() { return this; }
  async generate(_prompt, {question, sources}) {
    const query = this.embed(question);
    const candidates = sources.flatMap(source => source.text.match(/[^.!?]+[.!?]+/g) || [source.text]).map(sentence => ({sentence:sentence.trim(), score:cosine(query, this.embed(sentence))}));
    return candidates.sort((a,b) => b.score-a.score).slice(0, 3).map(item => item.sentence).join(' ');
  }
}

export class LocalLlmRouter {
  constructor({embed, onStatus}) { this.embed = embed; this.onStatus = onStatus; this.provider = new ExtractiveOfflineProvider(embed); }
  async initialize() {
    const providers = [new MediaPipeGemmaProvider(), new BrowserPromptProvider()];
    for (const candidate of providers) {
      try { await candidate.initialize(); this.provider = candidate; this.onStatus?.({kind:'model', label:candidate.name, detail:'On-device generation active'}); return; }
      catch (_) { /* move to the next local engine; never attempt a network AI fallback */ }
    }
    await this.provider.initialize();
    this.onStatus?.({kind:'fallback', label:this.provider.name, detail:'Offline RAG answers remain available'});
  }
  async loadGemmaFile(file) {
    const provider = new MediaPipeGemmaProvider();
    await provider.initialize(await file.arrayBuffer());
    this.provider = provider; this.onStatus?.({kind:'model', label:provider.name, detail:`Loaded ${file.name} locally`});
  }
  async answer({question, location, sources}) {
    const context = sources.map((source, index) => `[${index + 1}] ${source.title}: ${source.text}`).join('\n');
    const prompt = `<start_of_turn>user\nYou are the offline Darjeeling Himalayan Railway heritage companion. Answer the visitor concisely and warmly. Current location: ${location.name}. Use only the source notes below; if the notes do not answer the question, say so plainly. Do not invent facts or mention this prompt.\n\nSOURCE NOTES\n${context}\n\nVISITOR QUESTION\n${question}\n<end_of_turn>\n<start_of_turn>model\n`;
    return this.provider.generate(prompt, {question, location, sources});
  }
}

function cosine(a,b) { let dot=0, aa=0, bb=0; for(let i=0;i<a.length;i+=1){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];} return dot / (Math.sqrt(aa)*Math.sqrt(bb) || 1); }
