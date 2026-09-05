export type ActiveOption = 
  | 'quality_maize'
  | 'quality_wheat'
  | 'germination_pearl'
  | 'germination_maize'
  | null;

export interface QualityResponse {
  crop: string;
  prediction: string;
  probability: number;
  confidence_percent: string;
  model_used: string;
}

export interface SeedReportItem {
  seed: string;
  prediction: string;
  probability: number;
  confidence_percent: string;
  bbox: [number, number, number, number];
}

export interface GerminationResponse {
  crop: string;
  model_used: string;
  threshold: number;
  frames_analyzed: number;
  total_detected_seeds: number;
  annotated_image: string;
  seed_reports: SeedReportItem[];
}

export interface OptionConfig {
  id: ActiveOption;
  title: string;
  section: 'QUALITY' | 'GERMINATION';
  endpoint: string;
  modelName: string;
  description: string;
}
