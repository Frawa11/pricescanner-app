import React from 'react';
import { AnalysisResult, GroundingChunk, CountryCode } from '../types';

interface ResultCardProps {
  result?: AnalysisResult | null;
  isLoading?: boolean;
  image: string;
  onReset: () => void;
  country: CountryCode;
}

const RESULT_TEXT: Record<string, any> = {
  default: {
    webTitle: 'Tiendas en Línea',
    mapsTitle: 'Tiendas Cercanas',
    scanAgain: 'Escanear',
    download: 'Guardar',
    share: 'Compartir',
    shareError: 'La función de compartir no está disponible en este dispositivo.',
    reportTitle: 'REPORTE - PRICESCANNER',
    analyzing: 'Analizando Producto...',
  },
  en: {
    webTitle: 'Online Stores',
    mapsTitle: 'Nearby Stores',
    scanAgain: 'Scan',
    download: 'Save',
    share: 'Share',
    shareError: 'Sharing feature is not available on this device.',
    reportTitle: 'REPORT - PRICESCANNER',
    analyzing: 'Analyzing Product...',
  },
  pt: {
    webTitle: 'Lojas Online',
    mapsTitle: 'Lojas Próximas',
    scanAgain: 'Escanear',
    download: 'Salvar',
    share: 'Compartilhar',
    shareError: 'A funcionalidade de compartilhamento não está disponível neste dispositivo.',
    reportTitle: 'RELATÓRIO - PRICESCANNER',
    analyzing: 'Analisando Produto...',
  }
};

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      {text.split('\n').map((line, i) => {
        if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
           return <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>
        } else if (line.trim().startsWith('* ')) {
           return <li key={i} className="ml-4 text-gray-300">{line.replace('* ', '')}</li>
        } else {
           return <p key={i} className="text-gray-300 mb-2 leading-relaxed">{line}</p>
        }
      })}
    </div>
  );
};

const SkeletonLine: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-gray-700/50 rounded animate-pulse ${className}`}></div>
);

export const ResultCard: React.FC<ResultCardProps> = ({ result, isLoading = false, image, onReset, country }) => {
  const langKey = country === 'US' ? 'en' : country === 'BR' ? 'pt' : 'default';
  const t = RESULT_TEXT[langKey];

  // LOADING STATE (SKELETON UI)
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden font-sans">
        {/* Header Image with Scanner Effect */}
        <div className="relative h-48 shrink-0 overflow-hidden">
          <img src={image} alt="Analyzing" className="w-full h-full object-cover opacity-60 blur-[2px]" />
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Scanning Animation Line */}
          <div className="absolute inset-0 overflow-hidden">
             <div className="w-full h-1 bg-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,1)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl font-bold text-white animate-pulse flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.analyzing}
            </h2>
          </div>
        </div>

        {/* Skeleton Content */}
        <div className="flex-1 overflow-hidden p-6 space-y-8">
          {/* Description Skeleton */}
          <div className="space-y-3">
            <SkeletonLine className="h-6 w-3/4 bg-gray-600/50" />
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-5/6" />
          </div>

          {/* Price/Market Skeleton */}
          <div className="space-y-3">
            <SkeletonLine className="h-6 w-1/2 bg-gray-600/50" />
            <SkeletonLine className="h-20 w-full rounded-xl" />
          </div>

          {/* List Skeletons */}
          <div className="space-y-4">
             <div className="flex gap-2 items-center">
                <SkeletonLine className="h-5 w-5 rounded-full" />
                <SkeletonLine className="h-6 w-1/3" />
             </div>
             <div className="space-y-2">
               <SkeletonLine className="h-14 w-full rounded-xl bg-gray-800" />
               <SkeletonLine className="h-14 w-full rounded-xl bg-gray-800" />
               <SkeletonLine className="h-14 w-full rounded-xl bg-gray-800" />
             </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent flex gap-2">
            <div className="flex-1 h-12 bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="flex-1 h-12 bg-gray-800 rounded-xl animate-pulse"></div>
            <div className="flex-1 h-12 bg-gray-800 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // --- REGULAR RESULT VIEW ---

  if (!result) return null;

  // Filter chunks
  const webSources = result.groundingChunks.filter(
    (chunk): chunk is GroundingChunk & { web: { uri: string; title: string } } => 
      !!chunk.web?.uri && !!chunk.web?.title
  );

  const mapSources = result.groundingChunks.filter(
    (chunk): chunk is GroundingChunk & { maps: { uri: string; title: string } } =>
      !!chunk.maps?.uri && !!chunk.maps?.title
  );

  const generateReportContent = () => {
    const date = new Date().toLocaleDateString();
    let content = `${t.reportTitle}\nDate: ${date}\nCountry: ${country}\n\n`;
    content += `${result.text}\n\n`;
    
    if (webSources.length > 0) {
      content += `--- ONLINE ---\n`;
      webSources.forEach(s => content += `- ${s.web.title}: ${s.web.uri}\n`);
    }
    if (mapSources.length > 0) {
      content += `\n--- NEARBY ---\n`;
      mapSources.forEach(s => content += `- ${s.maps.title}: ${s.maps.uri}\n`);
    }
    return content;
  };

  const handleDownload = () => {
    const content = generateReportContent();
    const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PriceScanner-${country}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareText = generateReportContent();
    
    // Convert base64 image to File
    const base64ToFile = (dataurl: string, filename: string) => {
      const arr = dataurl.split(',');
      const match = arr[0].match(/:(.*?);/);
      const mime = match ? match[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    };

    try {
      if (navigator.share) {
        const shareData: ShareData = {
          title: t.reportTitle,
          text: shareText,
        };

        // Try to add image if sharing files is supported
        try {
          const file = base64ToFile(image, 'scanner-result.jpg');
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
             shareData.files = [file];
          }
        } catch (e) {
          console.warn("Could not prepare image for sharing", e);
        }

        await navigator.share(shareData);
      } else {
        alert(t.shareError);
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-hidden font-sans">
      {/* Header Image */}
      <div className="relative h-48 shrink-0">
        <img src={image} alt="Captured product" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <button 
          onClick={onReset}
          className="absolute top-4 left-4 bg-black/60 p-2 rounded-full backdrop-blur-md hover:bg-black/80 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <div className="mb-6 mt-4">
          <FormattedText text={result.text} />
        </div>

        {/* Local Stores (Maps) */}
        {mapSources.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 sticky top-0 bg-gray-900 py-2 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {t.mapsTitle}
            </h3>
            <div className="grid gap-3">
              {mapSources.map((source, idx) => (
                <a 
                  key={`map-${idx}`}
                  href={source.maps.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-3 rounded-xl border-l-4 border-red-500 flex items-center justify-between active:bg-gray-700 transition-colors"
                >
                  <div className="overflow-hidden">
                    <p className="font-semibold text-white truncate">{source.maps.title}</p>
                    <p className="text-xs text-gray-400">Google Maps</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Web Stores */}
        {webSources.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 sticky top-0 bg-gray-900 py-2 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 4a6 6 0 100 12 6 6 0 000-12zm-1 5a1 1 0 011-1h2a1 1 0 110 2h-1v3h1a1 1 0 110 2H9a1 1 0 110-2h1v-3H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {t.webTitle}
            </h3>
            <div className="space-y-3">
              {webSources.map((source, idx) => (
                <a 
                  key={`web-${idx}`}
                  href={source.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-800 p-3 rounded-xl border border-gray-700 active:bg-gray-700 transition-colors"
                >
                  <p className="text-sm text-blue-300 truncate mb-0.5">
                    {new URL(source.web.uri).hostname.replace('www.', '')}
                  </p>
                  <p className="text-white text-sm font-medium truncate">
                    {source.web.title}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent flex gap-2 z-20">
        <button 
          onClick={onReset}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
        >
          {t.scanAgain}
        </button>
        <button 
          onClick={handleShare}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
        >
          {t.share}
        </button>
        <button 
          onClick={handleDownload}
          className="flex-1 bg-gray-700 text-gray-200 py-3 rounded-xl font-bold text-sm border border-gray-600 active:scale-95 transition-transform"
        >
          {t.download}
        </button>
      </div>
    </div>
  );
};
