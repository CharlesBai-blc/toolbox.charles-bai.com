export type CardClassification = 'sorts' | 'searches' | 'algorithms' | 'heuristics' | 'patterns' | 'data-structures';
export type CardLanguage = 'python' | 'javascript' | 'c' | 'cpp' | 'java' | 'go' | 'rust';
export type CardDifficulty = 'easy' | 'medium' | 'hard';

export interface Method {
  name: string;
  timeComplexity: string;
}

export interface Card {
  id: string;
  title: string;
  classification: CardClassification;
  difficulty?: CardDifficulty;
  code: string;
  explanation: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  methods?: Method[]; // For data structures: common methods with their time complexities
  tags: string[];
  useCases?: string[];
  relatedProblems?: string[];
  dateAdded?: string; // ISO date string for sorting
  language?: CardLanguage;
}

