export enum AppStatus {
  HOME = 'HOME',
  IDLE = 'IDLE',
  CAMERA = 'CAMERA',
  PREVIEW = 'PREVIEW',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export type CountryCode = 'PE' | 'MX' | 'CO' | 'CL' | 'AR' | 'US' | 'BR' | 'ES';

export type SupportedLanguage = 'es' | 'en' | 'pt' | 'fr';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: { // Add maps support
    placeId?: string;
    uri?: string;
    title?: string;
  };
}

export interface AnalysisResult {
  text: string;
  groundingChunks: GroundingChunk[];
}