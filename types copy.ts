export interface CoinDetails {
  year: string;
  denomination: string;
  country: string;
  metal: string;
  mintMark: string;
  isGraded?: boolean;
  gradingAgency?: string;
  grade?: string;
  otherQuestions: string;
}

export interface AnalysisOptions {
  gradeAndCondition: boolean;
  mintageAndRarity: boolean;
  recentSalesData: boolean;
  gradeComparison: boolean;
  coinFingerprinting: boolean; // Added new option
  other: boolean;
}

export enum ImageType {
  OBVERSE = 'obverse',
  REVERSE = 'reverse',
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  type: ImageType;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Other types of chunks can be added if needed
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // other grounding metadata fields
}

export interface ParsedAnalysisSection {
  title: string;
  content: string;
  isDisclaimer?: boolean;
}