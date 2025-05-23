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
  seekTo: (position: number) => Promise<void>;
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
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Error setting up audio mode:', error);
      }
    };
    setupAudio();

    // Cleanup on unmount
    return () => {
      if (currentSound) {
        currentSound.unloadAsync().catch((err) => {
          console.error('Error unloading sound on cleanup:', err);
        });
      }
    };
  }, []);

  // Update position periodically when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && currentSound) {
      interval = setInterval(async () => {
        try {
          const status = await currentSound.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis / 1000);
          }
        } catch (error) {
          console.error('Error getting sound status:', error);
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
      // Validate parameters
      if (!audio || !audio.url) {
        throw new Error('Valid audio file is required');
      }

      if (!sectionId) {
        throw new Error('Section ID is required');
      }

      setLoading(true);
      console.log(
        'Playing audio:',
        audio.title,
        'from section:',
        sectionId,
        'index:',
        index
      );

      // Stop any currently playing sound
      if (currentSound) {
        await currentSound.unloadAsync();
      }

      console.log('Creating sound from URL:', audio.url);
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
    } catch (error) {
      console.error('Error playing sound:', error);
    } finally {
      setLoading(false);
    }
  };

  const pauseSound = async () => {
    try {
      if (currentSound) {
        await currentSound.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  };

  const resumeSound = async () => {
    try {
      if (currentSound) {
        await currentSound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error resuming sound:', error);
    }
  };

  const stopSound = async () => {
    try {
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setCurrentAudio(null);
        setCurrentSectionId(null);
        setCurrentAudioIndex(0);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  const playNext = async () => {
    try {
      if (nextTrackRef.current) {
        await nextTrackRef.current();
      }
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  };

  const playPrevious = async () => {
    try {
      if (previousTrackRef.current) {
        await previousTrackRef.current();
      }
    } catch (error) {
      console.error('Error playing previous track:', error);
    }
  };

  const seekTo = async (position: number) => {
    try {
      if (currentSound) {
        const positionMillis = position * 1000; // Convert seconds to milliseconds
        await currentSound.setPositionAsync(positionMillis);
        setPosition(position);
      }
    } catch (error) {
      console.error('Error seeking to position:', error);
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
    seekTo,
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
