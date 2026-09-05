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
  Layers
} from 'lucide-react';
import type { ActiveOption, QualityResponse, GerminationResponse, OptionConfig } from './types';
import { analyzeSeedQuality, analyzeSeedGermination } from './api';

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

export default function App() {
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
      } else {
        const data = await analyzeSeedGermination(config.endpoint, selectedFile);
        setGerminationResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during model execution.');
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = activeOption ? OPTIONS[activeOption] : null;

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-green-100 bg-white py-4 px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-lg">
              🌱
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-green-900">CROPCARE</span>
              <span className="text-xs text-green-700 block font-medium">Seed AI Prototype</span>
            </div>
          </div>
          {activeOption && (
            <button
              onClick={() => handleSelectOption(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Options
            </button>
          )}
        </div>
      </header>

      {/* Main Single Page Content */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
        {/* Initial Overview Dashboard (Shown when no option is selected) */}
        {!activeOption && (
          <div className="my-auto space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h1 className="text-3xl font-bold text-green-900">
                CROPCARE
              </h1>
              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                Seed Quality & Germination Prototype
              </p>
              <p className="text-slate-600 text-sm">
                Select an analysis module below to run live machine learning inference on seed samples.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* QUALITY CARD */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-green-500 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-green-900">QUALITY</h2>
                    <span className="text-xs text-slate-500 font-medium">Physical seed health & defects</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => handleSelectOption('quality_maize')}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 text-left text-sm font-semibold text-slate-800 hover:text-green-900 transition-colors group"
                  >
                    <span>Maize Quality</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
                  </button>

                  <button
                    onClick={() => handleSelectOption('quality_wheat')}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 text-left text-sm font-semibold text-slate-800 hover:text-green-900 transition-colors group"
                  >
                    <span>Wheat Quality</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
                  </button>
                </div>
              </div>

              {/* GERMINATION CARD */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-green-500 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-green-900">GERMINATION</h2>
                    <span className="text-xs text-slate-500 font-medium">Individual seed sprouting viability</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => handleSelectOption('germination_pearl')}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 text-left text-sm font-semibold text-slate-800 hover:text-green-900 transition-colors group"
                  >
                    <span>Pearl Millet</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
                  </button>

                  <button
                    onClick={() => handleSelectOption('germination_maize')}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 text-left text-sm font-semibold text-slate-800 hover:text-green-900 transition-colors group"
                  >
                    <span>Maize</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Option Analysis Interface (On the Same Page) */}
        {activeOption && currentConfig && (
          <div className="space-y-6">
            {/* Header Title Card */}
            <div className="bg-green-50/60 border border-green-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                    {currentConfig.section} Module
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-green-900">
                    {currentConfig.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {currentConfig.description}
                  </p>
                </div>
                <div className="text-xs text-slate-500 font-mono bg-white px-3 py-1.5 rounded-lg border border-green-200 self-start sm:self-center">
                  Model: {currentConfig.modelName}
                </div>
              </div>
            </div>

            {/* Error Alert Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Inference Failed</strong>
                  {error}
                </div>
              </div>
            )}

            {/* Upload Box or Image Analysis Preview */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-green-500 rounded-xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50/50 hover:bg-green-50/30 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 mb-1">
                    Upload Seed Image Sample
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mb-3">
                    Drag and drop or click to upload seed image (PNG, JPG, JPEG)
                  </p>
                  <span className="inline-block bg-white text-slate-500 text-xs px-3 py-1 rounded border border-slate-200 font-mono">
                    Max size: 10MB
                  </span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File Selection Bar */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium truncate">
                      <FileCheck className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="truncate">{selectedFile?.name}</span>
                    </div>
                    <button
                      onClick={handleClear}
                      disabled={loading}
                      className="text-xs font-semibold text-slate-600 hover:text-red-600 px-2.5 py-1 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Image Display & Analyze Button */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center justify-center max-h-64 overflow-hidden">
                      <img
                        src={germinationResult?.annotated_image || previewUrl}
                        alt="Seed sample preview"
                        className="max-h-60 max-w-full object-contain rounded"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs text-slate-600 space-y-1">
                        <span className="font-semibold text-slate-800 block">Analysis Ready</span>
                        <p>Click "Analyze Seed" to run real-time production machine learning model inference.</p>
                      </div>

                      <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Executing Model Inference...
                          </>
                        ) : (
                          <>
                            <Sprout className="w-4 h-4" />
                            Analyze Seed
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Skeleton Loader */}
                  {loading && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  )}

                  {/* QUALITY RESULT DISPLAY */}
                  {qualityResult && !loading && (
                    <div className="p-5 rounded-xl bg-white border border-green-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Quality Prediction Result
                        </span>
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                          Live TensorFlow Model
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-500 block">Classification</span>
                          <span className={`text-2xl font-bold ${
                            qualityResult.prediction === 'HIGH QUALITY' ? 'text-green-700' : 'text-amber-700'
                          }`}>
                            {qualityResult.prediction}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Confidence</span>
                          <span className="text-2xl font-bold text-slate-800 font-mono">
                            {qualityResult.confidence_percent}
                          </span>
                          <span className="text-xs text-slate-500 block font-mono">
                            Prob: {qualityResult.probability}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        Executed Model: <code className="font-mono text-slate-700">{qualityResult.model_used}</code>
                      </div>
                    </div>
                  )}

                  {/* GERMINATION RESULT DISPLAY (Individual Seed Detection & Bounding Boxes) */}
                  {germinationResult && !loading && (
                    <div className="space-y-6 pt-2">
                      {/* Summary Banner */}
                      <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div>
                          <span className="font-bold text-green-900 text-sm block mb-0.5">
                            GERMINATION ANALYSIS SUMMARY
                          </span>
                          <span className="text-slate-600">
                            Model: <strong className="text-slate-800">{germinationResult.model_used}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-slate-700">
                          <div>
                            <span className="text-slate-500 block">Decision Threshold</span>
                            <strong className="font-mono text-slate-900">{germinationResult.threshold}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Frames Analyzed</span>
                            <strong className="font-mono text-slate-900">{germinationResult.frames_analyzed}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Detected Seeds</span>
                            <strong className="font-mono text-green-700 text-sm">{germinationResult.total_detected_seeds}</strong>
                          </div>
                        </div>
                      </div>

                      {/* INDIVIDUAL SEED REPORT TABLE */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-green-900">
                            INDIVIDUAL SEED REPORT ({germinationResult.seed_reports.length} Seeds Detected)
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">
                            Matched 1-to-1 to Tracking Box Labels
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3">Seed Tag</th>
                                <th className="px-4 py-3">Prediction</th>
                                <th className="px-4 py-3">Probability</th>
                                <th className="px-4 py-3">Confidence</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {germinationResult.seed_reports.map((seedItem) => (
                                <tr key={seedItem.seed} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-4 py-3 font-bold text-slate-800">
                                    <span className="inline-flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                                      {seedItem.seed}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-semibold">
                                    {seedItem.prediction === 'GERMINATED' ? (
                                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        GERMINATED
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                                        <XCircle className="w-3.5 h-3.5 text-amber-600" />
                                        NON-GERMINATED
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 font-mono text-slate-700">
                                    {seedItem.probability}
                                  </td>
                                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
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
      <footer className="py-4 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        CropCare Seed Quality & Germination Prototype &bull;
      </footer>
    </div>
  );
}
