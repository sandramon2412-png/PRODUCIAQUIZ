const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || '';
const CLAUDE_API_KEY = (import.meta as any).env?.VITE_CLAUDE_API_KEY || '';

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

async function callGroq(prompt: string, systemInstruction: string, history: Message[] = [], options?: { temperature?: number; max_tokens?: number }): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('Groq API key no configurada');

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemInstruction },
  ];

  for (const msg of history) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.parts[0].text,
    });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callClaude(prompt: string, systemInstruction: string, history: Message[] = []): Promise<string> {
  if (!CLAUDE_API_KEY) throw new Error('Claude API key no configurada');

  const messages: { role: 'user' | 'assistant'; content: string }[] = [];

  for (const msg of history) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.parts[0].text,
    });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemInstruction,
      messages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorData}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callClaudeWithImage(prompt: string, systemInstruction: string, imageBase64: string): Promise<string> {
  if (!CLAUDE_API_KEY) throw new Error('Claude API key no configurada');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: systemInstruction,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Claude Vision error ${response.status}: ${errorData}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

export class AIService {
  hasApiKeys(): boolean {
    return !!(GROQ_API_KEY || CLAUDE_API_KEY);
  }

  async analyzeScreenshot(imageBase64: string, customPrompt?: string): Promise<string> {
    if (!CLAUDE_API_KEY) {
      return 'Se necesita Claude API key para analizar imagenes.';
    }

    const prompt = customPrompt || 'Analiza esta captura de pantalla. Describe lo que ves y dame recomendaciones practicas para mejorar la oferta, el copy, el diseno o la estrategia que se muestra.';
    const systemInstruction = `Eres Lloyd, el asistente de IA de PRODUCIA. El usuario acaba de tomar una captura de pantalla de su computadora. Analiza lo que ves en la imagen y da consejos practicos y accionables. Responde en espanol. Se directo y util.`;

    return callClaudeWithImage(prompt, systemInstruction, imageBase64);
  }

  async generateModelAnalysis(productDescription: string, history: Message[] = []) {
    const systemInstruction = `Eres el Bot Modelador de PRODUCIA, especializado en ayudar a vendedores de productos digitales hispanos a modelar productos ganadores.

Tu flujo de trabajo es:
1. El usuario busca productos con muchos anuncios en Facebook Ads Library.
2. Tú los analizas para identificar QUÉ los hace exitosos (ángulo, promesa, avatar).
3. Sugieres cómo MEJORARLO y diferenciarlo (no copiar, sino mejorar).
4. Propones cómo empaquetarlo visualmente (Gamma/Canva) y estructura de página (Lovable).
5. Sugieres precio para Hotmart/Shopify y ángulos para Facebook Ads.

REGLAS DE RESPUESTA:
- Sé directo, práctico y sin relleno.
- Usa un tono profesional pero cercano.
- Estructura siempre tu respuesta en estos 5 pasos:
  1. ANÁLISIS DE ÉXITO (Por qué funciona)
  2. MEJORAS Y DIFERENCIACIÓN (Cómo hacerlo único)
  3. ESTRUCTURA DEL PRODUCTO (Contenido para Gamma/Canva)
  4. ÁNGULOS DE VENTA (3 ideas para Facebook Ads)
  5. PRECIO SUGERIDO (Rango para Hotmart)

IMPORTANTE: No puedes navegar por URLs directamente. Si el usuario te da un link, pídele que te pegue el texto de la página o la descripción del anuncio.`;

    return this.generateCustomBotResponse(productDescription, systemInstruction, history);
  }

  async generateCustomBotResponse(prompt: string, systemInstruction: string, history: Message[] = []): Promise<string> {
    if (!this.hasApiKeys()) {
      return 'Error de configuracion: Las API keys de IA no estan configuradas. El administrador debe agregar VITE_GROQ_API_KEY y/o VITE_CLAUDE_API_KEY en las variables de entorno de Vercel y redesplegar.';
    }

    // Try Groq first (fast, free)
    if (GROQ_API_KEY) {
      try {
        console.log('Usando Groq (principal)...');
        const response = await callGroq(prompt, systemInstruction, history);
        if (response) return response;
      } catch (error) {
        console.warn('Groq fallo, intentando con Claude...', error);
      }
    }

    // Fallback to Claude (smart, reliable)
    if (CLAUDE_API_KEY) {
      try {
        console.log('Usando Claude (respaldo)...');
        const response = await callClaude(prompt, systemInstruction, history);
        if (response) return response;
      } catch (error) {
        console.error('Claude tambien fallo:', error);
      }
    }

    return 'Lo siento, ambos servicios de IA estan temporalmente no disponibles. Por favor intenta de nuevo en unos momentos.';
  }

  async generateQuizJSON(title: string, description: string): Promise<string> {
    if (!this.hasApiKeys()) {
      throw new Error('API keys no configuradas');
    }

    const systemInstruction = `Responde UNICAMENTE con un objeto JSON valido. Sin texto antes ni despues. Sin markdown. Sin explicaciones.`;

    const prompt = `Genera un quiz en español sobre: "${title}" - ${description}

El JSON debe tener esta estructura EXACTA:
{
  "title": "titulo del quiz",
  "description": "descripcion corta",
  "questions": [
    {"id": "1", "text": "pregunta sobre el tema", "type": "multiple-choice", "options": [{"id": "o1", "text": "opcion 1", "value": 1}, {"id": "o2", "text": "opcion 2", "value": 2}, {"id": "o3", "text": "opcion 3", "value": 3}, {"id": "o4", "text": "opcion 4", "value": 4}]},
    {"id": "2", "text": "pregunta 2", "type": "multiple-choice", "options": [{"id": "o1", "text": "opcion 1", "value": 1}, {"id": "o2", "text": "opcion 2", "value": 2}, {"id": "o3", "text": "opcion 3", "value": 3}, {"id": "o4", "text": "opcion 4", "value": 4}]},
    {"id": "3", "text": "pregunta 3", "type": "multiple-choice", "options": [{"id": "o1", "text": "opcion 1", "value": 1}, {"id": "o2", "text": "opcion 2", "value": 2}, {"id": "o3", "text": "opcion 3", "value": 3}, {"id": "o4", "text": "opcion 4", "value": 4}]},
    {"id": "4", "text": "pregunta 4", "type": "multiple-choice", "options": [{"id": "o1", "text": "opcion 1", "value": 1}, {"id": "o2", "text": "opcion 2", "value": 2}, {"id": "o3", "text": "opcion 3", "value": 3}, {"id": "o4", "text": "opcion 4", "value": 4}]},
    {"id": "5", "text": "pregunta 5", "type": "multiple-choice", "options": [{"id": "o1", "text": "opcion 1", "value": 1}, {"id": "o2", "text": "opcion 2", "value": 2}, {"id": "o3", "text": "opcion 3", "value": 3}, {"id": "o4", "text": "opcion 4", "value": 4}]}
  ],
  "results": [
    {"id": "r1", "title": "Principiante", "desc": "descripcion para principiantes", "minScore": 5, "maxScore": 10},
    {"id": "r2", "title": "Intermedio", "desc": "descripcion para intermedios", "minScore": 11, "maxScore": 15},
    {"id": "r3", "title": "Avanzado", "desc": "descripcion para avanzados", "minScore": 16, "maxScore": 20}
  ]
}

REGLAS:
- Las 5 preguntas DEBEN ser sobre "${title}" y "${description}"
- Cada pregunta tiene EXACTAMENTE 4 opciones con valores 1,2,3,4
- Los 3 resultados cubren rangos 5-10, 11-15, 16-20
- Tono persuasivo y profesional en español
- SOLO JSON, nada mas`;

    // Intentar con Groq primero (temperatura baja para JSON confiable)
    if (GROQ_API_KEY) {
      try {
        const response = await callGroq(prompt, systemInstruction, [], { temperature: 0.3, max_tokens: 8192 });
        if (response) return response;
      } catch (error) {
        console.warn('Groq fallo para quiz, intentando Claude...', error);
      }
    }

    // Fallback a Claude
    if (CLAUDE_API_KEY) {
      try {
        const response = await callClaude(prompt, systemInstruction, []);
        if (response) return response;
      } catch (error) {
        console.error('Claude tambien fallo para quiz:', error);
      }
    }

    throw new Error('No se pudo generar el quiz. Verifica tus API keys.');
  }

  async generateImage(prompt: string): Promise<string | null> {
    console.warn('Generacion de imagenes no disponible con Groq/Claude');
    return null;
  }
}

export const aiService = new AIService();
