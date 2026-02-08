import React, { useState } from 'react';
import { Link2, Plus, X, AlertCircle, Globe, ExternalLink } from 'lucide-react';

export interface PersonalLink {
  label: string;
  url: string;
}

interface PersonalLinksEditorProps {
  links: PersonalLink[];
  onChange: (links: PersonalLink[]) => void;
  maxLinks?: number;
}

const PRESETS = [
  { label: 'LinkedIn', placeholder: 'https://linkedin.com/in/your-profile' },
  { label: 'Instagram', placeholder: 'https://instagram.com/your-handle' },
  { label: 'Website', placeholder: 'https://your-website.com' },
];

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export const PersonalLinksEditor: React.FC<PersonalLinksEditorProps> = ({
  links, onChange, maxLinks = 5
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const addLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    if (!isValidUrl(newUrl.trim())) {
      setUrlError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    if (links.length >= maxLinks) return;
    onChange([...links, { label: newLabel.trim(), url: newUrl.trim() }]);
    setNewLabel('');
    setNewUrl('');
    setUrlError('');
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const addPreset = (preset: { label: string; placeholder: string }) => {
    if (links.some(l => l.label === preset.label)) return;
    if (links.length >= maxLinks) return;
    setNewLabel(preset.label);
    setNewUrl('');
    setUrlError('');
  };

  return (
    <div className="space-y-4">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
        <Link2 size={12} /> Personal Links
      </label>

      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted/30 border dark:border-primary/20 px-3 py-2 rounded-xl group">
              <Globe size={14} className="text-primary shrink-0" />
              <span className="text-xs font-bold text-foreground shrink-0">{link.label}</span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary truncate flex items-center gap-1 transition-colors"
              >
                {link.url}
                <ExternalLink size={10} />
              </a>
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="ml-auto text-muted-foreground hover:text-destructive transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Remove ${link.label} link`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {links.length < maxLinks && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.filter(p => !links.some(l => l.label === p.label)).map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => addPreset(preset)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition-colors"
              >
                + {preset.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Label"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="w-28 bg-muted/50 border dark:border-primary/30 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <input
              type="url"
              placeholder="https://..."
              value={newUrl}
              onChange={e => { setNewUrl(e.target.value); setUrlError(''); }}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())}
              className={`flex-grow bg-muted/50 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${urlError ? 'border-destructive dark:border-destructive' : 'dark:border-primary/30'}`}
            />
            <button
              type="button"
              onClick={addLink}
              disabled={!newLabel.trim() || !newUrl.trim()}
              className="bg-primary/10 hover:bg-primary/20 p-2 rounded-xl text-primary transition-all disabled:opacity-30"
              aria-label="Add link"
            >
              <Plus size={20} />
            </button>
          </div>

          {urlError && (
            <div className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle size={12} />
              {urlError}
            </div>
          )}
        </div>
      )}

      {links.length >= maxLinks && (
        <p className="text-[10px] text-muted-foreground">Maximum of {maxLinks} links reached.</p>
      )}
    </div>
  );
};
