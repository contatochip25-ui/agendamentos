import { GoogleGenAI } from "@google/genai";

// Initialize the client safely
const getClient = () => {
  try {
    // Check if process is defined (avoids ReferenceError in some pure browser environments)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    console.warn("API Key is missing in process.env. AI features will be disabled.");
    return null;
  } catch (e) {
    console.error("Failed to initialize GenAI client:", e);
    return null;
  }
};

export const generateAgenda = async (title: string, duration: number): Promise<string> => {
  const client = getClient();
  if (!client) return "⚠️ Funcionalidade indisponível: Chave de API não configurada.";

  try {
    const prompt = `
      Atue como uma especialista em vendas consultivas do suplemento natural CandiSTOP (focado em saúde íntima e bem-estar).
      Crie um roteiro de abordagem de vendas ou follow-up para uma cliente/lead identificada como: "${title}".
      O tempo disponível para a conversa é de ${duration} minutos.
      
      Retorne APENAS o conteúdo em tópicos breves (Markdown).
      Estruture a resposta em:
      1. Quebra-gelo & Conexão (Rapport)
      2. Sondagem de Dores (Identificar necessidades sem parecer médica, foco em desconforto e qualidade de vida)
      3. Apresentação do CandiSTOP (Benefícios do encapsulado, naturalidade, resultados)
      4. Oferta Irresistível & Fechamento (Gatilhos de escassez/urgência)
      
      Seja empática, persuasiva, vendedora e profissional. Use português do Brasil.
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Não foi possível gerar o roteiro de vendas.";
  } catch (error) {
    console.error("Error generating agenda:", error);
    return "Erro de conexão com a IA. Por favor, crie o roteiro manualmente.";
  }
};