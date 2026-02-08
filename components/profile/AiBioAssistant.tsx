import React, { useState } from 'react';
import { Sparkles, RotateCcw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { generateCrewBio } from '../../services/geminiService';

interface AiBioAssistantProps {
  name: string;
  role: string;
  experienceYears: number;
  certifications: string[];
  specialty?: string;
  onAccept: (bio: string) => void;
}

export const AiBioAssistant: React.FC<AiBioAssistantProps> = ({
  name, role, experienceYears, certifications, specialty, onAccept
}) => {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!name.trim()) {
      setError('Please fill in your name first.');
      return;
    }
    setLoading(true);
    setError('');
    setSuggestion('');
    try {
      const bio = await generateCrewBio({ name, role, experienceYears, certifications, specialty });
      setSuggestion(bio);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('not configured')) {
        setError('Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file.');
      } else {
        setError('Could not generate a bio right now. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Sparkles size={14} />
        )}
        {loading ? 'Generating...' : suggestion ? 'Regenerate with AI' : 'Generate Bio with AI'}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-xl">
          <AlertCircle size={12} />
          {error}
        </div>
      )}

      {suggestion && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <Sparkles size={10} /> AI Suggestion
          </div>
          <p className="text-sm text-foreground leading-relaxed italic">
            "{suggestion}"
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { onAccept(suggestion); setSuggestion(''); }}
              className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Check size={12} /> Use This
            </button>
            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={12} /> Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
