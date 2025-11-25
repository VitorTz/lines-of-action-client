import { useRef, useState, useEffect, useCallback } from 'react';

const SOUND_PATHS = {
  move: '/songs/move-self.mp3',
  capture: '/songs/capture.mp3',
  start: '/songs/game-start.mp3'
};

export const useGameSounds = (initialEnabled: boolean = true) => {
  const [soundEnabled, setSoundEnabled] = useState(initialEnabled);
    
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffers = useRef<{ [key: string]: AudioBuffer }>({});
  
  useEffect(() => {
    const initAudio = async () => {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      
      const ctx = new Ctx();
      audioContextRef.current = ctx;
      
      const loadBuffer = async (url: string): Promise<AudioBuffer> => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await ctx.decodeAudioData(arrayBuffer);
      };
      
      try {
        const [moveBuffer, captureBuffer, startBuffer] = await Promise.all([
          loadBuffer(SOUND_PATHS.move),
          loadBuffer(SOUND_PATHS.capture),
          loadBuffer(SOUND_PATHS.start)
        ]);

        audioBuffers.current['move'] = moveBuffer;
        audioBuffers.current['capture'] = captureBuffer;
        audioBuffers.current['game-start'] = startBuffer;
      } catch (error) {
        console.error("Erro ao carregar sons:", error);
      }
    };

    initAudio();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);
  
  const resumeContext = async () => {
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  };

  const playBuffer = useCallback(async (key: string) => {
    if (!soundEnabled || !audioContextRef.current || !audioBuffers.current[key]) return;

    try {
      const ctx = audioContextRef.current;      
      await resumeContext();      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffers.current[key];      
      source.connect(ctx.destination);
      source.start(0);
    } catch (error) {
      console.warn(`Erro ao tocar som ${key}:`, error);
    }
  }, [soundEnabled]);

  // Toca sons sintetizados (Vitória/Derrota)
  const playTone = useCallback(async (frequency: number, type: OscillatorType = "sine") => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    await resumeContext(); // Acorda o contexto aqui também

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }, [soundEnabled]);

  const playMove = useCallback(() => playBuffer('move'), [playBuffer]);
  const playCapture = useCallback(() => playBuffer('capture'), [playBuffer]);
  const playStart = useCallback(() => playBuffer('game-start'), [playBuffer]);
  const playWin = useCallback(() => {
    playTone(523.25); 
    setTimeout(() => playTone(659.25), 200); 
    setTimeout(() => playTone(783.99), 400); 
  }, [playTone]);

  return {
    soundEnabled,
    toggleSound: () => setSoundEnabled(p => !p),
    playMove,
    playCapture,
    playWin,
    playStart
  };
};