/**
 * 🤖⚜️ TI-GUY SERVICE - L'assistant IA québécois ⚜️🤖
 * 
 * Powered by DeepSeek V3 (Open Source)
 * Cost: $0.27 per 1M tokens (98% cheaper than GPT-4)
 * 
 * Ti-Guy parle joual authentique et comprend la culture québécoise!
 */

import OpenAI from 'openai';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

// Initialize DeepSeek client (OpenAI-compatible)
const deepseek = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_BASE_URL,
  dangerouslyAllowBrowser: true, // For client-side use
});

// ============================================================================
// TI-GUY SYSTEM PROMPT (Le cœur de sa personnalité!)
// ============================================================================

const TI_GUY_SYSTEM_PROMPT = `Tu es Ti-Guy, l'assistant IA de Zyeuté - le premier réseau social 100% québécois!

## 🎭 TA PERSONNALITÉ
- Tu parles en JOUAL AUTHENTIQUE de Montréal
- T'es chaleureux, drôle, et proche du monde
- Tu connais la culture québécoise par cœur
- T'es fier d'être québécois mais jamais snob
- Tu tutoies tout le monde (on est entre nous autres!)

## 🗣️ TON VOCABULAIRE JOUAL
Utilise naturellement ces expressions:
- "Tiguidou!" (parfait, excellent)
- "Pantoute" (pas du tout)
- "Icitte" (ici)
- "Frette" (froid)
- "Char" (voiture)
- "Pogner" (attraper, réussir)
- "Chum/blonde" (ami(e), copain/copine)
- "Tabarnak/câline/ostie" (jurons - utilise avec modération!)
- "Correct" (ok, bien)
- "Ben" (bien)
- "Pis" (puis, et)
- "Faque" (fait que, donc)
- "T'sais" (tu sais)
- "Chu" (je suis)
- "Y'a" (il y a)
- "C'est de même" (c'est comme ça)
- "Lâche pas!" (courage!)
- "C'est écoeurant!" (c'est incroyable - positif!)
- "Être sur la coche" (être au top)
- "Se pogner le beigne" (ne rien faire)
- "Virer su'l top" (devenir fou)

## 🍁 TES CONNAISSANCES QUÉBÉCOISES
Tu connais:
- La poutine, le pâté chinois, la tourtière, le pouding chômeur
- Les Canadiens de Montréal (GO HABS GO!)
- La Saint-Jean-Baptiste (24 juin)
- Les Cowboys Fringants, Céline, Les Colocs, Charlotte Cardin
- La cabane à sucre, le temps des sucres
- Les cônes orange (construction éternelle!)
- L'hiver québécois (-30 c'est frette en tabarnak)
- Les régions: Montréal, Québec, Saguenay, Gaspésie, etc.
- Les quartiers: Plateau, Mile End, Hochelaga, etc.

## 🎯 TES RESPONSABILITÉS
1. Générer des captions en joual pour les posts
2. Suggérer des hashtags québécois pertinents
3. Donner des idées de contenu créatif
4. Jaser avec le monde de façon naturelle
5. Célébrer la culture québécoise!

## ⚠️ TES LIMITES
- Reste positif et bienveillant
- Évite les sujets politiques controversés
- Pas de contenu inapproprié
- Respecte tout le monde

## 📅 CONTEXTE ACTUEL
- Saison: ${getCurrentSeason()}
- Prochaine fête: ${getNextQuebecEvent()}

Réponds TOUJOURS en joual québécois authentique! 🇨🇦⚜️`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Printemps (enfin la slush!)";
  if (month >= 5 && month <= 7) return "Été (temps de terrasse!)";
  if (month >= 8 && month <= 10) return "Automne (les couleurs sont malades!)";
  return "Hiver (frette en tabarnak!)";
}

function getNextQuebecEvent(): string {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  
  const events = [
    { month: 0, day: 1, name: "Jour de l'An" },
    { month: 1, day: 14, name: "Saint-Valentin" },
    { month: 2, day: 17, name: "Saint-Patrick (on est tous irlandais!)" },
    { month: 3, day: 1, name: "Poisson d'avril" },
    { month: 4, day: 24, name: "Fête des Patriotes" },
    { month: 5, day: 24, name: "Saint-Jean-Baptiste! ⚜️🎉" },
    { month: 6, day: 1, name: "Fête du Canada" },
    { month: 8, day: 1, name: "Rentrée scolaire" },
    { month: 9, day: 31, name: "Halloween" },
    { month: 10, day: 11, name: "Jour du Souvenir" },
    { month: 11, day: 25, name: "Noël!" },
  ];
  
  for (const event of events) {
    if (event.month > month || (event.month === month && event.day > day)) {
      return event.name;
    }
  }
  return events[0].name; // Wrap to next year
}

// ============================================================================
// TYPES
// ============================================================================

export type CaptionTone = 'fun' | 'inspiring' | 'casual' | 'hype';

export interface GenerateCaptionOptions {
  description: string;
  tone?: CaptionTone;
  includeEmojis?: boolean;
  maxLength?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ContentSuggestion {
  idea: string;
  hashtags: string[];
  bestTime: string;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * 📝 Génère une caption en joual pour un post
 */
export async function generateCaption(options: GenerateCaptionOptions): Promise<string> {
  const { description, tone = 'casual', includeEmojis = true, maxLength = 280 } = options;
  
  if (!DEEPSEEK_API_KEY) {
    console.warn('⚠️ DeepSeek API key not configured, using demo mode');
    return getDemoCaption(description, tone);
  }
  
  const toneInstructions = {
    fun: "Sois drôle et léger! Utilise de l'humour québécois.",
    inspiring: "Sois motivant et positif! Donne de l'énergie au monde.",
    casual: "Sois naturel et relax, comme si tu jasais avec un chum.",
    hype: "Sois EXCITÉ et ENTHOUSIASTE! C'est MALADE! 🔥",
  };
  
  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: TI_GUY_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Génère une caption pour ce post: "${description}"
          
Ton: ${toneInstructions[tone]}
${includeEmojis ? "Ajoute des emojis pertinents!" : "Pas d'emojis."}
Maximum ${maxLength} caractères.

Réponds SEULEMENT avec la caption, rien d'autre.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });
    
    return response.choices[0]?.message?.content?.trim() || getDemoCaption(description, tone);
  } catch (error) {
    console.error('❌ Ti-Guy caption error:', error);
    return getDemoCaption(description, tone);
  }
}

/**
 * 🏷️ Génère des hashtags québécois pertinents
 */
export async function generateHashtags(
  description: string,
  count: number = 5
): Promise<string[]> {
  if (!DEEPSEEK_API_KEY) {
    console.warn('⚠️ DeepSeek API key not configured, using demo mode');
    return getDemoHashtags(description);
  }
  
  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: TI_GUY_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Génère ${count} hashtags québécois pertinents pour: "${description}"

RÈGLES:
- Hashtags en français québécois
- Mélange de populaires et spécifiques
- Inclus au moins 1 hashtag de région/quartier si pertinent
- Format: #MotSansEspace

Réponds SEULEMENT avec les hashtags séparés par des espaces.`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });
    
    const content = response.choices[0]?.message?.content?.trim() || '';
    const hashtags = content.match(/#[\wàâäéèêëïîôùûüÿœæç]+/gi) || getDemoHashtags(description);
    return hashtags.slice(0, count);
  } catch (error) {
    console.error('❌ Ti-Guy hashtag error:', error);
    return getDemoHashtags(description);
  }
}

/**
 * 💬 Chat avec Ti-Guy (conversation libre)
 */
export async function chatWithTiGuy(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    console.warn('⚠️ DeepSeek API key not configured, using demo mode');
    return getDemoChatResponse(userMessage);
  }
  
  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: TI_GUY_SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.9,
    });
    
    return response.choices[0]?.message?.content?.trim() || getDemoChatResponse(userMessage);
  } catch (error) {
    console.error('❌ Ti-Guy chat error:', error);
    return getDemoChatResponse(userMessage);
  }
}

/**
 * 💡 Suggère des idées de contenu personnalisées
 */
export async function getContentSuggestions(
  userProfile: { region?: string; interests?: string[] },
  count: number = 3
): Promise<ContentSuggestion[]> {
  if (!DEEPSEEK_API_KEY) {
    console.warn('⚠️ DeepSeek API key not configured, using demo mode');
    return getDemoSuggestions();
  }
  
  const context = userProfile.region 
    ? `L'utilisateur est de ${userProfile.region}.`
    : "L'utilisateur est du Québec.";
  
  const interests = userProfile.interests?.length 
    ? `Ses intérêts: ${userProfile.interests.join(', ')}.`
    : '';
  
  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: TI_GUY_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `${context} ${interests}

Suggère ${count} idées de posts créatifs pour Zyeuté.

Pour CHAQUE idée, donne:
1. L'idée (1-2 phrases)
2. 3-4 hashtags suggérés
3. Le meilleur moment pour poster

Format ta réponse en JSON:
[{"idea": "...", "hashtags": ["#...", "#..."], "bestTime": "..."}]`,
        },
      ],
      max_tokens: 600,
      temperature: 0.9,
    });
    
    const content = response.choices[0]?.message?.content?.trim() || '';
    
    try {
      // Try to parse JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.warn('Could not parse suggestions JSON');
    }
    
    return getDemoSuggestions();
  } catch (error) {
    console.error('❌ Ti-Guy suggestions error:', error);
    return getDemoSuggestions();
  }
}

/**
 * 🎨 Génère un prompt optimisé pour Flux (images)
 */
export async function generateImagePrompt(
  description: string,
  style: 'photorealistic' | 'artistic' | 'vintage' | 'luxury' = 'photorealistic'
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    return `${description}, Quebec cultural elements, high quality, ${style} style`;
  }
  
  const styleGuides = {
    photorealistic: 'hyper-realistic photography, 8K, professional lighting',
    artistic: 'artistic, painterly, vibrant colors, creative composition',
    vintage: 'vintage Quebec aesthetic, 1970s film grain, nostalgic',
    luxury: 'luxury fashion photography, gold accents, elegant, premium',
  };
  
  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en prompts pour génération d'images IA.
Ton travail: Transformer des descriptions simples en prompts détaillés pour Flux.1

RÈGLES:
- Ajoute des détails visuels spécifiques
- Inclus l'éclairage, la composition, l'atmosphère
- Ajoute des éléments québécois subtils quand pertinent
- Style demandé: ${styleGuides[style]}
- Réponds SEULEMENT avec le prompt, rien d'autre
- Maximum 200 mots`,
        },
        {
          role: 'user',
          content: `Description: ${description}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    
    return response.choices[0]?.message?.content?.trim() 
      || `${description}, ${styleGuides[style]}`;
  } catch (error) {
    console.error('❌ Ti-Guy image prompt error:', error);
    return `${description}, ${styleGuides[style]}`;
  }
}

// ============================================================================
// DEMO MODE (When no API key)
// ============================================================================

function getDemoCaption(description: string, tone: CaptionTone): string {
  const demoCaptions: Record<CaptionTone, string[]> = {
    fun: [
      "Ça c'est d'la vraie affaire! 🔥⚜️",
      "On lâche pas la patate! 💪🍁",
      "C'est écoeurant comme c'est beau! 😍",
    ],
    inspiring: [
      "Chaque jour est une nouvelle chance de briller! ✨⚜️",
      "On est capables de grandes choses, ensemble! 🇨🇦💪",
      "La fierté québécoise, ça se partage! 🍁❤️",
    ],
    casual: [
      "Juste une p'tite shot de bonheur! 📸",
      "C'est de même que ça se passe icitte! ⚜️",
      "Un moment ben correct avec vous autres! 🤙",
    ],
    hype: [
      "TABARNAK QUE C'EST MALADE!!! 🔥🔥🔥",
      "ÇA C'EST DU STOCK QUÉBÉCOIS!!! 💥⚜️💥",
      "ON EST SUR LA COCHE EN CRISS!!! 🚀🍁🚀",
    ],
  };
  
  const captions = demoCaptions[tone];
  return captions[Math.floor(Math.random() * captions.length)];
}

function getDemoHashtags(description: string): string[] {
  const baseHashtags = ['#Zyeuté', '#Québec', '#FiertéQuébécoise', '#MTL', '#JoualPower'];
  
  // Add contextual hashtags based on keywords
  const contextHashtags: Record<string, string[]> = {
    poutine: ['#Poutine', '#FoodQuébec', '#ComfortFood'],
    hiver: ['#HiverQuébécois', '#Frette', '#Neige'],
    été: ['#ÉtéMTL', '#Terrasse', '#SoleilQuébec'],
    montréal: ['#MTL', '#514', '#MontréalLife'],
    québec: ['#VilleDeQuébec', '#418', '#VieuxQuébec'],
  };
  
  const lowerDesc = description.toLowerCase();
  for (const [key, tags] of Object.entries(contextHashtags)) {
    if (lowerDesc.includes(key)) {
      return [...tags, ...baseHashtags].slice(0, 5);
    }
  }
  
  return baseHashtags;
}

function getDemoChatResponse(message: string): string {
  const responses = [
    "Heille! Ça fait plaisir de jaser avec toé! T'sais, icitte à Zyeuté, on est comme une grosse famille québécoise. Qu'est-ce que j'peux faire pour toé? ⚜️",
    "Ben oui, chu là pour t'aider! Que ce soit pour des captions, des idées de posts, ou juste pour placoter, Ti-Guy est ton chum! 🤙",
    "Tiguidou! J'adore quand le monde vient me jaser! Faque, c'est quoi ton affaire? 🍁",
    "Oh boy! Belle question ça! Laisse-moé te répondre comme du monde... 🔥",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function getDemoSuggestions(): ContentSuggestion[] {
  return [
    {
      idea: "Montre ta poutine préférée! Dis-nous c'est quoi ta cantine de quartier pis pourquoi c'est la meilleure.",
      hashtags: ['#PoutineQuébec', '#FoodMTL', '#Zyeuté', '#ComfortFood'],
      bestTime: "Vendredi midi (tout le monde a faim!)",
    },
    {
      idea: "Partage un spot secret de ton quartier que personne connaît. Un café, un parc, une vue...",
      hashtags: ['#MTLSecrets', '#QuartierMTL', '#LocalLove', '#Zyeuté'],
      bestTime: "Samedi matin (les gens explorent!)",
    },
    {
      idea: "Fais une vidéo 'Un mot québécois que le monde comprend pas' - enseigne du joual!",
      hashtags: ['#JoualPower', '#QuébecFrançais', '#LearnJoual', '#FiertéQC'],
      bestTime: "Dimanche soir (le monde scroll!)",
    },
  ];
}

// ============================================================================
// EXPORTS
// ============================================================================

export const tiGuy = {
  generateCaption,
  generateHashtags,
  chat: chatWithTiGuy,
  getSuggestions: getContentSuggestions,
  generateImagePrompt,
};

export default tiGuy;
