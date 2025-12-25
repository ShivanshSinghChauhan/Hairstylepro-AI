
export interface GenerationResult {
  id: string;
  imageUrl: string;
  styleName: string;
}

export type Gender = 'male' | 'female';

export interface SubNiche {
  id: string;
  name: string;
  description: string;
}

export interface Niche {
  id: string;
  name: string;
  icon: string;
  subNiches: SubNiche[];
}

export interface UserState {
  originalImage: string | null;
  gender: Gender;
  results: GenerationResult[];
  isGenerating: boolean;
  selectedResultId: string | null;
}
