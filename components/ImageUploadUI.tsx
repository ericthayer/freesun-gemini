
import React, { useRef, useState } from 'react';
import { Camera, X, User, Loader2, Pencil } from 'lucide-react';
import { validateImageFile } from '../utils/fileUtils';
import { compressImage } from '../utils/imageUtils';
import { ImageEditor } from './profile/ImageEditor';
import { supabase } from '../lib/supabaseClient';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrlOrBase64: string) => void;
  className?: string;
  userId?: string;
}

function detectMimeFromDataUrl(dataUrl: string): { ext: string; contentType: string } {
  if (dataUrl.startsWith('data:image/gif')) return { ext: 'gif', contentType: 'image/gif' };
  if (dataUrl.startsWith('data:image/png')) return { ext: 'png', contentType: 'image/png' };
  if (dataUrl.startsWith('data:image/webp')) return { ext: 'webp', contentType: 'image/webp' };
  return { ext: 'jpg', contentType: 'image/jpeg' };
}

async function uploadToStorage(base64: string, userId: string): Promise<string> {
  const res = await fetch(base64);
  const blob = await res.blob();
  const { ext, contentType } = detectMimeFromDataUrl(base64);
  const filePath = `${userId}/avatar_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('profile-images')
    .upload(filePath, blob, { contentType, upsert: true });

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath);

  return publicData.publicUrl;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageChange, className = "", userId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [rawBase64, setRawBase64] = useState<string | null>(null);

  const processAndSet = async (base64: string) => {
    if (userId) {
      setIsProcessing(true);
      try {
        const url = await uploadToStorage(base64, userId);
        setPreview(base64);
        onImageChange(url);
      } catch (err) {
        console.error('Storage upload failed, falling back to base64:', err);
        setPreview(base64);
        onImageChange(base64);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setPreview(base64);
      onImageChange(base64);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file, 10);

      if (!validation.valid) {
        alert(validation.error);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setIsProcessing(true);

      try {
        const isGif = file.type === 'image/gif';

        if (isGif) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            processAndSet(base64);
          };
          reader.readAsDataURL(file);
          return;
        }

        const compressedBlob = await compressImage(file, {
          quality: 0.8,
          maxWidth: 800,
          maxHeight: 800
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setRawBase64(base64);
          setShowEditor(true);
          setIsProcessing(false);
        };
        reader.readAsDataURL(compressedBlob);
      } catch {
        alert('Failed to process image. Please try another one.');
        setIsProcessing(false);
      }
    }
  };

  const handleEditorApply = (editedBase64: string) => {
    setShowEditor(false);
    setRawBase64(null);
    processAndSet(editedBase64);
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setRawBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openEditorForExisting = () => {
    const src = preview || currentImage;
    if (src) {
      setRawBase64(src);
      setShowEditor(true);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setRawBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageChange('');
  };

  const displayImage = preview || currentImage;

  return (
    <>
      <div className={`relative group ${className}`}>
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`w-32 h-32 rounded-3xl border-4 border-muted/50 overflow-hidden bg-muted flex items-center justify-center transition-all relative ${isProcessing ? 'cursor-wait opacity-70' : 'cursor-pointer hover:border-primary/50'}`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 text-primary">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Processing</span>
            </div>
          ) : displayImage ? (
            <img src={displayImage} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <User size={32} />
              <span className="text-[10px] font-bold uppercase">Upload</span>
            </div>
          )}

          {!isProcessing && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="text-white" size={24} />
            </div>
          )}
        </div>

        {displayImage && !isProcessing && (
          <div className="absolute -top-2 -right-2 flex gap-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openEditorForExisting(); }}
              className="p-1.5 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
              aria-label="Edit photo"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={clearImage}
              className="p-1 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
              aria-label="Remove photo"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={isProcessing}
        />
      </div>

      {showEditor && rawBase64 && (
        <ImageEditor
          imageSrc={rawBase64}
          onApply={handleEditorApply}
          onCancel={handleEditorCancel}
        />
      )}
    </>
  );
};
