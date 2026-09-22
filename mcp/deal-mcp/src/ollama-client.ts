import { config } from './config.js';

type OllamaResponse = {
  response?: string;
};

export async function askOllama(
  prompt: string,
): Promise<string> {
  const response = await fetch(
    `${config.ollamaUrl}/api/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Ollama request failed: ${response.status} ${text}`,
    );
  }

  const data =
    (await response.json()) as OllamaResponse;

  if (
    !data.response ||
    !data.response.trim()
  ) {
    throw new Error(
      'Ollama returned an empty response',
    );
  }

  return data.response.trim();
}