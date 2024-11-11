import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { ImageCanvas } from './ImageCanvas';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onProcessLines: (lineImages: ImageData[], file: File) => void;
}

export function ImageUploader({ onImageUpload, onProcessLines }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        setSelectedFile(file);
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setSelectedFile(file);
      onImageUpload(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleProcessImages = async (images: string[]) => {
    if (!selectedFile) return;
    const lineImages: ImageData[] = await Promise.all(
      images.map(async (dataUrl) => {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = dataUrl;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      })
    );

    onProcessLines(lineImages, selectedFile);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
        isDragging
          ? 'border-apple-link bg-blue-50'
          : 'border-gray-200 hover:border-apple-link hover:bg-blue-50/50'
      }`}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />
      
      {!preview ? (
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="mb-4 bg-gray-100 p-4 rounded-2xl">
            <ImageIcon className="h-12 w-12 text-apple-black" />
          </div>
          <span className="text-base text-apple-black">
            Drag and drop your handwritten notes, or click to select
          </span>
          <span className="text-sm text-apple-gray mt-2">
            Supports: JPG, PNG, GIF (max 10MB)
          </span>
        </label>
      ) : (
        <div className="space-y-4">
          <ImageCanvas 
            imageUrl={preview} 
            onProcessLines={handleProcessImages}
          />
          <p className="text-sm text-apple-gray">
            Draw rectangles around the text areas you want to process
          </p>
        </div>
      )}
    </div>
  );
}