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
      Atue como uma assistente clínica. Crie uma pauta/resumo estruturado para um agendamento clínico com o título: "${title}".
      A duração é de ${duration} minutos.
      
      Retorne APENAS o conteúdo em tópicos breves (Markdown).
      Foque em: Anamnese, Procedimento/Exame e Orientações Finais.
      Seja cordial e profissional. Use português do Brasil.
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a sugestão.";
  } catch (error) {
    console.error("Error generating agenda:", error);
    return "Erro de conexão com a IA. Por favor, preencha manualmente.";
  }
};