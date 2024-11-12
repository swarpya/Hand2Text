import React, { useState, useEffect } from 'react';
import { Key, Check, AlertCircle } from 'lucide-react';

export function ApiKeyInput() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('huggingface_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }
    
    localStorage.setItem('huggingface_api_key', apiKey.trim());
    setSaved(true);
    setError('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-xl">
          <Key className="h-5 w-5 text-apple-black" />
        </div>
        <h3 className="text-lg font-semibold text-apple-black">HuggingFace API Key</h3>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setSaved(false);
              setError('');
            }}
            placeholder="Enter your HuggingFace API key"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-2 text-sm text-apple-gray">
            Get your API key from{' '}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              HuggingFace Settings
            </a>
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {saved && (
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">API key saved</span>
          </div>
        )}

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save API Key
        </button>
      </div>
    </div>
  );
}