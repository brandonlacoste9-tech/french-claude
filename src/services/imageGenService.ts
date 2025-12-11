/**
 * 🎨⚜️ IMAGE GENERATION SERVICE - Flux.1 Schnell ⚜️🎨
 * 
 * Powered by Flux.1 Schnell via Fal.ai (Open Source)
 * Cost: $0.003 per image (92% cheaper than DALL-E 3)
 * Speed: 4-8 seconds per generation
 * 
 * Génère des images luxueuses avec une touche québécoise!
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const FAL_API_KEY = process.env.NEXT_PUBLIC_FAL_API_KEY || process.env.FAL_API_KEY;
const FAL_BASE_URL = 'https://fal.run/fal-ai';

// ============================================================================
// TYPES
// ============================================================================

export type ImageStyle = 
  | 'photorealistic'
  | 'cinematic'
  | 'luxury'
  | 'vintage_quebec'
  | 'artistic'
  | 'glassmorphism'
  | 'neon';

export type AspectRatio = 
  | 'square'      // 1:1 (1024x1024)
  | 'portrait'    // 3:4 (768x1024)
  | 'landscape'   // 4:3 (1024x768)
  | 'story'       // 9:16 (576x1024)
  | 'wide'        // 16:9 (1024x576)

export interface GenerateImageOptions {
  prompt: string;
  style?: ImageStyle;
  aspectRatio?: AspectRatio;
  negativePrompt?: string;
  seed?: number;
  numInferenceSteps?: number;
}

export interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  seed: number;
  prompt: string;
  style: ImageStyle;
  cost: number;
  generationTime: number;
}

export interface QuebecImageOptions {
  subject: string;
  region?: string;
  season?: 'winter' | 'spring' | 'summer' | 'fall';
  mood?: 'festive' | 'cozy' | 'urban' | 'nature' | 'luxury';
}

// ============================================================================
// STYLE CONFIGURATIONS
// ============================================================================

const STYLE_PROMPTS: Record<ImageStyle, string> = {
  photorealistic: 
    'photorealistic, ultra high resolution, 8K UHD, professional photography, ' +
    'natural lighting, sharp focus, detailed textures, DSLR quality',
  
  cinematic: 
    'cinematic composition, dramatic lighting, film grain, anamorphic lens, ' +
    'movie still, atmospheric, depth of field, color graded',
  
  luxury: 
    'luxury aesthetic, gold accents, premium quality, elegant, sophisticated, ' +
    'high-end fashion photography, rich textures, opulent, refined',
  
  vintage_quebec: 
    'vintage Quebec aesthetic, 1970s film photography, warm tones, nostalgic, ' +
    'film grain, retro Canadian style, authentic, timeless',
  
  artistic: 
    'artistic interpretation, painterly style, vibrant colors, creative composition, ' +
    'expressive, unique perspective, gallery quality',
  
  glassmorphism: 
    'glassmorphism design, frosted glass effect, soft gradients, modern UI aesthetic, ' +
    'translucent surfaces, blur effects, contemporary',
  
  neon: 
    'neon lights, cyberpunk aesthetic, vibrant glowing colors, urban night scene, ' +
    'electric atmosphere, futuristic, high contrast',
};

const ASPECT_RATIOS: Record<AspectRatio, { width: number; height: number }> = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 768, height: 1024 },
  landscape: { width: 1024, height: 768 },
  story: { width: 576, height: 1024 },
  wide: { width: 1024, height: 576 },
};

const DEFAULT_NEGATIVE_PROMPT = 
  'blurry, low quality, distorted, deformed, ugly, bad anatomy, ' +
  'watermark, text, signature, logo, banner, extra digits, cropped, ' +
  'worst quality, low resolution, bad proportions, gross proportions, ' +
  'malformed, mutated, horrible, disgusting, amputation';

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * 🎨 Generate an image using Flux.1 Schnell
 */
export async function generateImage(options: GenerateImageOptions): Promise<GeneratedImage | null> {
  const {
    prompt,
    style = 'photorealistic',
    aspectRatio = 'square',
    negativePrompt = DEFAULT_NEGATIVE_PROMPT,
    seed,
    numInferenceSteps = 4, // Schnell is optimized for 4 steps
  } = options;

  if (!FAL_API_KEY) {
    console.warn('⚠️ Fal.ai API key not configured, using demo mode');
    return getDemoImage(prompt, style, aspectRatio);
  }

  const startTime = Date.now();
  const dimensions = ASPECT_RATIOS[aspectRatio];
  const stylePrompt = STYLE_PROMPTS[style];
  const fullPrompt = `${prompt}, ${stylePrompt}`;

  try {
    const response = await fetch(`${FAL_BASE_URL}/flux/schnell`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        negative_prompt: negativePrompt,
        image_size: {
          width: dimensions.width,
          height: dimensions.height,
        },
        num_inference_steps: numInferenceSteps,
        seed: seed || Math.floor(Math.random() * 2147483647),
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Flux API error:', error);
      return getDemoImage(prompt, style, aspectRatio);
    }

    const data = await response.json();
    const generationTime = Date.now() - startTime;

    if (data.images && data.images.length > 0) {
      return {
        url: data.images[0].url,
        width: dimensions.width,
        height: dimensions.height,
        seed: data.seed || seed || 0,
        prompt: fullPrompt,
        style,
        cost: 0.003, // Approximate cost per image
        generationTime,
      };
    }

    return getDemoImage(prompt, style, aspectRatio);
  } catch (error) {
    console.error('❌ Image generation error:', error);
    return getDemoImage(prompt, style, aspectRatio);
  }
}

/**
 * 🍁 Generate a Quebec-themed image with cultural elements
 */
export async function generateQuebecImage(options: QuebecImageOptions): Promise<GeneratedImage | null> {
  const { subject, region, season, mood = 'cozy' } = options;

  // Build Quebec-specific prompt
  const regionElements: Record<string, string> = {
    montreal: 'Montreal cityscape, Mount Royal, colorful row houses, urban Quebec',
    quebec_city: 'Quebec City, Château Frontenac, cobblestone streets, historic architecture',
    laurentides: 'Laurentian mountains, pine forests, pristine lakes, wilderness',
    gaspesie: 'Gaspésie coast, Percé Rock, Atlantic ocean, dramatic cliffs',
    charlevoix: 'Charlevoix region, rolling hills, Saint Lawrence River, scenic beauty',
  };

  const seasonElements: Record<string, string> = {
    winter: 'Quebec winter, fresh snow, frost, cozy warmth, -20°C atmosphere',
    spring: 'Quebec spring, maple syrup season, sugar shack, melting snow',
    summer: 'Quebec summer, terrasse season, festivals, warm golden light',
    fall: 'Quebec autumn, vibrant fall colors, maple leaves, crisp air',
  };

  const moodElements: Record<string, string> = {
    festive: 'Saint-Jean-Baptiste celebration, fleur-de-lys, Quebec pride, festive',
    cozy: 'cozy Quebec atmosphere, warm interior, comfort, hygge feeling',
    urban: 'Montreal urban scene, street art, diverse culture, city life',
    nature: 'Quebec wilderness, untouched nature, serene, peaceful',
    luxury: 'upscale Quebec, premium quality, sophisticated Canadian elegance',
  };

  const promptParts = [
    subject,
    region && regionElements[region],
    season && seasonElements[season],
    moodElements[mood],
    'Quebec cultural elements, Canadian aesthetic',
  ].filter(Boolean);

  const prompt = promptParts.join(', ');

  return generateImage({
    prompt,
    style: mood === 'luxury' ? 'luxury' : 'photorealistic',
    aspectRatio: 'landscape',
  });
}

/**
 * 🦫 Generate a Zyeuté-branded image (luxury fur trader aesthetic)
 */
export async function generateZyeuteStyledImage(
  subject: string,
  variant: 'gold' | 'leather' | 'modern' = 'gold'
): Promise<GeneratedImage | null> {
  const brandElements: Record<string, string> = {
    gold: 
      'luxury gold accents, fleur-de-lys motif, premium quality, ' +
      'rich textures, beaver fur details, Canadian heritage luxury',
    leather: 
      'stitched leather texture, dark espresso brown, gold thread details, ' +
      'artisan craftsmanship, Canadian fur trader aesthetic, Louis Vuitton meets wilderness',
    modern: 
      'modern Quebec design, clean lines, gold and black palette, ' +
      'contemporary luxury, minimalist with cultural elements',
  };

  const prompt = `${subject}, ${brandElements[variant]}, Zyeuté brand aesthetic, ⚜️ fleur-de-lys`;

  return generateImage({
    prompt,
    style: 'luxury',
    aspectRatio: 'square',
  });
}

/**
 * 👤 Generate a profile avatar
 */
export async function generateAvatar(
  description: string,
  style: 'realistic' | 'artistic' | 'anime' = 'realistic'
): Promise<GeneratedImage | null> {
  const styleMap: Record<string, ImageStyle> = {
    realistic: 'photorealistic',
    artistic: 'artistic',
    anime: 'artistic', // Flux handles anime through prompting
  };

  const stylePrompts: Record<string, string> = {
    realistic: 'professional headshot, studio lighting, neutral background',
    artistic: 'artistic portrait, creative style, unique interpretation',
    anime: 'anime style portrait, vibrant, clean lines, expressive',
  };

  const prompt = `${description}, ${stylePrompts[style]}, profile picture, centered face, high quality`;

  return generateImage({
    prompt,
    style: styleMap[style],
    aspectRatio: 'square',
  });
}

/**
 * 📱 Generate a social media thumbnail
 */
export async function generatePostThumbnail(
  content: string,
  format: 'feed' | 'story' | 'wide' = 'feed'
): Promise<GeneratedImage | null> {
  const aspectMap: Record<string, AspectRatio> = {
    feed: 'square',
    story: 'story',
    wide: 'wide',
  };

  const prompt = `${content}, social media optimized, eye-catching, scroll-stopping visual`;

  return generateImage({
    prompt,
    style: 'cinematic',
    aspectRatio: aspectMap[format],
  });
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * 🎯 Generate multiple images with variations
 */
export async function generateVariations(
  basePrompt: string,
  count: number = 4,
  style: ImageStyle = 'photorealistic'
): Promise<GeneratedImage[]> {
  const results: GeneratedImage[] = [];

  // Generate with different seeds for variety
  const seeds = Array.from({ length: count }, () => Math.floor(Math.random() * 2147483647));

  for (const seed of seeds) {
    const image = await generateImage({
      prompt: basePrompt,
      style,
      seed,
    });
    if (image) {
      results.push(image);
    }
  }

  return results;
}

// ============================================================================
// DEMO MODE (When no API key)
// ============================================================================

function getDemoImage(
  prompt: string,
  style: ImageStyle,
  aspectRatio: AspectRatio
): GeneratedImage {
  const dimensions = ASPECT_RATIOS[aspectRatio];
  
  // Return a placeholder with the full structure
  return {
    url: `https://placehold.co/${dimensions.width}x${dimensions.height}/1A0F0A/D4AF37?text=Zyeut%C3%A9+Demo`,
    width: dimensions.width,
    height: dimensions.height,
    seed: Math.floor(Math.random() * 2147483647),
    prompt: `${prompt}, ${STYLE_PROMPTS[style]}`,
    style,
    cost: 0,
    generationTime: 0,
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * 🔍 Estimate generation cost
 */
export function estimateCost(count: number): number {
  return count * 0.003; // $0.003 per image
}

/**
 * ⏱️ Estimate generation time
 */
export function estimateTime(count: number): number {
  return count * 6; // ~6 seconds per image
}

/**
 * 📏 Get available aspect ratios
 */
export function getAspectRatios(): Record<AspectRatio, { width: number; height: number; label: string }> {
  return {
    square: { ...ASPECT_RATIOS.square, label: 'Carré (1:1)' },
    portrait: { ...ASPECT_RATIOS.portrait, label: 'Portrait (3:4)' },
    landscape: { ...ASPECT_RATIOS.landscape, label: 'Paysage (4:3)' },
    story: { ...ASPECT_RATIOS.story, label: 'Story (9:16)' },
    wide: { ...ASPECT_RATIOS.wide, label: 'Large (16:9)' },
  };
}

/**
 * 🎨 Get available styles
 */
export function getStyles(): Record<ImageStyle, { label: string; description: string }> {
  return {
    photorealistic: {
      label: 'Photoréaliste',
      description: 'Images ultra-réalistes style photo professionnelle',
    },
    cinematic: {
      label: 'Cinématique',
      description: 'Style film hollywoodien avec éclairage dramatique',
    },
    luxury: {
      label: 'Luxe',
      description: 'Esthétique haut de gamme avec accents dorés',
    },
    vintage_quebec: {
      label: 'Vintage Québec',
      description: 'Style rétro québécois des années 70',
    },
    artistic: {
      label: 'Artistique',
      description: 'Interprétation créative et expressive',
    },
    glassmorphism: {
      label: 'Glassmorphism',
      description: 'Design moderne avec effets de verre',
    },
    neon: {
      label: 'Néon',
      description: 'Ambiance cyberpunk avec lumières vibrantes',
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const imageGen = {
  generate: generateImage,
  generateQuebec: generateQuebecImage,
  generateZyeute: generateZyeuteStyledImage,
  generateAvatar,
  generateThumbnail: generatePostThumbnail,
  generateVariations,
  estimateCost,
  estimateTime,
  getAspectRatios,
  getStyles,
};

export default imageGen;
