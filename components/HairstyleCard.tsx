
import React from 'react';
import { GenerationResult } from '../types';

interface HairstyleCardProps {
  result: GenerationResult;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPreview: () => void;
}

const HairstyleCard: React.FC<HairstyleCardProps> = ({ result, isSelected, onSelect, onPreview }) => {
  return (
    <div 
      className={`relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
        isSelected ? 'ring-4 ring-indigo-500 shadow-2xl scale-[1.02]' : 'hover:shadow-lg'
      }`}
      onClick={() => onSelect(result.id)}
    >
      <img 
        src={result.imageUrl} 
        alt={result.styleName}
        className="w-full h-72 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        <p className="text-white font-semibold text-lg">{result.styleName}</p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="mt-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center transition-all border border-white/30"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Quick Preview
        </button>
      </div>
      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md">
        <span className="text-white text-[10px] uppercase tracking-wider font-bold">Pro Style</span>
      </div>
    </div>
  );
};

export default HairstyleCard;
