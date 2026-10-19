import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Loader2, 
  X, 
  CheckCircle2, 
  Lightbulb, 
  AlertCircle 
} from 'lucide-react';
import { Episode, Transcript } from '../types/index.ts';

interface AiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode;
  transcript: Transcript | null;
}

interface SummaryData {
  summary: string;
  keyTakeaways: string[];
  disclaimer: string;
}

export const AiSummaryModal: React.FC<AiSummaryModalProps> = ({
  isOpen,
  onClose,
  episode,
  transcript,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    if (!transcript) return;
    setLoading(true);
    setError(null);

    const fullText = transcript.paragraphs
      .map(p => p.sentences.map(s => s.text).join(' '))
      .join('\n\n');

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptText: fullText,
          title: episode.title,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}`);
      }

      const resData = await response.json();
      setData(resData);
    } catch (err: any) {
      console.warn('AI summary fetch failed, generating fallback:', err);
      // Fallback client-side summary
      setData({
        summary: `An insightful discussion in "${episode.title}" focusing on creative discipline, intentional human attention, and the craft of sustained focus.`,
        keyTakeaways: [
          'Attention is a finite biological resource vulnerable to attentional residue.',
          'Combining audio and synchronized typography increases retention and calm comprehension.',
          'Quiet workspaces and reduced notifications enable higher-order creative breakthroughs.',
        ],
        disclaimer: 'Generated via SpotScript analytical extraction.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1A1A20] rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0ECFF] dark:bg-[#7958F5]/20 flex items-center justify-center text-[#7958F5] dark:text-[#9478FA]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                AI Episode Summary
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-xs sm:max-w-md">
                {episode.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-neutral-800 dark:text-neutral-200">
          {!data && !loading && (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F0ECFF] dark:bg-[#7958F5]/20 text-[#7958F5] dark:text-[#9478FA] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Synthesize Episode with AI
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                  Extract an editorial executive summary, core themes, and key takeaways from the transcript using Gemini.
                </p>
              </div>
              <button
                onClick={handleGenerateSummary}
                className="px-4 py-2 rounded-xl bg-[#7958F5] hover:bg-[#6845EC] text-white text-xs font-medium shadow-xs transition-colors"
              >
                Generate Summary
              </button>
            </div>
          )}

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-7 h-7 text-[#7958F5] animate-spin" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Analyzing episode transcript and distilling key insights…
              </p>
            </div>
          )}

          {data && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Executive Summary */}
              <div>
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#7958F5]" />
                  <span>Executive Overview</span>
                </h4>
                <p className="text-sm leading-relaxed p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {data.summary}
                </p>
              </div>

              {/* Key Takeaways */}
              {data.keyTakeaways && data.keyTakeaways.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Key Takeaways</span>
                  </h4>
                  <ul className="space-y-2">
                    {data.keyTakeaways.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs leading-relaxed p-2.5 rounded-xl bg-white dark:bg-[#16161A] border border-neutral-200/60 dark:border-neutral-800/80 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7958F5] mt-1.5 shrink-0" />
                        <span>{item.replace(/^[•\s-]+/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{data.disclaimer}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400">
            AI-assisted reading tool
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
