
import React, { useState } from 'react';

interface EditorOverlayProps {
  onEdit: (prompt: string) => void;
  isEditing: boolean;
  onClose: () => void;
}

const EditorOverlay: React.FC<EditorOverlayProps> = ({ onEdit, isEditing, onClose }) => {
  const [prompt, setPrompt] = useState('');

  const suggestions = [
    "Make it platinum blonde",
    "Add a vintage film filter",
    "Increase hair volume",
    "Add sun-kissed highlights",
    "Remove flyaways"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">AI Touch-Up</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Change hair color to auburn and add a retro warm filter..."
            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
          />
          
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-full text-xs transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          <button
            disabled={isEditing || !prompt}
            onClick={() => onEdit(prompt)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-2xl font-bold transition-all flex items-center justify-center"
          >
            {isEditing ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Apply Magic Edit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorOverlay;
