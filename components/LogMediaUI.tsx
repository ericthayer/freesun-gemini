
import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Video, X, Plus, Play, Camera, Film } from 'lucide-react';
import { LogAttachment } from './LogsUI';
import { validateImageFile } from '../utils/fileUtils';
import { compressImage } from '../utils/imageUtils';

interface LogMediaGalleryProps {
  attachments: LogAttachment[];
}

export const LogMediaGallery: React.FC<LogMediaGalleryProps> = ({ attachments }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((item, index) => (
        <div 
          key={index} 
          className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group/media bg-muted shadow-sm"
        >
          {item.type === 'image' ? (
            <img src={item.url} alt={`Log media ${index}`} className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full relative">
              <video src={item.url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Play size={16} className="text-white fill-white" />
              </div>
            </div>
          )}
          <div className="absolute top-1 right-1">
            {item.type === 'image' ? (
              <ImageIcon size={10} className="text-white drop-shadow-md" />
            ) : (
              <Video size={10} className="text-white drop-shadow-md" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

interface LogMediaUploadProps {
  onMediaChange: (attachments: LogAttachment[]) => void;
  className?: string;
}

export const LogMediaUpload: React.FC<LogMediaUploadProps> = ({ onMediaChange, className = "" }) => {
  const [items, setItems] = useState<LogAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAttachments: LogAttachment[] = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const validation = validateImageFile(file, 5);
        if (validation.valid) {
          try {
            const compressed = await compressImage(file, { quality: 0.7, maxWidth: 800, maxHeight: 800 });
            const reader = new FileReader();
            const promise = new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
            });
            reader.readAsDataURL(compressed);
            const base64 = await promise;
            newAttachments.push({ url: base64, type: 'image' });
          } catch (err) {
            console.error('Error processing image:', err);
          }
        }
      } else if (file.type.startsWith('video/')) {
        // Simple base64 for small video clips
        if (file.size < 5 * 1024 * 1024) { // 5MB limit for videos
          const reader = new FileReader();
          const promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
          });
          reader.readAsDataURL(file);
          const base64 = await promise;
          newAttachments.push({ url: base64, type: 'video' });
        } else {
          alert("Video file too large. Please use a clip under 5MB.");
        }
      }
    }

    const updated = [...items, ...newAttachments];
    setItems(updated);
    onMediaChange(updated);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onMediaChange(updated);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 ml-1">
        <Camera size={12} /> Visual Evidence (Photos/Clips)
      </label>
      
      <div className="flex flex-wrap gap-4">
        {items.map((item, index) => (
          <div key={index} className="relative w-24 h-24 rounded-2xl border-2 border-muted overflow-hidden bg-muted group/upload">
            {item.type === 'image' ? (
              <img src={item.url} alt="upload preview" className="w-full h-full object-cover" />
            ) : (
              <video src={item.url} className="w-full h-full object-cover" />
            )}
            <button 
              type="button"
              onClick={() => removeItem(index)}
              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full shadow-lg opacity-0 group-hover/upload:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
            <div className="absolute bottom-1 right-1 pointer-events-none">
              {item.type === 'image' ? <ImageIcon size={12} className="text-white drop-shadow-md" /> : <Video size={12} className="text-white drop-shadow-md" />}
            </div>
          </div>
        ))}
        
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 text-primary hover:bg-primary/10 transition-colors"
        >
          <Plus size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tight">Add Media</span>
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,video/*" 
        multiple
        className="hidden" 
      />
    </div>
  );
};
