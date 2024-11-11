import React, { useRef, useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface Rectangle {
  id: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
}

interface ImageCanvasProps {
  imageUrl: string;
  onProcessLines: (images: string[]) => void;
}

export function ImageCanvas({ imageUrl, onProcessLines }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [currentRect, setCurrentRect] = useState<Rectangle | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const scale = containerWidth / img.width;
        
        canvas.width = containerWidth;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          drawCanvas(ctx, img, canvas.width, canvas.height);
        }
      }
    };
  }, [imageUrl]);

  const drawCanvas = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw image with semi-transparent overlay
    ctx.globalAlpha = 0.3;
    ctx.drawImage(img, 0, 0, width, height);
    
    // Draw rectangles
    ctx.globalAlpha = 1;
    rectangles.forEach(rect => {
      // Draw the brightened image section
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.startX, rect.startY, rect.width, rect.height);
      ctx.clip();
      ctx.globalAlpha = 1;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();

      // Draw rectangle border
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.startX, rect.startY, rect.width, rect.height);
    });

    if (currentRect) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        currentRect.startX,
        currentRect.startY,
        currentRect.width,
        currentRect.height
      );
      ctx.clip();
      ctx.globalAlpha = 1;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentRect.startX,
        currentRect.startY,
        currentRect.width,
        currentRect.height
      );
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentRect({
      id: Date.now().toString(),
      startX: x,
      startY: y,
      width: 0,
      height: 0
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !currentRect || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - startPoint.x;
    const height = y - startPoint.y;

    const newRect = {
      ...currentRect,
      width: width,
      height: height
    };

    setCurrentRect(newRect);

    const ctx = canvas.getContext('2d');
    if (ctx && image) {
      drawCanvas(ctx, image, canvas.width, canvas.height);
    }
  };

  const stopDrawing = () => {
    if (currentRect && (Math.abs(currentRect.width) > 5 && Math.abs(currentRect.height) > 5)) {
      // Normalize rectangle coordinates if drawn in reverse
      const normalizedRect = {
        ...currentRect,
        startX: currentRect.width < 0 ? currentRect.startX + currentRect.width : currentRect.startX,
        startY: currentRect.height < 0 ? currentRect.startY + currentRect.height : currentRect.startY,
        width: Math.abs(currentRect.width),
        height: Math.abs(currentRect.height)
      };
      setRectangles(prev => [...prev, normalizedRect]);
      extractSelectedImage(normalizedRect);
    }
    setIsDrawing(false);
    setCurrentRect(null);
    setStartPoint(null);
  };

  const extractSelectedImage = (rect: Rectangle) => {
    if (!image || !canvasRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate scale factor
    const scale = image.naturalWidth / canvasRef.current.width;

    // Set canvas size to the selected area
    const width = Math.round(rect.width * scale);
    const height = Math.round(rect.height * scale);
    
    // Add padding
    const padding = Math.round(10); // Fixed 10px padding
    canvas.width = width + (padding * 2);
    canvas.height = height + (padding * 2);

    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Enable high-quality image processing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw the image with padding
    ctx.drawImage(
      image,
      Math.round(rect.startX * scale),
      Math.round(rect.startY * scale),
      width,
      height,
      padding,
      padding,
      width,
      height
    );

    // Convert to grayscale and enhance contrast
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const enhancedData = enhanceContrast(imageData);
    ctx.putImageData(enhancedData, 0, 0);

    // Convert to PNG with maximum quality
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    setSelectedImages(prev => [...prev, dataUrl]);
  };

  const enhanceContrast = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const factor = 1.5; // Increased contrast factor

    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale with enhanced contrast
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const newValue = Math.min(255, Math.max(0, ((avg - 128) * factor) + 128));
      
      data[i] = newValue;     // Red
      data[i + 1] = newValue; // Green
      data[i + 2] = newValue; // Blue
      // Keep alpha channel unchanged
    }

    return imageData;
  };

  const clearRectangles = () => {
    setRectangles([]);
    setSelectedImages([]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && image && canvas) {
      drawCanvas(ctx, image, canvas.width, canvas.height);
    }
  };

  const processRectangles = () => {
    if (selectedImages.length === 0) return;
    onProcessLines(selectedImages);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="border rounded-lg cursor-crosshair w-full"
        />
      </div>

      {selectedImages.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Areas:</h3>
          <div className="grid grid-cols-1 gap-4">
            {selectedImages.map((dataUrl, index) => (
              <div key={index} className="border rounded-lg p-2">
                <img 
                  src={dataUrl} 
                  alt={`Selection ${index + 1}`}
                  className="max-w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={clearRectangles}
          className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Selections
        </button>
        <button
          onClick={processRectangles}
          disabled={selectedImages.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Process Selected Areas
        </button>
      </div>
    </div>
  );
}