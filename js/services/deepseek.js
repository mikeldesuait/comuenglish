// Cliente de la API de DeepSeek.
import { loadApiKey } from "../core/storage.js";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export async function callDeepSeek(messages, options = {}) {
  const apiKey = loadApiKey();
  if (!apiKey) throw new Error("API Key no configurada. Ve a Ajustes.");

  const body = {
    model: options.model || "deepseek-chat",
    messages,
    stream: false,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 2000
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (response.status === 429) throw new Error("Demasiadas peticiones. Espera un momento.");
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
