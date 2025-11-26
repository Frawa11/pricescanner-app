import React, { useState } from 'react';
import { CameraView } from './components/CameraView';
import { ResultCard } from './components/ResultCard';
import { HomeScreen } from './components/HomeScreen';
import { analyzeProductImage } from './services/geminiService';
import { AppStatus, AnalysisResult, CountryCode, UserLocation } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.HOME);
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [country, setCountry] = useState<CountryCode>('PE');
  const [location, setLocation] = useState<UserLocation | undefined>(undefined);

  // Localization helper based on Country Code
  const getUIText = (c: CountryCode) => {
    if (c === 'US') {
      return {
        errorTitle: 'Analysis Error',
        errorDesc: 'Could not connect or identify product.',
        retry: 'Try Again',
        home: 'Exit'
      };
    } else if (c === 'BR') {
      return {
        errorTitle: 'Erro de Análise',
        errorDesc: 'Não foi possível conectar ou identificar o produto.',
        retry: 'Tentar Novamente',
        home: 'Sair'
      };
    }
    return {
      errorTitle: 'Error de Análisis',
      errorDesc: 'No se pudo conectar o identificar el producto.',
      retry: 'Intentar de Nuevo',
      home: 'Salir'
    };
  };

  const ui = getUIText(country);

  const handleStart = () => {
    // Request location immediately upon starting
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setStatus(AppStatus.CAMERA);
        },
        (error) => {
          console.warn("Location access denied or failed", error);
          // Continue anyway, just without location features
          setLocation(undefined);
          setStatus(AppStatus.CAMERA);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setStatus(AppStatus.CAMERA);
    }
  };

  const handleCapture = async (capturedImage: string) => {
    setImageData(capturedImage);
    setStatus(AppStatus.ANALYZING);

    try {
      const analysis = await analyzeProductImage(capturedImage, country, location);
      setResult(analysis);
      setStatus(AppStatus.RESULTS);
    } catch (error) {
      console.error("Error in analysis flow:", error);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setImageData(null);
    setResult(null);
    setStatus(AppStatus.CAMERA);
  };

  const handleGoHome = () => {
    setImageData(null);
    setResult(null);
    setStatus(AppStatus.HOME);
  };

  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden relative font-sans">
      
      {/* View: Home */}
      {status === AppStatus.HOME && (
        <HomeScreen 
          onStart={handleStart} 
          country={country}
          setCountry={setCountry}
        />
      )}

      {/* View: Camera */}
      {status === AppStatus.CAMERA && (
        <CameraView 
          onCapture={handleCapture} 
          onBack={handleGoHome}
          // Map country to rough language for camera UI
          language={country === 'US' ? 'en' : country === 'BR' ? 'pt' : 'es'}
        />
      )}

      {/* View: Analyzing (Using Skeleton Result Card) */}
      {status === AppStatus.ANALYZING && imageData && (
         <ResultCard 
           isLoading={true}
           image={imageData} 
           onReset={handleReset}
           country={country}
         />
      )}

      {/* View: Results */}
      {status === AppStatus.RESULTS && result && imageData && (
        <ResultCard 
          result={result} 
          image={imageData} 
          onReset={handleReset}
          country={country}
        />
      )}

      {/* View: Error */}
      {status === AppStatus.ERROR && (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-900">
           <div className="bg-red-500/20 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
           </div>
           <h2 className="text-xl font-bold text-white mb-2">{ui.errorTitle}</h2>
           <p className="text-gray-400 mb-6">{ui.errorDesc}</p>
           <button 
             onClick={handleReset}
             className="w-full max-w-xs px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200"
           >
             {ui.retry}
           </button>
           <button 
               onClick={handleGoHome}
               className="mt-4 text-gray-400 underline text-sm"
            >
               {ui.home}
            </button>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default App;