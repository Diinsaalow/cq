import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  MutableRefObject,
} from 'react';
import { Audio } from 'expo-av';
import { AudioFile } from '../types';

type TrackHandlerFunction = () => Promise<void>;

interface AudioContextType {
  currentSound: Audio.Sound | null;
  isPlaying: boolean;
  currentAudio: AudioFile | null;
  currentSectionId: string | null;
  currentAudioIndex: number;
  playSound: (
    audio: AudioFile,
    sectionId: string,
    index: number
  ) => Promise<void>;
  pauseSound: () => Promise<void>;
  resumeSound: () => Promise<void>;
  stopSound: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  position: number;
  duration: number;
  loading: boolean;
  nextTrackRef: MutableRefObject<TrackHandlerFunction>;
  previousTrackRef: MutableRefObject<TrackHandlerFunction>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<AudioFile | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  // Create refs for the next and previous track handlers
  const nextTrackRef = useRef<TrackHandlerFunction>(async () => {
    console.log('Default next track handler');
  });

  const previousTrackRef = useRef<TrackHandlerFunction>(async () => {
    console.log('Default previous track handler');
  });

  // Initialize audio mode
  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    };
    setupAudio();

    // Cleanup on unmount
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, []);

  // Update position periodically when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(async () => {
        if (currentSound) {
          const status = await currentSound.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis / 1000);
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSound]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setIsPlaying(status.isPlaying);

      // When audio finishes playing
      if (status.didJustFinish && !status.isLooping) {
        playNext();
      }
    }
  };

  const playSound = async (
    audio: AudioFile,
    sectionId: string,
    index: number
  ) => {
    try {
      setLoading(true);

      // Stop any currently playing sound
      if (currentSound) {
        await currentSound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audio.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setCurrentSound(newSound);
      setCurrentAudio(audio);
      setCurrentSectionId(sectionId);
      setCurrentAudioIndex(index);
      setIsPlaying(true);
      setLoading(false);
    } catch (error) {
      console.error('Error playing sound:', error);
      setLoading(false);
    }
  };

  const pauseSound = async () => {
    if (currentSound) {
      await currentSound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeSound = async () => {
    if (currentSound) {
      await currentSound.playAsync();
      setIsPlaying(true);
    }
  };

  const stopSound = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      setCurrentSound(null);
      setCurrentAudio(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
    }
  };

  const playNext = async () => {
    if (nextTrackRef.current) {
      await nextTrackRef.current();
    }
  };

  const playPrevious = async () => {
    if (previousTrackRef.current) {
      await previousTrackRef.current();
    }
  };

  const value: AudioContextType = {
    currentSound,
    isPlaying,
    currentAudio,
    currentSectionId,
    currentAudioIndex,
    playSound,
    pauseSound,
    resumeSound,
    stopSound,
    playNext,
    playPrevious,
    position,
    duration,
    loading,
    nextTrackRef,
    previousTrackRef,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export default AudioContext;
