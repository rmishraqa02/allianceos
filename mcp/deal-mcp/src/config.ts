export const config = {
  apiBaseUrl:
    process.env.ALLIANCEOS_API_URL ??
    'http://localhost:3001',

  ollamaUrl:
    process.env.OLLAMA_URL ??
    'http://localhost:11434',

  ollamaModel:
    process.env.OLLAMA_MODEL ??
    'qwen3:4b',
};