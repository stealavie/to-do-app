import React, { useState } from 'react';
import { X, Key, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    if (!apiKey.startsWith('AI')) {
      setError('Invalid Gemini API key format. API keys should start with "AI"');
      return;
    }

    onSave(apiKey.trim());
    setApiKey('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setApiKey('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Key className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900">
              Gemini API Key Required
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-secondary-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4">
          <p className="text-secondary-600 leading-relaxed">
            To use the AI assistant, you'll need to provide your own Google Gemini API key. 
            This key is stored locally in your browser and never shared with our servers.
          </p>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-primary-800 mb-2">
              How to get your API key:
            </h3>
            <ol className="text-sm text-primary-700 space-y-1">
              <li>1. Visit Google AI Studio</li>
              <li>2. Sign in with your Google account</li>
              <li>3. Create a new API key</li>
              <li>4. Copy and paste it below</li>
            </ol>
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
            >
              <span>Get API Key</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-secondary-700 mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
                placeholder="AIza..."
                className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
              {error && (
                <p className="text-danger-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Save API Key
              </Button>
            </div>
          </form>

          <div className="text-xs text-secondary-500 bg-secondary-50 rounded-lg p-3">
            <strong>Privacy Note:</strong> Your API key is stored locally in your browser's 
            localStorage and is only used to communicate directly with Google's Gemini API. 
            We never see or store your API key on our servers.
          </div>
        </div>
      </div>
    </div>
  );
};