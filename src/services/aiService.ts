import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-3-flash-preview";

export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    // Try multiple sources for the API key
    const apiKey = 
      process.env.GEMINI_API_KEY || 
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (window as any).GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ Lloyd Error: GEMINI_API_KEY no encontrada. Configúrala en el panel de Secrets de AI Studio.");
    } else if (apiKey === "MY_GEMINI_API_KEY" || apiKey.length < 10) {
      console.warn("⚠️ Lloyd Warning: GEMINI_API_KEY parece ser un marcador de posición o es demasiado corta.");
    } else {
      console.log("✅ Lloyd: API Key detectada correctamente.");
    }
    
    this.ai = new GoogleGenAI({ apiKey: apiKey || "" });
  }

  async generateModelAnalysis(productDescription: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
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

    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: productDescription }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text;
  }

  async generateCustomBotResponse(prompt: string, systemInstruction: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text;
  }

  async generateImage(prompt: string) {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Genera una imagen publicitaria de alta conversión para Meta Ads basada en este concepto: ${prompt}. Estilo profesional, limpio, orientado a ventas DTC (Direct-to-Consumer).`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  }
}

export const aiService = new AIService();
