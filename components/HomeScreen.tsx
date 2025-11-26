import React from 'react';
import { CountryCode } from '../types';

interface HomeScreenProps {
  onStart: () => void;
  country: CountryCode;
  setCountry: (c: CountryCode) => void;
}

// Map Country Code to display info
const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, country, setCountry }) => {
  
  const currentCountry = COUNTRIES.find(c => c.code === country);
  const isPortuguese = country === 'BR';
  const isEnglish = country === 'US';

  // Simple dynamic text based on country selection
  const texts = {
    title: "PriceScanner AI",
    subtitle: isEnglish 
      ? `Scan products to find online prices and nearby stores in ${currentCountry?.name}.`
      : isPortuguese
      ? `Digitalize produtos para encontrar preços online e lojas próximas no ${currentCountry?.name}.`
      : `Escanea productos para encontrar precios online y tiendas cercanas en ${currentCountry?.name}.`,
    button: isEnglish ? "Start Scan" : isPortuguese ? "Iniciar Scanner" : "Escanear Producto",
    locationNote: isEnglish 
      ? "* Location access required for nearby stores" 
      : isPortuguese 
      ? "* Acesso à localização necessário para lojas próximas"
      : "* Se requiere ubicación para buscar tiendas cercanas",
    select: isEnglish ? "Select Country" : isPortuguese ? "Selecione o País" : "Selecciona tu País"
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-3/4 bg-gradient-to-b from-indigo-900/30 to-black pointer-events-none"></div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full max-w-md mx-auto">
        
        {/* Logo */}
        <div className="mb-6 relative shrink-0">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center transform rotate-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white transform -rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-1 shrink-0">{texts.title}</h1>
        <p className="text-gray-400 text-sm text-center mb-6 px-4 leading-relaxed shrink-0">
          {texts.subtitle}
        </p>

        {/* Country Grid - Improved UI */}
        <div className="w-full mb-6 flex-1 min-h-0 flex flex-col">
          <p className="text-xs text-gray-500 uppercase tracking-wider text-center mb-3 font-semibold shrink-0">{texts.select}</p>
          
          <div className="grid grid-cols-2 gap-3 overflow-y-auto px-1 custom-scrollbar pb-2">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setCountry(c.code)}
                className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 group ${
                  country === c.code 
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-900/10 ring-1 ring-blue-500/50' 
                    : 'bg-gray-800/40 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                }`}
              >
                <span className="text-3xl filter drop-shadow-md shrink-0">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <span className={`block text-sm font-bold truncate ${country === c.code ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                    {c.name}
                  </span>
                </div>
                
                {/* Selection Indicator */}
                {country === c.code && (
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 rounded-full p-0.5">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                     </svg>
                   </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onStart}
          className="w-full bg-white text-black font-bold text-lg py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          {texts.button}
        </button>
        
        <p className="mt-4 text-gray-500 text-[10px] text-center max-w-xs shrink-0">
          {texts.locationNote}
        </p>
      </div>
    </div>
  );
};