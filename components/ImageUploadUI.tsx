
import React, { useRef, useState } from 'react';
import { Camera, Upload, X, User, Loader2 } from 'lucide-react';
import { validateImageFile } from '../utils/fileUtils';
import { compressImage } from '../utils/imageUtils';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (base64: string) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageChange, className = "" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Initial Validation
      const validation = validateImageFile(file, 10); // Allow slightly larger initial file before compression
      
      if (!validation.valid) {
        alert(validation.error);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      setIsProcessing(true);
      
      try {
        // 2. Client-side Compression
        const compressedBlob = await compressImage(file, {
          quality: 0.6,
          maxWidth: 400,
          maxHeight: 400
        });

        // 3. Generate Preview and notify parent
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setPreview(base64);
          onImageChange(base64);
          setIsProcessing(false);
        };
        reader.readAsDataURL(compressedBlob);
      } catch (error) {
        console.error('Image compression failed:', error);
        alert('Failed to process image. Please try another one.');
        setIsProcessing(false);
      }
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageChange('');
  };

  const displayImage = preview || currentImage;

  return (
    <div className={`relative group ${className}`}>
      <div 
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`w-32 h-32 rounded-3xl border-4 border-muted/50 overflow-hidden bg-muted flex items-center justify-center transition-all relative ${isProcessing ? 'cursor-wait opacity-70' : 'cursor-pointer hover:border-primary/50'}`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 text-primary">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Optimizing</span>
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
        <button 
          type="button"
          onClick={clearImage}
          className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <X size={14} />
        </button>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg,image/png,image/webp" 
        className="hidden" 
        disabled={isProcessing}
      />
    </div>
  );
};
