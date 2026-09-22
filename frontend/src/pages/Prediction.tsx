import React, { useState, useRef } from 'react';
import { 
  Sprout, 
  ShieldCheck, 
  Upload, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  FileCheck, 
  RefreshCw,
  Info,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import type { ActiveOption, QualityResponse, GerminationResponse, OptionConfig } from '../types';
import { analyzeSeedQuality, analyzeSeedGermination } from '../api';
import { Header } from '../components/Header';
import { savePredictionReport } from '../services/reports';
import { useAuth } from '../context/AuthContext';

const OPTIONS: Record<string, OptionConfig> = {
  quality_maize: {
    id: 'quality_maize',
    title: 'Maize Quality Analysis',
    section: 'QUALITY',
    endpoint: '/api/quality/maize',
    modelName: 'maize_diverse_only_effnet.h5',
    description: 'Evaluates Maize seed physical quality and visual characteristics.'
  },
  quality_wheat: {
    id: 'quality_wheat',
    title: 'Wheat Quality Analysis',
    section: 'QUALITY',
    endpoint: '/api/quality/wheat',
    modelName: 'wheat_effnet.h5',
    description: 'Assesses Wheat seed quality and physical health.'
  },
  germination_pearl: {
    id: 'germination_pearl',
    title: 'Pearl Millet Germination',
    section: 'GERMINATION',
    endpoint: '/api/germination/pearl-millet',
    modelName: 'P25_final_histgradientboosting_model.pkl (HistGradientBoosting)',
    description: 'Production 97-frame sequence model predicting Pearl Millet seed germination.'
  },
  germination_maize: {
    id: 'germination_maize',
    title: 'Maize Germination',
    section: 'GERMINATION',
    endpoint: '/api/germination/maize',
    modelName: 'm25_final_gradient_boosting.joblib (GradientBoosting)',
    description: 'Production 72-frame sequence model predicting Maize seed germination.'
  }
};

export const PredictionPage: React.FC = () => {
  const { user } = useAuth();
  const [activeOption, setActiveOption] = useState<ActiveOption>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [qualityResult, setQualityResult] = useState<QualityResponse | null>(null);
  const [germinationResult, setGerminationResult] = useState<GerminationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectOption = (optionKey: ActiveOption) => {
    setActiveOption(optionKey);
    setSelectedFile(null);
    setPreviewUrl(null);
    setQualityResult(null);
    setGerminationResult(null);
    setError(null);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG).');
      return;
    }

    setError(null);
    setQualityResult(null);
    setGerminationResult(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setQualityResult(null);
    setGerminationResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!activeOption || !selectedFile) return;

    const config = OPTIONS[activeOption];
    if (!config) return;

    setLoading(true);
    setError(null);
    setQualityResult(null);
    setGerminationResult(null);

    try {
      if (config.section === 'QUALITY') {
        const data = await analyzeSeedQuality(config.endpoint, selectedFile);
        setQualityResult(data);
        
        // Auto-save report record asynchronously
        savePredictionReport(
          user?.id,
          config.id || '',
          data.crop || 'Maize',
          'QUALITY',
          previewUrl || '',
          data,
          null
        ).catch(console.warn);

      } else {
        const data = await analyzeSeedGermination(config.endpoint, selectedFile);
        setGerminationResult(data);

        // Auto-save report record asynchronously
        savePredictionReport(
          user?.id,
          config.id || '',
          data.crop || 'Germination Sample',
          'GERMINATION',
          previewUrl || '',
          null,
          data
        ).catch(console.warn);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during model execution.');
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = activeOption ? OPTIONS[activeOption] : null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D3A32] flex flex-col font-sans">
      <Header />

      {/* Main Prediction Content */}
      <main className="max-w-5xl mx-auto w-full px-6 py-10 flex-1 flex flex-col">
        {/* Back Button if Option Selected */}
        {activeOption && (
          <div className="mb-6">
            <button
              onClick={() => handleSelectOption(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#163323] hover:text-[#386655] bg-white hover:bg-[#F5F2EC] px-3.5 py-2 rounded-lg border border-[#E2DDD5] transition-colors shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Option Selector</span>
            </button>
          </div>
        )}

        {/* Initial Option Overview (Shown when no option selected) */}
        {!activeOption && (
          <div className="my-auto space-y-10">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#566A58] bg-[#F5F2EC] px-3 py-1 rounded-full border border-[#E2DDD5] inline-block">
                LIVE INFERENCE ENGINE
              </span>
              <h1 className="text-3xl font-extrabold text-[#163323]">
                PREDICTION ENGINE
              </h1>
              <p className="text-sm text-[#566A58] leading-relaxed">
                Analyze seed quality and germination using the production machine learning models.
              </p>
            </div>

            {/* Two Refined Editorial Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* QUALITY ASSESSMENT SECTION */}
              <div className="bg-white border border-[#E2DDD5] rounded-2xl p-7 shadow-sm hover:border-[#386655] transition-all space-y-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F5F2EC] flex items-center justify-center text-[#163323]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#386655] block">
                      Visual & Health Analysis
                    </span>
                    <h2 className="text-xl font-bold text-[#163323]">QUALITY ASSESSMENT</h2>
                  </div>
                  <p className="text-xs text-[#566A58] leading-relaxed">
                    Evaluates physical seed health and defect classification.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => handleSelectOption('quality_maize')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F5F2EC] hover:bg-[#163323] text-[#163323] hover:text-[#FAF8F5] border border-[#E2DDD5] hover:border-[#163323] text-xs font-bold transition-all group shadow-sm"
                  >
                    <span>Maize Quality</span>
                    <ArrowRight className="w-4 h-4 text-[#566A58] group-hover:text-[#FAF8F5] transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => handleSelectOption('quality_wheat')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F5F2EC] hover:bg-[#163323] text-[#163323] hover:text-[#FAF8F5] border border-[#E2DDD5] hover:border-[#163323] text-xs font-bold transition-all group shadow-sm"
                  >
                    <span>Wheat Quality</span>
                    <ArrowRight className="w-4 h-4 text-[#566A58] group-hover:text-[#FAF8F5] transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* GERMINATION ANALYSIS SECTION */}
              <div className="bg-white border border-[#E2DDD5] rounded-2xl p-7 shadow-sm hover:border-[#386655] transition-all space-y-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F5F2EC] flex items-center justify-center text-[#163323]">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#386655] block">
                      Sprouting Viability Pipeline
                    </span>
                    <h2 className="text-xl font-bold text-[#163323]">GERMINATION ANALYSIS</h2>
                  </div>
                  <p className="text-xs text-[#566A58] leading-relaxed">
                    Production sequence models predicting individual seed germination.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => handleSelectOption('germination_pearl')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F5F2EC] hover:bg-[#163323] text-[#163323] hover:text-[#FAF8F5] border border-[#E2DDD5] hover:border-[#163323] text-xs font-bold transition-all group shadow-sm"
                  >
                    <span>Pearl Millet</span>
                    <ArrowRight className="w-4 h-4 text-[#566A58] group-hover:text-[#FAF8F5] transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => handleSelectOption('germination_maize')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F5F2EC] hover:bg-[#163323] text-[#163323] hover:text-[#FAF8F5] border border-[#E2DDD5] hover:border-[#163323] text-xs font-bold transition-all group shadow-sm"
                  >
                    <span>Maize</span>
                    <ArrowRight className="w-4 h-4 text-[#566A58] group-hover:text-[#FAF8F5] transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Option Analysis Interface */}
        {activeOption && currentConfig && (
          <div className="space-y-6">
            {/* Header Title Card */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#386655] bg-[#F5F2EC] px-2.5 py-0.5 rounded-full inline-block mb-1 border border-[#E2DDD5]">
                    {currentConfig.section} Module
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#163323]">
                    {currentConfig.title}
                  </h2>
                  <p className="text-xs text-[#566A58] mt-0.5">
                    {currentConfig.description}
                  </p>
                </div>
                <div className="text-xs text-[#566A58] font-mono bg-[#F5F2EC] px-3 py-1.5 rounded-lg border border-[#E2DDD5] self-start sm:self-center">
                  Model: {currentConfig.modelName}
                </div>
              </div>
            </div>

            {/* Error Alert Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Inference Failed</strong>
                  {error}
                </div>
              </div>
            )}

            {/* Upload Box or Image Analysis Preview */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm">
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E2DDD5] hover:border-[#163323] rounded-xl p-8 sm:p-12 text-center cursor-pointer bg-[#FAF8F5] hover:bg-[#F5F2EC] transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-[#F5F2EC] text-[#163323] flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#163323] mb-1">
                    Upload Seed Image Sample
                  </h3>
                  <p className="text-xs text-[#566A58] max-w-xs mx-auto mb-3">
                    Drag and drop or click to upload seed image (PNG, JPG, JPEG)
                  </p>
                  <span className="inline-block bg-white text-[#566A58] text-xs px-3 py-1 rounded border border-[#E2DDD5] font-mono">
                    Max size: 10MB
                  </span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File Selection Bar */}
                  <div className="flex items-center justify-between bg-[#F5F2EC] p-3 rounded-lg border border-[#E2DDD5]">
                    <div className="flex items-center gap-2 text-xs text-[#163323] font-medium truncate">
                      <FileCheck className="w-4 h-4 text-[#386655] shrink-0" />
                      <span className="truncate">{selectedFile?.name}</span>
                    </div>
                    <button
                      onClick={handleClear}
                      disabled={loading}
                      className="text-xs font-semibold text-[#566A58] hover:text-rose-700 px-2.5 py-1 rounded hover:bg-[#E2DDD5] transition-colors disabled:opacity-50"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Image Display & Analyze Button */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="border border-[#E2DDD5] rounded-lg p-2 bg-[#FAF8F5] flex items-center justify-center max-h-64 overflow-hidden">
                      <img
                        src={germinationResult?.annotated_image || previewUrl}
                        alt="Seed sample preview"
                        className="max-h-60 max-w-full object-contain rounded"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs text-[#566A58] space-y-1">
                        <span className="font-semibold text-[#163323] block">Analysis Ready</span>
                        <p>Click "Analyze Seed" to run real-time production machine learning model inference.</p>
                      </div>

                      <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg bg-[#163323] hover:bg-[#234137] text-[#FAF8F5] font-semibold text-xs tracking-wide shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#9EC1B0]" />
                            <span>Executing Model Inference...</span>
                          </>
                        ) : (
                          <>
                            <Sprout className="w-4 h-4" />
                            <span>Analyze Seed</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Skeleton Loader */}
                  {loading && (
                    <div className="p-4 rounded-lg bg-[#F5F2EC] border border-[#E2DDD5] space-y-3 animate-pulse">
                      <div className="h-4 bg-[#E2DDD5] rounded w-1/3"></div>
                      <div className="h-6 bg-[#E2DDD5] rounded w-1/2"></div>
                      <div className="h-4 bg-[#E2DDD5] rounded w-2/3"></div>
                    </div>
                  )}

                  {/* QUALITY RESULT DISPLAY */}
                  {qualityResult && !loading && (
                    <div className="p-6 rounded-xl bg-white border border-[#E2DDD5] shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
                        <span className="text-xs font-bold text-[#566A58] uppercase tracking-wider">
                          Quality Prediction Result
                        </span>
                        <span className="text-[11px] font-semibold text-[#163323] bg-[#F5F2EC] px-2.5 py-0.5 rounded border border-[#E2DDD5]">
                          Live TensorFlow Model
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-[#566A58] block">Classification</span>
                          <span className={`text-2xl font-extrabold ${
                            qualityResult.prediction === 'HIGH QUALITY' ? 'text-[#163323]' : 'text-amber-800'
                          }`}>
                            {qualityResult.prediction}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-[#566A58] block">Confidence</span>
                          <span className="text-2xl font-bold text-[#163323] font-mono">
                            {qualityResult.confidence_percent}
                          </span>
                          <span className="text-xs text-[#566A58] block font-mono">
                            Prob: {qualityResult.probability}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-[#566A58] pt-2 border-t border-[#E2DDD5] flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-[#386655]" />
                        <span>Executed Model:</span>
                        <code className="font-mono text-[#163323]">{qualityResult.model_used}</code>
                      </div>
                    </div>
                  )}

                  {/* GERMINATION RESULT DISPLAY (Individual Seed Detection & Bounding Boxes) */}
                  {germinationResult && !loading && (
                    <div className="space-y-6 pt-2">
                      {/* Summary Banner */}
                      <div className="p-5 rounded-xl bg-[#F5F2EC] border border-[#E2DDD5] flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div>
                          <span className="font-extrabold text-[#163323] text-sm block mb-0.5">
                            GERMINATION ANALYSIS SUMMARY
                          </span>
                          <span className="text-[#566A58]">
                            Model: <strong className="text-[#163323]">{germinationResult.model_used}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-5 text-[#2D3A32]">
                          <div>
                            <span className="text-[#566A58] block">Decision Threshold</span>
                            <strong className="font-mono text-[#163323]">{germinationResult.threshold}</strong>
                          </div>
                          <div>
                            <span className="text-[#566A58] block">Frames Analyzed</span>
                            <strong className="font-mono text-[#163323]">{germinationResult.frames_analyzed}</strong>
                          </div>
                          <div>
                            <span className="text-[#566A58] block">Detected Seeds</span>
                            <strong className="font-mono text-[#163323] text-sm">{germinationResult.total_detected_seeds}</strong>
                          </div>
                        </div>
                      </div>

                      {/* INDIVIDUAL SEED REPORT TABLE */}
                      <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-[#F5F2EC] px-5 py-3.5 border-b border-[#E2DDD5] flex items-center justify-between">
                          <h3 className="text-xs font-bold text-[#163323] uppercase tracking-wider">
                            INDIVIDUAL SEED REPORT ({germinationResult.seed_reports.length} Seeds Detected)
                          </h3>
                          <span className="text-[11px] text-[#566A58] font-medium">
                            Matched 1-to-1 to OpenCV Seed Bounding Boxes
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF8F5] text-[#566A58] font-semibold uppercase border-b border-[#E2DDD5]">
                              <tr>
                                <th className="px-5 py-3">Seed Tag</th>
                                <th className="px-5 py-3">Prediction</th>
                                <th className="px-5 py-3">Probability</th>
                                <th className="px-5 py-3">Confidence</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2DDD5]">
                              {germinationResult.seed_reports.map((seedItem) => (
                                <tr key={seedItem.seed} className="hover:bg-[#FAF8F5] transition-colors">
                                  <td className="px-5 py-3 font-bold text-[#163323]">
                                    <span className="inline-flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-[#386655]"></span>
                                      {seedItem.seed}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 font-semibold">
                                    {seedItem.prediction === 'GERMINATED' ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#163323] bg-[#E1EDE6] px-2.5 py-0.5 rounded-full border border-[#C5DCD0]">
                                        <CheckCircle2 className="w-3 h-3 text-[#386655]" />
                                        GERMINATED
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                        <XCircle className="w-3 h-3 text-amber-700" />
                                        NON-GERMINATED
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3 font-mono text-[#566A58]">
                                    {seedItem.probability}
                                  </td>
                                  <td className="px-5 py-3 font-mono font-bold text-[#163323]">
                                    {seedItem.confidence_percent}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#E2DDD5] text-center text-xs text-[#566A58] bg-[#FAF8F5]">
        SPOROUS &bull; Seed Quality & Germination Platform
      </footer>
    </div>
  );
};
