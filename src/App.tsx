import React, { useState } from 'react';
import { Pencil, Plus, Github, Linkedin } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { RecordCard } from './components/RecordCard';
import { ProcessingIndicator } from './components/ProcessingIndicator';
import { ErrorMessage } from './components/ErrorMessage';
import { ApiKeyInput } from './components/ApiKeyInput';
import { processImage } from './services/ocrService';
import { validateImage } from './utils/imageUtils';
import { Patient } from './types';

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    try {
      await validateImage(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate image';
      setError(errorMessage);
    }
  };

  const handleProcessLines = async (lineImages: ImageData[], file: File) => {
    setProcessing(true);
    setError(null);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to create canvas context');

      const lineTexts: string[] = [];

      for (const imageData of lineImages) {
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
        
        const base64Image = canvas.toDataURL('image/png', 1.0);
        const text = await processImage(base64Image);
        if (text) lineTexts.push(text);
      }

      const fullText = lineTexts.join('\n');
      
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: `Note ${(patients.length + 1).toString().padStart(3, '0')}`,
        dateOfBirth: new Date().toLocaleDateString(),
        recordDate: new Date().toLocaleDateString(),
        content: fullText
      };
      
      setPatients(prev => [newPatient, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process the image';
      setError(errorMessage);
      console.error('Error processing image:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <nav className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Pencil className="h-5 w-5 text-apple-black" />
            <span className="text-sm font-semibold text-apple-black">Handwrite</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/swaroopIngale"
              target="_blank"
              rel="noopener noreferrer"
              className="text-apple-gray hover:text-apple-black transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/swaroop-ingavale-31142619b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-apple-gray hover:text-apple-black transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-grow pt-20 pb-16">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-semibold text-apple-black tracking-tight mb-4">
              Transform your handwriting
              <br />
              into digital text.
            </h1>
            <p className="text-xl text-apple-gray">
              Powerful OCR technology. Effortless conversion.
            </p>
          </div>

          <ApiKeyInput />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden mb-12">
            <div className="p-8">
              <h2 className="text-xl font-semibold text-apple-black mb-6 flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Upload Your Notes
              </h2>
              <ImageUploader 
                onImageUpload={handleImageUpload}
                onProcessLines={handleProcessLines}
              />
              
              {processing && <ProcessingIndicator message="Processing selected lines..." />}
              {error && <ErrorMessage message={error} />}
            </div>
          </div>

          <div className="space-y-6">
            {patients.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-apple-gray text-lg">
                  No notes yet. Upload your handwritten notes to get started.
                </p>
              </div>
            ) : (
              patients.map(patient => (
                <RecordCard key={patient.id} patient={patient} />
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200/50 py-8 mt-auto">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <p className="text-sm text-apple-gray">
              Created by{' '}
              <a 
                href="https://www.linkedin.com/in/swaroop-ingavale-31142619b" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-apple-link hover:underline"
              >
                Swaroop Ingavale
              </a>
            </p>
            <div className="text-xs text-apple-gray max-w-2xl mx-auto space-y-2">
              <p>
                <span className="font-semibold">Disclaimer:</span> This application is a prototype project and is provided "as is" without warranty of any kind, express or implied.
              </p>
              <p>
                The creator is not liable for any damages or losses arising from the use of this application. The accuracy of text recognition depends on various factors including image quality and handwriting style.
              </p>
              <p>
                This tool is intended for experimental purposes only. Please verify all converted text for accuracy before use in any critical applications.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;