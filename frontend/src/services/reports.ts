import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { QualityResponse, GerminationResponse, SeedReportItem } from '../types';

export interface SavedReport {
  id: string;
  user_id: string;
  created_at: string;
  date_formatted: string;
  time_formatted: string;
  crop: string;
  analysis_type: 'Germination' | 'Quality';
  model_used: string;
  threshold: number | null;
  frames_analyzed: number | null;
  total_detected_seeds: number;
  result_summary: string;
  original_image: string;
  annotated_image: string;
  seed_reports: SeedReportItem[];
  quality_result?: QualityResponse | null;
}

const LOCAL_STORAGE_KEY = 'sporous_prediction_reports';

export async function savePredictionReport(
  userId: string | undefined,
  optionKey: string,
  cropName: string,
  sectionType: 'QUALITY' | 'GERMINATION',
  originalImageBase64: string,
  qualityData?: QualityResponse | null,
  germinationData?: GerminationResponse | null
): Promise<SavedReport> {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeFormatted = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  
  const uid = userId || 'anonymous';
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let resultSummary = '';
  let seedsCount = 1;
  let annotatedImg = originalImageBase64;
  let seedReportsList: SeedReportItem[] = [];
  let modelUsed = '';
  let thresholdVal: number | null = null;
  let framesVal: number | null = null;

  if (sectionType === 'GERMINATION' && germinationData) {
    modelUsed = germinationData.model_used;
    thresholdVal = germinationData.threshold;
    framesVal = germinationData.frames_analyzed;
    seedsCount = germinationData.total_detected_seeds || germinationData.seed_reports?.length || 0;
    annotatedImg = germinationData.annotated_image || originalImageBase64;
    seedReportsList = germinationData.seed_reports || [];

    const germinatedCount = seedReportsList.filter(s => s.prediction === 'GERMINATED').length;
    resultSummary = `${germinatedCount} / ${seedsCount} Germinated`;
  } else if (sectionType === 'QUALITY' && qualityData) {
    modelUsed = qualityData.model_used;
    resultSummary = qualityData.prediction;
    seedsCount = 1;
    seedReportsList = [{
      seed: 'Sample Tray Batch',
      prediction: qualityData.prediction,
      probability: qualityData.probability,
      confidence_percent: qualityData.confidence_percent,
      bbox: [0, 0, 0, 0]
    }];
  }

  const newReport: SavedReport = {
    id: reportId,
    user_id: uid,
    created_at: now.toISOString(),
    date_formatted: dateFormatted,
    time_formatted: timeFormatted,
    crop: cropName,
    analysis_type: sectionType === 'GERMINATION' ? 'Germination' : 'Quality',
    model_used: modelUsed,
    threshold: thresholdVal,
    frames_analyzed: framesVal,
    total_detected_seeds: seedsCount,
    result_summary: resultSummary,
    original_image: originalImageBase64,
    annotated_image: annotatedImg,
    seed_reports: seedReportsList,
    quality_result: qualityData || null,
  };

  // 1. Try persisting to Supabase if configured
  if (isSupabaseConfigured() && userId) {
    try {
      await supabase.from('germination_predictions').insert([{
        id: newReport.id,
        user_id: uid,
        crop: newReport.crop,
        analysis_type: newReport.analysis_type,
        model_used: newReport.model_used,
        threshold: newReport.threshold,
        frames_analyzed: newReport.frames_analyzed,
        seeds_detected: newReport.total_detected_seeds,
        result_summary: newReport.result_summary,
        original_image: newReport.original_image,
        annotated_image: newReport.annotated_image,
        seed_reports: newReport.seed_reports,
        created_at: newReport.created_at
      }]);
    } catch (err) {
      console.warn('Supabase table save fallback to local storage:', err);
    }
  }

  // 2. Always persist to localStorage for instant user responsiveness
  saveToLocalStorage(newReport);

  return newReport;
}

export async function fetchPredictionReports(userId: string | undefined): Promise<SavedReport[]> {
  const uid = userId || 'anonymous';
  let reports: SavedReport[] = [];

  // 1. Try Supabase fetch first if configured
  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from('germination_predictions')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        reports = data.map((item: any) => {
          const dt = new Date(item.created_at || Date.now());
          return {
            id: item.id,
            user_id: item.user_id,
            created_at: item.created_at,
            date_formatted: dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time_formatted: dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            crop: item.crop,
            analysis_type: item.analysis_type || 'Germination',
            model_used: item.model_used || '',
            threshold: item.threshold,
            frames_analyzed: item.frames_analyzed,
            total_detected_seeds: item.seeds_detected || item.total_detected_seeds || 0,
            result_summary: item.result_summary || '',
            original_image: item.original_image || '',
            annotated_image: item.annotated_image || item.original_image || '',
            seed_reports: item.seed_reports || []
          };
        });
      }
    } catch (err) {
      console.warn('Supabase fetch fallback to local storage:', err);
    }
  }

  // Fallback to local storage if Supabase returned empty or was not available
  if (reports.length === 0) {
    reports = getFromLocalStorage(uid);
  }

  return reports;
}

export async function clearPredictionReports(userId: string | undefined): Promise<void> {
  const uid = userId || 'anonymous';

  if (isSupabaseConfigured() && userId) {
    try {
      await supabase
        .from('germination_predictions')
        .delete()
        .eq('user_id', uid);
    } catch (err) {
      console.warn('Supabase clear fallback to local storage:', err);
    }
  }

  clearFromLocalStorage(uid);
}

// Local Storage Helper Functions
function saveToLocalStorage(report: SavedReport): void {
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existingList: SavedReport[] = existingStr ? JSON.parse(existingStr) : [];
    existingList.unshift(report);
    // Keep max 50 recent reports locally
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingList.slice(0, 50)));
  } catch (err) {
    console.warn('Failed to write to localStorage:', err);
  }
}

function getFromLocalStorage(userId: string): SavedReport[] {
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!existingStr) return [];
    const existingList: SavedReport[] = JSON.parse(existingStr);
    return existingList.filter(r => r.user_id === userId || userId === 'anonymous');
  } catch (err) {
    console.warn('Failed to read from localStorage:', err);
    return [];
  }
}

function clearFromLocalStorage(userId: string): void {
  try {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!existingStr) return;
    const existingList: SavedReport[] = JSON.parse(existingStr);
    const filtered = existingList.filter(r => r.user_id !== userId && userId !== 'anonymous');
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to clear localStorage:', err);
  }
}
