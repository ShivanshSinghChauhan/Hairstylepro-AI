
import { Niche } from './types';

export const NICHES: Niche[] = [
  {
    id: 'short-edgy',
    name: 'Short & Edgy',
    icon: '✂️',
    subNiches: [
      { id: 'pixie', name: 'Messy Pixie', description: 'Choppy, textured layers with attitude.' },
      { id: 'buzz', name: 'Artistic Buzz', description: 'Ultra-short with subtle geometric fades.' },
      { id: 'undercut', name: 'Sleek Undercut', description: 'Contrast between shaved sides and long top.' }
    ]
  },
  {
    id: 'corporate',
    name: 'Professional',
    icon: '💼',
    subNiches: [
      { id: 'low-bun', name: 'Sleek Low Bun', description: 'Polished, professional, and timeless.' },
      { id: 'bob', name: 'Sharp Power Bob', description: 'Strong jawline-length cut with precision.' },
      { id: 'side-part', name: 'Classic Side Part', description: 'Clean, conservative, and high-trust.' }
    ]
  },
  {
    id: 'glamour',
    name: 'Event Glamour',
    icon: '✨',
    subNiches: [
      { id: 'hollywood', name: 'Hollywood Waves', description: 'Vintage red-carpet flowing curls.' },
      { id: 'updo', name: 'Intricate Updo', description: 'Braided or twisted high-fashion styles.' },
      { id: 'volume', name: 'Mega Volume', description: 'Big, bouncy, and spotlight-ready.' }
    ]
  },
  {
    id: 'natural',
    name: 'Natural & Textured',
    icon: '🌿',
    subNiches: [
      { id: 'afro', name: 'Sculpted Afro', description: 'Beautiful natural volume and shape.' },
      { id: 'braids', name: 'Box Braids', description: 'Protective styles with various patterns.' },
      { id: 'locs', name: 'Goddess Locs', description: 'Elegant, spiritual, and versatile.' }
    ]
  },
  {
    id: 'trendy',
    name: 'Modern Trendy',
    icon: '🔥',
    subNiches: [
      { id: 'wolf', name: 'The Wolf Cut', description: 'Shaggy layers with heavy fringe.' },
      { id: 'curtain', name: 'Curtain Bangs', description: 'Soft, face-framing 70s revival.' },
      { id: 'balayage', name: 'Sun-Kissed Flow', description: 'Lived-in color with effortless movement.' }
    ]
  }
];

export const SYSTEM_INSTRUCTION = `
You are an expert virtual hair stylist AI. 
When editing photos, you focus on photorealistic texture mapping, seamless blending at the hairline, and adapting styles to the user's face shape (oval, round, square, etc.). 
Maintain the user's original facial features while transforming their hair.
Always return high-quality image results.
When asked for variations, ensure each one has a distinct personality (e.g., slightly different length, texture, or styling) while staying true to the requested sub-niche.
`;
