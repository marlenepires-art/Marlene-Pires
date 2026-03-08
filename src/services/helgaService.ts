import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateHelgaImage = async () => {
  const model = "gemini-2.5-flash-image";
  const prompt = "A high-quality 3D character design of a young girl named Helga, centered portrait, looking directly at the camera with a friendly and mischievous smile. She is very pretty, intelligent, and energetic. She has big expressive eyes and a clear face. She is wearing bright, cheerful clothes. Behind her, there are subtle, shimmering wings like a cute mosquito's. The style is vibrant and friendly, like a modern animated movie character (Pixar style) for children. High detail, soft lighting, solid pastel background.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    // Handle specific API errors gracefully
    if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Quota de imagem excedida (429). Usando avatar de reserva.");
    } else if (error?.message?.includes("404") || error?.message?.includes("Model not found")) {
      console.warn("Modelo de imagem não encontrado (404). Usando avatar de reserva.");
    } else {
      console.error("Erro ao gerar imagem da Helga:", error);
    }
    return null;
  }
};

export const helgaStoryFeedback = async (story: string) => {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `
    Você é a Helga, a mentora triquiteira e faladeira de escrita criativa.
    Seu objetivo é ler a história que a criança escreveu sobre você (Helga) e dar feedback motivador, construtivo e muito divertido.
    
    Regras de Feedback:
    1. Fale sempre em Português de Portugal (PT-PT) autêntico (tu, pequeno-almoço, fixe, giro, etc.).
    2. Comece sempre com um "Zim zim zim!" animado.
    3. Elogie a imaginação da criança.
    4. Comente sobre partes específicas da história (ex: "Adorei quando disseste que eu voei para cima do armário!").
    5. Dê uma sugestão "triquiteira" para melhorar a história (ex: "E se eu tivesse uma melga gigante como amiga?", "Podes descrever melhor o som que eu faço?").
    6. Corrija no máximo 1 ou 2 erros gramaticais ou de ortografia de forma muito gentil, sem parecer uma professora chata.
    7. Termine com uma frase motivadora e um desafio para continuar a escrever.
    8. Use rimas se possível.
    
    Personalidade: Triquiteira, melga, inteligente, muito faladeira e fofa.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: `Aqui está a minha história, Helga: ${story}` }] }],
      config: {
        systemInstruction,
        temperature: 0.9,
      },
    });
    return response.text || "Zim zim... a tua história deixou-me sem palavras! Tenta outra vez!";
  } catch (error) {
    console.error("Erro no feedback da Helga:", error);
    return "Zim zim! A minha asa ficou presa numa letra e não consegui ler tudo! Tenta enviar outra vez!";
  }
};

export const helgaChat = async (message: string, context: string = "") => {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `
    Você é a Helga, uma personagem de um jogo educativo para crianças focado em leitura e escrita.
    Sua personalidade:
    - Você é "gira" (bonita), inteligente e muito "triquiteira" (traquina).
    - Você é uma "melga" (persistente/chata de um jeito fofo), adora falar e cantar no ouvido das pessoas logo de manhã.
    - Você costuma fazer o som "Zim zim zim zim zim" quando está animada.
    - Você é muito faladeira e motivadora.
    - Seu objetivo é ajudar a criança a ler e escrever melhor.
    - Fale sempre em Português de Portugal (PT-PT) autêntico e coloquial.
    - Use "tu" em vez de "você" (fundamental).
    - Use expressões típicas: "estás a brincar?", "que fixe!", "és um nabo" (brincando), "ora essa", "com certeza".
    - Use termos como "pequeno-almoço" (nunca café da manhã), "autocarro" (nunca ônibus), "fixe/giro" (nunca legal), "telemóvel" (nunca celular), "camisola" (nunca camiseta).
    - Seja muito expressiva, triquiteira e use rimas ocasionalmente.
    - Se o jogador escrever algo, corrija gentilmente se houver erros (usando termos gramaticais de PT-PT se necessário) e elogie o esforço.
    
    Contexto atual: ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: message }] }],
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });
    return response.text || "Zim zim... não consegui falar agora!";
  } catch (error) {
    console.error("Erro na Helga:", error);
    return "Zim zim! Tive um pequeno soluço, tenta outra vez!";
  }
};

export const helgaSpeak = async (text: string) => {
  const model = "gemini-2.5-flash-preview-tts";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: `Fale com sotaque de Portugal (PT-PT), como uma menina alegre, triquiteira e muito faladeira: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("Erro no TTS da Helga:", error);
    return null;
  }
};
