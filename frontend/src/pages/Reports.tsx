import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowRight, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Download, 
  X, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { 
  fetchPredictionReports, 
  clearPredictionReports, 
  type SavedReport 
} from '../services/reports';
import sporousLogo from '../assets/sporous_logo.jpeg';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchPredictionReports(user?.id);
      setReports(data);
    } catch (err) {
      console.warn('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user]);

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearPredictionReports(user?.id);
      setReports([]);
      setShowClearConfirm(false);
    } catch (err) {
      console.warn('Error clearing reports:', err);
    } finally {
      setClearing(false);
    }
  };

  const handleDownload = (report: SavedReport) => {
    // Generate clean printable HTML report window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SPOROUS — ${report.crop} Analysis Report (${report.date_formatted})</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #163323; background: #ffffff; padding: 40px; margin: 0; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #163323; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #163323; margin: 0; }
            .subtitle { font-size: 12px; color: #566A58; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .meta-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 15px; background: #FAF8F5; padding: 15px; border-radius: 8px; border: 1px solid #E2DDD5; margin-bottom: 30px; font-size: 12px; }
            @media (max-width: 640px) { .meta-grid { grid-template-columns: 1fr; } }
            .meta-item { min-width: 0; overflow-wrap: anywhere; word-break: break-word; }
            .meta-item label { font-size: 10px; color: #566A58; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 3px; }
            .meta-item font, .meta-item code { font-weight: bold; font-family: monospace; overflow-wrap: anywhere; word-break: break-word; white-space: normal; display: block; }
            .section-title { font-size: 14px; font-weight: bold; color: #163323; text-transform: uppercase; border-bottom: 1px solid #E2DDD5; padding-bottom: 6px; margin-bottom: 15px; }
            .images-container { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
            .image-card { flex: 1; min-width: 250px; border: 1px solid #E2DDD5; padding: 10px; border-radius: 8px; background: #FAF8F5; text-align: center; }
            .image-card img { max-width: 100%; max-height: 250px; object-fit: contain; border-radius: 4px; }
            .image-card span { font-size: 11px; font-weight: bold; color: #566A58; display: block; margin-top: 8px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 30px; }
            th { background: #F5F2EC; color: #163323; text-align: left; padding: 10px; font-weight: bold; border-bottom: 1px solid #E2DDD5; text-transform: uppercase; font-size: 10px; }
            td { padding: 10px; border-bottom: 1px solid #E2DDD5; overflow-wrap: anywhere; word-break: break-word; }
            .status-tag { display: inline-block; padding: 3px 8px; border-radius: 12px; font-weight: bold; font-size: 10px; }
            .status-germinated { background: #E1EDE6; color: #163323; }
            .status-nongerminated { background: #FEF3C7; color: #92400E; }
            .footer { border-top: 1px solid #E2DDD5; padding-top: 15px; font-size: 10px; color: #566A58; text-align: center; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">SPOROUS</h1>
              <div class="subtitle">Seed Analysis Report &bull; ${report.analysis_type} Module</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #566A58;">
              Date: <strong>${report.date_formatted}</strong> (${report.time_formatted})<br/>
              Report ID: <code>${report.id}</code>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item"><label>Crop</label><strong>${report.crop}</strong></div>
            <div class="meta-item"><label>Model Engine</label><code>${report.model_used || 'N/A'}</code></div>
            <div class="meta-item"><label>Threshold</label><font>${report.threshold !== null ? report.threshold : 'N/A'}</font></div>
            <div class="meta-item"><label>Frames / Seeds</label><font>${report.frames_analyzed ? report.frames_analyzed + ' Frames / ' : ''}${report.total_detected_seeds} Seeds</font></div>
          </div>

          <div class="section-title">Visual Inspection Images</div>
          <div class="images-container">
            ${report.original_image ? `
              <div class="image-card">
                <img src="${report.original_image}" />
                <span>Original Uploaded Sample</span>
              </div>
            ` : ''}
            ${report.annotated_image ? `
              <div class="image-card">
                <img src="${report.annotated_image}" />
                <span>OpenCV Tracked Seed Bounding Boxes</span>
              </div>
            ` : ''}
          </div>

          <div class="section-title">Individual Seed Results</div>
          <table>
            <thead>
              <tr>
                <th>Seed Tag</th>
                <th>Prediction</th>
                <th>Probability</th>
                <th>Confidence Score</th>
              </tr>
            </thead>
            <tbody>
              ${report.seed_reports.map(s => `
                <tr>
                  <td><strong>${s.seed}</strong></td>
                  <td>
                    <span class="status-tag ${s.prediction === 'GERMINATED' ? 'status-germinated' : 'status-nongerminated'}">
                      ${s.prediction}
                    </span>
                  </td>
                  <td><code>${s.probability}</code></td>
                  <td><strong>${s.confidence_percent}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Generated deterministically by SPOROUS Seed Quality & Germination Platform &bull; Locked ML Production Inference
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D3A32] flex flex-col font-sans">
      <Header />

      <main className="max-w-6xl mx-auto w-full px-6 py-10 flex-1 flex flex-col">
        {/* Header Bar & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-6 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#566A58] block mb-1">
              Persistent Analysis Store
            </span>
            <h1 className="text-3xl font-extrabold text-[#163323] tracking-tight">
              Seed Analysis Reports
            </h1>
            <p className="text-xs text-[#566A58] mt-1">
              View, inspect, and download completed seed quality and germination prediction runs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadReports}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-[#F5F2EC] text-[#163323] font-semibold text-xs px-3.5 py-2.5 rounded-lg border border-[#E2DDD5] transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#386655] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Reports</span>
            </button>

            {reports.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs px-3.5 py-2.5 rounded-lg border border-rose-200 transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Clear Reports</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="p-12 text-center my-auto">
            <RefreshCw className="w-6 h-6 animate-spin text-[#386655] mx-auto mb-2" />
            <span className="text-xs font-semibold text-[#163323]">Fetching analysis records...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && reports.length === 0 && (
          <div className="bg-white border border-[#E2DDD5] rounded-xl p-12 text-center my-auto max-w-lg mx-auto w-full shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F5F2EC] flex items-center justify-center text-[#163323] mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#163323]">
                No analysis reports yet
              </h3>
              <p className="text-xs text-[#566A58] leading-relaxed">
                When you run Maize, Wheat, or Pearl Millet seed analysis in the Prediction engine, generated reports will automatically appear here for download.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate('/prediction')}
                className="inline-flex items-center gap-2 bg-[#163323] hover:bg-[#234137] text-[#FAF8F5] font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-sm group"
              >
                <span>Go to Prediction Engine</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {/* Reports Table */}
        {!loading && reports.length > 0 && (
          <div className="bg-white border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F2EC] text-[#566A58] font-bold uppercase border-b border-[#E2DDD5]">
                  <tr>
                    <th className="px-5 py-3.5">DATE</th>
                    <th className="px-5 py-3.5">TIME</th>
                    <th className="px-5 py-3.5">CROP</th>
                    <th className="px-5 py-3.5">ANALYSIS</th>
                    <th className="px-5 py-3.5">SEEDS</th>
                    <th className="px-5 py-3.5">RESULT</th>
                    <th className="px-5 py-3.5">STATUS</th>
                    <th className="px-5 py-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD5]">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-5 py-4 font-mono text-[#163323] font-semibold">{report.date_formatted}</td>
                      <td className="px-5 py-4 font-mono text-[#566A58]">{report.time_formatted}</td>
                      <td className="px-5 py-4 font-bold text-[#163323]">{report.crop}</td>
                      <td className="px-5 py-4">
                        <span className="bg-[#F5F2EC] text-[#163323] px-2.5 py-1 rounded text-[11px] font-semibold border border-[#E2DDD5]">
                          {report.analysis_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-[#163323]">{report.total_detected_seeds}</td>
                      <td className="px-5 py-4 font-semibold text-[#163323]">{report.result_summary}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#163323] bg-[#E1EDE6] px-2.5 py-0.5 rounded-full border border-[#C5DCD0]">
                          <CheckCircle2 className="w-3 h-3 text-[#386655]" />
                          Completed
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#163323] hover:text-[#386655] bg-white hover:bg-[#F5F2EC] px-2.5 py-1.5 rounded border border-[#E2DDD5] transition-colors"
                            title="View Report Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDownload(report)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FAF8F5] bg-[#163323] hover:bg-[#234137] px-2.5 py-1.5 rounded transition-colors shadow-sm"
                            title="Download Printable Report"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* VIEW REPORT MODAL DIALOG */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2DDD5] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-6 p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-6 right-6 p-1.5 text-[#566A58] hover:text-[#163323] bg-[#F5F2EC] hover:bg-[#E2DDD5] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-[#E2DDD5] pb-4 pr-10">
              <div className="flex items-center gap-3 mb-1">
                <img src={sporousLogo} alt="SPOROUS" className="w-7 h-7 object-contain rounded border border-[#E2DDD5]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#386655]">
                  SPOROUS Seed Report &bull; {selectedReport.id}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#163323]">
                {selectedReport.crop} {selectedReport.analysis_type} Analysis
              </h2>
              <p className="text-xs text-[#566A58] mt-0.5">
                Executed on {selectedReport.date_formatted} at {selectedReport.time_formatted}
              </p>
            </div>

            {/* Metadata Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E2DDD5] text-xs">
              <div className="min-w-0">
                <span className="text-[#566A58] font-bold uppercase text-[10px] block mb-0.5">Model Engine</span>
                <code className="font-mono text-[#163323] font-bold block text-xs break-words whitespace-normal leading-relaxed">
                  {selectedReport.model_used || 'N/A'}
                </code>
              </div>
              <div className="min-w-0">
                <span className="text-[#566A58] font-bold uppercase text-[10px] block mb-0.5">Decision Threshold</span>
                <span className="font-mono text-[#163323] font-bold block text-xs">
                  {selectedReport.threshold !== null ? selectedReport.threshold : 'N/A'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[#566A58] font-bold uppercase text-[10px] block mb-0.5">Frames Analyzed</span>
                <span className="font-mono text-[#163323] font-bold block text-xs">
                  {selectedReport.frames_analyzed || 'N/A'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[#566A58] font-bold uppercase text-[10px] block mb-0.5">Detected Seeds</span>
                <span className="font-mono text-[#163323] font-bold block text-xs">
                  {selectedReport.total_detected_seeds}
                </span>
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedReport.original_image && (
                <div className="border border-[#E2DDD5] rounded-xl p-3 bg-[#FAF8F5] space-y-2">
                  <span className="text-[11px] font-bold text-[#163323] block">Original Uploaded Input</span>
                  <div className="max-h-48 overflow-hidden rounded flex items-center justify-center bg-white p-1">
                    <img src={selectedReport.original_image} alt="Original" className="max-h-44 object-contain" />
                  </div>
                </div>
              )}

              {selectedReport.annotated_image && (
                <div className="border border-[#E2DDD5] rounded-xl p-3 bg-[#FAF8F5] space-y-2">
                  <span className="text-[11px] font-bold text-[#163323] block">OpenCV Tracked Seed Bounding Boxes</span>
                  <div className="max-h-48 overflow-hidden rounded flex items-center justify-center bg-white p-1">
                    <img src={selectedReport.annotated_image} alt="Annotated" className="max-h-44 object-contain" />
                  </div>
                </div>
              )}
            </div>

            {/* Individual Seed Table */}
            {selectedReport.seed_reports && selectedReport.seed_reports.length > 0 && (
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#F5F2EC] px-4 py-2.5 border-b border-[#E2DDD5]">
                  <h4 className="text-xs font-bold text-[#163323] uppercase tracking-wider">
                    Individual Seed Report Breakdown
                  </h4>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-[#566A58] uppercase font-semibold border-b border-[#E2DDD5]">
                      <tr>
                        <th className="px-4 py-2">Seed Tag</th>
                        <th className="px-4 py-2">Prediction</th>
                        <th className="px-4 py-2">Probability</th>
                        <th className="px-4 py-2">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD5]">
                      {selectedReport.seed_reports.map((s, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5]">
                          <td className="px-4 py-2 font-bold text-[#163323]">{s.seed}</td>
                          <td className="px-4 py-2 font-semibold">
                            {s.prediction === 'GERMINATED' ? (
                              <span className="text-[#163323] font-bold bg-[#E1EDE6] px-2 py-0.5 rounded text-[10px]">
                                GERMINATED
                              </span>
                            ) : (
                              <span className="text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                                NON-GERMINATED
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 font-mono text-[#566A58]">{s.probability}</td>
                          <td className="px-4 py-2 font-mono font-bold text-[#163323]">{s.confidence_percent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E2DDD5]">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-xs font-semibold text-[#566A58] hover:bg-[#F5F2EC] rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedReport)}
                className="inline-flex items-center gap-1.5 bg-[#163323] hover:bg-[#234137] text-[#FAF8F5] font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR CONFIRMATION DIALOG */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2DDD5] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#163323]">Clear all saved reports?</h3>
                <span className="text-xs text-[#566A58]">This action cannot be undone.</span>
              </div>
            </div>

            <p className="text-xs text-[#566A58] leading-relaxed bg-[#FAF8F5] p-3 rounded-lg border border-[#E2DDD5]">
              This will permanently remove your saved analysis report records. Your prediction models, machine learning artifacts, and backend inference services will <strong>not</strong> be affected.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={clearing}
                className="px-4 py-2 text-xs font-semibold text-[#566A58] hover:bg-[#F5F2EC] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                disabled={clearing}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {clearing ? <span>Clearing...</span> : <span>Clear Reports</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-[#E2DDD5] bg-[#FAF8F5] text-center text-xs text-[#566A58]">
        SPOROUS &bull; Seed Quality & Germination Platform
      </footer>
    </div>
  );
};
