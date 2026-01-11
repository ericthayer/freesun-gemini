
import React, { useRef, useState } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (base64: string) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageChange, className = "" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onImageChange(base64);
      };
      reader.readAsDataURL(file);
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
        onClick={() => fileInputRef.current?.click()}
        className="w-32 h-32 rounded-3xl border-4 border-muted/50 overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all relative"
      >
        {displayImage ? (
          <img src={displayImage} alt="Profile preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <User size={32} />
            <span className="text-[10px] font-bold uppercase">Upload</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="text-white" size={24} />
        </div>
      </div>
      
      {displayImage && (
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
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
