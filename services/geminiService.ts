import { GoogleGenAI } from "@google/genai";

// Initialize the client safely
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAgenda = async (title: string, duration: number): Promise<string> => {
  const client = getClient();
  if (!client) return "Erro: Chave de API não configurada. Preencha manualmente.";

  try {
    const prompt = `
      Crie uma pauta de reunião profissional e estruturada para uma reunião com o título: "${title}".
      A duração da reunião é de ${duration} minutos.
      
      Retorne APENAS o conteúdo da pauta em formato Markdown limpo, com tópicos e tempos sugeridos para cada tópico.
      Não inclua introduções como "Aqui está sua pauta". Seja direto.
      Use português do Brasil.
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a pauta.";
  } catch (error) {
    console.error("Error generating agenda:", error);
    return "Erro ao conectar com a IA. Por favor, tente novamente ou escreva manualmente.";
  }
};
