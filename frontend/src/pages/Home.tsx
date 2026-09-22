import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import sproutImage from '../assets/sprout_image.jpeg';
import sporousLogo from '../assets/sporous_logo.jpeg';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D3A32] flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* HERO SECTION — 2-Column Editorial Layout */}
        <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#566A58] bg-[#F5F2EC] px-3 py-1 rounded-full border border-[#E2DDD5] inline-block">
              AI-ASSISTED SEED ANALYSIS
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#163323] tracking-tight leading-[1.15]">
              Smarter Seeds.<br />
              Better Harvests.
            </h1>
            <p className="text-base sm:text-lg text-[#566A58] leading-relaxed max-w-xl">
              SPOROUS uses computer vision and machine learning to assess seed quality and analyze germination potential at the individual-seed level.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/prediction')}
                className="inline-flex items-center gap-2.5 bg-[#163323] hover:bg-[#234137] text-[#FAF8F5] font-semibold text-xs tracking-wide px-6 py-3.5 rounded-lg transition-colors shadow-sm group"
              >
                <span>Explore Prediction</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="inline-flex items-center gap-2 bg-transparent hover:bg-[#F5F2EC] text-[#163323] font-semibold text-xs tracking-wide px-5 py-3.5 rounded-lg border border-[#E2DDD5] transition-colors"
              >
                <span>How It Works</span>
              </button>
            </div>
          </div>

          {/* Real Sprout Image Hero Visual */}
          <div className="lg:col-span-5">
            <div className="bg-white p-3 rounded-2xl border border-[#E2DDD5] shadow-sm">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-[#F5F2EC]">
                <img
                  src={sproutImage}
                  alt="SPOROUS Seed Sprout Analysis"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#163323]/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 bg-[#FAF8F5]/95 backdrop-blur-sm p-3 rounded-lg border border-[#E2DDD5] text-xs">
                  <span className="font-bold text-[#163323] block">Computer Vision Seed Tray Inspection</span>
                  <span className="text-[#566A58] text-[11px]">Individual seed detection & temporal feature extraction</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRODUCTION SECTION */}
        <section className="border-t border-[#E2DDD5] bg-[#F5F2EC] py-16 px-6">
          <div className="max-w-4xl mx-auto space-y-4 text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#566A58]">
              Platform Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#163323]">
              From seed inspection to germination
            </h2>
            <p className="text-sm sm:text-base text-[#566A58] leading-relaxed">
              SPOROUS brings seed quality assessment and germination analysis into one computer-vision-based platform. It combines image-based analysis with temporal seed-growth information to evaluate individual seeds.
            </p>
          </div>
        </section>

        {/* CAPABILITIES SECTION — Editorial 3-Part Grid */}
        <section className="max-w-6xl mx-auto px-6 py-20 w-full space-y-12">
          <div className="space-y-2 border-b border-[#E2DDD5] pb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#566A58]">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-bold text-[#163323]">
              Precision Seed Intelligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 01 QUALITY ASSESSMENT */}
            <div className="bg-white p-8 rounded-xl border border-[#E2DDD5] space-y-4 hover:border-[#386655] transition-all hover:shadow-sm">
              <span className="text-2xl font-extrabold text-[#386655] font-mono block">01</span>
              <h3 className="text-lg font-bold text-[#163323]">QUALITY ASSESSMENT</h3>
              <p className="text-xs text-[#566A58] leading-relaxed">
                Analyze maize and wheat seed images for quality-related characteristics using the available production quality models.
              </p>
            </div>

            {/* 02 GERMINATION ANALYSIS */}
            <div className="bg-white p-8 rounded-xl border border-[#E2DDD5] space-y-4 hover:border-[#386655] transition-all hover:shadow-sm">
              <span className="text-2xl font-extrabold text-[#386655] font-mono block">02</span>
              <h3 className="text-lg font-bold text-[#163323]">GERMINATION ANALYSIS</h3>
              <p className="text-xs text-[#566A58] leading-relaxed">
                Analyze individual seeds using the production temporal germination pipeline.
              </p>
            </div>

            {/* 03 INDIVIDUAL-SEED INSIGHT */}
            <div className="bg-white p-8 rounded-xl border border-[#E2DDD5] space-y-4 hover:border-[#386655] transition-all hover:shadow-sm">
              <span className="text-2xl font-extrabold text-[#386655] font-mono block">03</span>
              <h3 className="text-lg font-bold text-[#163323]">INDIVIDUAL-SEED INSIGHT</h3>
              <p className="text-xs text-[#566A58] leading-relaxed">
                View prediction results for individual detected seeds rather than only a single batch-level result.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="border-t border-[#E2DDD5] bg-[#F5F2EC] py-20 px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="space-y-2 border-b border-[#E2DDD5] pb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#566A58]">
                Analysis Workflow
              </span>
              <h2 className="text-3xl font-bold text-[#163323]">
                How SPOROUS Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#163323] text-[#FAF8F5] flex items-center justify-center font-bold text-sm font-mono">
                  01
                </div>
                <h3 className="text-base font-bold text-[#163323]">CAPTURE</h3>
                <p className="text-xs text-[#566A58] leading-relaxed">
                  Provide the required seed image/sequence input for evaluation.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#163323] text-[#FAF8F5] flex items-center justify-center font-bold text-sm font-mono">
                  02
                </div>
                <h3 className="text-base font-bold text-[#163323]">ANALYZE</h3>
                <p className="text-xs text-[#566A58] leading-relaxed">
                  SPOROUS detects and tracks individual seeds and extracts the required production features.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#163323] text-[#FAF8F5] flex items-center justify-center font-bold text-sm font-mono">
                  03
                </div>
                <h3 className="text-base font-bold text-[#163323]">REPORT</h3>
                <p className="text-xs text-[#566A58] leading-relaxed">
                  The production model generates an individual-seed germination result and probability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL BANNER SECTION */}
        <section className="relative py-24 px-6 bg-[#163323] text-[#FAF8F5] overflow-hidden">
          <div className="absolute inset-0 opacity-25 mix-blend-overlay">
            <img
              src={sproutImage}
              alt="Seed Development"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-4xl mx-auto text-center space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9EC1B0]">
              Agricultural Precision
            </span>
            <blockquote className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#FAF8F5]">
              “From visual structure to measurable seed behavior.”
            </blockquote>
          </div>
        </section>

        {/* PROJECT / TECHNOLOGY SECTION */}
        <section className="max-w-6xl mx-auto px-6 py-20 w-full space-y-12">
          <div className="space-y-2 border-b border-[#E2DDD5] pb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#566A58]">
              Underlying Technology
            </span>
            <h2 className="text-3xl font-bold text-[#163323]">
              Technical Foundations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            <div className="bg-white p-6 rounded-xl border border-[#E2DDD5] space-y-2">
              <span className="font-bold text-[#163323] uppercase tracking-wider block">
                COMPUTER VISION
              </span>
              <p className="text-[#566A58] leading-relaxed">
                For seed detection, segmentation, bounding box overlay, and visual feature extraction.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E2DDD5] space-y-2">
              <span className="font-bold text-[#163323] uppercase tracking-wider block">
                TEMPORAL ANALYSIS
              </span>
              <p className="text-[#566A58] leading-relaxed">
                For observing seed growth trajectory and spatial development across sequence frames.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E2DDD5] space-y-2">
              <span className="font-bold text-[#163323] uppercase tracking-wider block">
                MACHINE LEARNING
              </span>
              <p className="text-[#566A58] leading-relaxed">
                For production gradient boosting and deep convolutional feature classification.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="border-t border-[#E2DDD5] bg-[#F5F2EC] py-16 px-6 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold text-[#163323]">
              Ready to analyze your seeds?
            </h2>
            <p className="text-xs text-[#566A58]">
              Access the live prediction engine to run Maize, Wheat, or Pearl Millet analysis.
            </p>
            <div>
              <button
                onClick={() => navigate('/prediction')}
                className="inline-flex items-center gap-2 bg-[#163323] hover:bg-[#234137] text-[#FAF8F5] font-semibold text-xs tracking-wide px-6 py-3.5 rounded-lg transition-all shadow-sm group"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E2DDD5] bg-[#FAF8F5] py-10 px-6 text-xs text-[#566A58]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={sporousLogo} alt="SPOROUS" className="w-8 h-8 object-contain rounded border border-[#E2DDD5]" />
            <div>
              <span className="font-extrabold text-sm text-[#163323] tracking-tight block">
                SPOROUS
              </span>
              <span className="text-[11px] block">
                Seed Quality & Germination Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link to="/home" className="hover:text-[#163323] transition-colors">Home</Link>
            <Link to="/prediction" className="hover:text-[#163323] transition-colors">Prediction</Link>
            <Link to="/reports" className="hover:text-[#163323] transition-colors">Reports</Link>
            <Link to="/profile" className="hover:text-[#163323] transition-colors">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
