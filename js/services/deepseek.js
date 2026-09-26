// Cliente de la API de DeepSeek a través de Edge Function de Supabase.
// La API key real vive como secret en Supabase y NO se expone al navegador.
import { supabase } from "./supabase.js";

const EDGE_URL = "https://uexnfoqglhgjovvchqcu.supabase.co/functions/v1/deepseek-proxy";

export async function callDeepSeek(messages, options = {}) {
  // Obtener token del usuario logueado
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Debes iniciar sesión para usar esta función.");
  }

  const body = {
    messages,
    options: {
      model: options.model || "deepseek-chat",
      temperature: options.temperature ?? 0.3,
      maxTokens: options.maxTokens ?? 2000,
      jsonMode: options.jsonMode || false
    }
  };

  const response = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify(body)
  });

  if (response.status === 401) {
    throw new Error("Tu sesión ha caducado. Vuelve a iniciar sesión.");
  }
  if (response.status === 429) {
    throw new Error("Demasiadas peticiones. Espera un momento.");
  }
  if (!response.ok) {
    let errText = "";
    try {
      const errJson = await response.json();
      errText = errJson.error || JSON.stringify(errJson);
    } catch {
      errText = await response.text();
    }
    throw new Error(`Error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.content;
}
