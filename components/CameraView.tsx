import React, { useRef, useEffect, useState } from 'react';
import { SupportedLanguage } from '../types';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  language?: SupportedLanguage;
  onBack: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, language = 'es', onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const t = {
    es: { frame: 'Encuadra el producto', error: 'No se pudo acceder a la cámara.', retry: 'Reintentar' },
    en: { frame: 'Frame the product', error: 'Could not access camera.', retry: 'Retry' },
    pt: { frame: 'Enquadre o produto', error: 'Não foi possível acessar a câmera.', retry: 'Tentar novamente' },
    fr: { frame: 'Cadrer le produit', error: 'Impossible d\'accéder à la caméra.', retry: 'Réessayer' }
  }[language];

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        
        currentStream = mediaStream;
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Check for flash capability
        const track = mediaStream.getVideoTracks()[0];
        // Cast to any because getCapabilities is not strictly typed in all environments
        const capabilities = (track as any).getCapabilities ? (track as any).getCapabilities() : {};
        
        if ('torch' in capabilities) {
          setHasFlash(true);
        }

      } catch (err) {
        console.error("Camera access error:", err);
        setError(t.error);
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [t.error]);

  const toggleFlash = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const newMode = !isFlashOn;
    
    try {
      await track.applyConstraints({
        advanced: [{ torch: newMode }] as any
      });
      setIsFlashOn(newMode);
    } catch (err) {
      console.error("Error toggling flash:", err);
    }
  };

  const handleCapture = () => {
    if (isCapturing) return; // Prevent double taps
    
    // 1. Immediate Feedback
    setIsCapturing(true);
    if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback

    // 2. Defer heavy processing slightly to let UI update first
    setTimeout(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // High quality jpeg
          const imageData = canvas.toDataURL('image/jpeg', 0.85);
          
          // Turn off flash after capture to save battery
          if (isFlashOn) {
            toggleFlash();
          }

          onCapture(imageData);
        }
      } else {
        setIsCapturing(false); // Reset if something failed
      }
    }, 50); // Small delay to allow React state to render the loading spinner
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-300">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-blue-600 rounded-full font-semibold"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Hidden Canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
        {/* Large Frame using Box Shadow for Dimmed Background */}
        <div className="relative w-[90vw] h-[70vh] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] border border-white/20">
          
          {/* Active Corners */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-xl shadow-sm transition-all duration-300" style={{ opacity: isCapturing ? 0.5 : 1 }}></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-xl shadow-sm transition-all duration-300" style={{ opacity: isCapturing ? 0.5 : 1 }}></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-xl shadow-sm transition-all duration-300" style={{ opacity: isCapturing ? 0.5 : 1 }}></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-xl shadow-sm transition-all duration-300" style={{ opacity: isCapturing ? 0.5 : 1 }}></div>

          {/* Guide Text */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <p className={`text-white font-medium text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-opacity ${isCapturing ? 'opacity-0' : 'opacity-100'}`}>
              {t.frame}
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      {!isCapturing && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 p-3 rounded-full transition-all z-20 bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm active:scale-95 touch-manipulation"
          aria-label="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      )}

      {/* Flash Toggle Button */}
      {hasFlash && !isCapturing && (
        <button
          onClick={toggleFlash}
          className={`absolute top-6 right-6 p-3 rounded-full transition-all z-20 active:scale-95 touch-manipulation ${isFlashOn ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm'}`}
          aria-label={isFlashOn ? "Desactivar flash" : "Activar flash"}
        >
          {isFlashOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </button>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-12 pt-8 flex justify-center items-center bg-gradient-to-t from-black/90 to-transparent pointer-events-auto z-30">
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className={`relative w-24 h-24 rounded-full border-4 shadow-xl flex items-center justify-center transition-all touch-manipulation ${
            isCapturing 
              ? 'bg-gray-200 border-gray-400 scale-95' 
              : 'bg-white border-gray-300 hover:bg-gray-100 active:scale-90'
          }`}
          aria-label="Tomar foto"
        >
          {isCapturing ? (
             <svg className="animate-spin h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <div className="w-20 h-20 bg-white rounded-full border-2 border-black/10"></div>
          )}
        </button>
      </div>
    </div>
  );
};