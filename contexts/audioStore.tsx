import { create } from 'zustand';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { AudioFile } from '../types';

interface AudioState {
  // Audio State
  currentSound: Audio.Sound | null;
  isPlaying: boolean;
  currentAudio: AudioFile | null;
  currentSectionId: string | null;
  currentAudioIndex: number;
  position: number;
  duration: number;
  loading: boolean;
  error: string | null;

  // Seek State
  isSeeking: boolean;
  seekPosition: number;

  // Track handlers
  nextTrackHandler: (() => Promise<void>) | null;
  previousTrackHandler: (() => Promise<void>) | null;

  // Actions
  setCurrentSound: (sound: Audio.Sound | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentAudio: (audio: AudioFile | null) => void;
  setCurrentSectionId: (sectionId: string | null) => void;
  setCurrentAudioIndex: (index: number) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsSeeking: (seeking: boolean) => void;
  setSeekPosition: (position: number) => void;
  setNextTrackHandler: (handler: (() => Promise<void>) | null) => void;
  setPreviousTrackHandler: (handler: (() => Promise<void>) | null) => void;

  // Audio Controls
  playSound: (
    audio: AudioFile,
    sectionId: string,
    index: number
  ) => Promise<void>;
  pauseSound: () => Promise<void>;
  resumeSound: () => Promise<void>;
  stopSound: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;

  // Utility
  reset: () => void;
  updateProgress: () => Promise<void>;
}

// Initialize audio mode once
let audioInitialized = false;

const initializeAudio = async () => {
  if (audioInitialized) return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });
    audioInitialized = true;
  } catch (error) {
    console.error('Error setting up audio mode:', error);
  }
};

export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial State
  currentSound: null,
  isPlaying: false,
  currentAudio: null,
  currentSectionId: null,
  currentAudioIndex: 0,
  position: 0,
  duration: 0,
  loading: false,
  error: null,
  isSeeking: false,
  seekPosition: 0,
  nextTrackHandler: null,
  previousTrackHandler: null,

  // Setters
  setCurrentSound: (sound) => set({ currentSound: sound }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentAudio: (audio) => set({ currentAudio: audio }),
  setCurrentSectionId: (sectionId) => set({ currentSectionId: sectionId }),
  setCurrentAudioIndex: (index) => set({ currentAudioIndex: index }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setIsSeeking: (seeking) => set({ isSeeking: seeking }),
  setSeekPosition: (position) => set({ seekPosition: position }),
  setNextTrackHandler: (handler) => set({ nextTrackHandler: handler }),
  setPreviousTrackHandler: (handler) => set({ previousTrackHandler: handler }),

  // Audio Controls
  playSound: async (audio: AudioFile, sectionId: string, index: number) => {
    const state = get();

    try {
      if (!audio || !audio.url) {
        throw new Error('Valid audio file is required');
      }

      if (!sectionId) {
        throw new Error('Section ID is required');
      }

      await initializeAudio();

      set({ loading: true, error: null });

      console.log(
        'Playing audio:',
        audio.title,
        'from section:',
        sectionId,
        'index:',
        index
      );

      // Stop current sound if exists
      if (state.currentSound) {
        try {
          await state.currentSound.unloadAsync();
        } catch (err) {
          console.warn('Error unloading previous sound:', err);
        }
      }

      // Create playback status update handler
      const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
          const currentState = get();

          // Update position and duration
          const newPosition = status.positionMillis / 1000;
          const newDuration = status.durationMillis
            ? status.durationMillis / 1000
            : 0;

          set({
            position: newPosition,
            duration: newDuration,
            isPlaying: status.isPlaying,
          });

          // Handle track completion
          if (status.didJustFinish && !status.isLooping) {
            console.log('Track finished, playing next...');
            currentState.playNext();
          }

          // Handle loading state
          if (status.isBuffering !== undefined) {
            set({ loading: status.isBuffering });
          }
        } else if (status.error) {
          console.error('Playback error:', status.error);
          set({ error: 'Playback error occurred', loading: false });
        }
      };

      // Create and play new sound
      console.log('Creating sound from URL:', audio.url);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audio.url },
        { shouldPlay: true, progressUpdateIntervalMillis: 500 },
        onPlaybackStatusUpdate
      );

      set({
        currentSound: newSound,
        currentAudio: audio,
        currentSectionId: sectionId,
        currentAudioIndex: index,
        isPlaying: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error playing sound:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to play audio',
        loading: false,
      });
    }
  },

  pauseSound: async () => {
    const { currentSound } = get();
    try {
      if (currentSound) {
        await currentSound.pauseAsync();
        set({ isPlaying: false });
      }
    } catch (error) {
      console.error('Error pausing sound:', error);
      set({ error: 'Failed to pause audio' });
    }
  },

  resumeSound: async () => {
    const { currentSound } = get();
    try {
      if (currentSound) {
        await currentSound.playAsync();
        set({ isPlaying: true });
      }
    } catch (error) {
      console.error('Error resuming sound:', error);
      set({ error: 'Failed to resume audio' });
    }
  },

  stopSound: async () => {
    const { currentSound } = get();
    try {
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }

      set({
        currentSound: null,
        currentAudio: null,
        currentSectionId: null,
        currentAudioIndex: 0,
        isPlaying: false,
        position: 0,
        duration: 0,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error stopping sound:', error);
      set({ error: 'Failed to stop audio' });
    }
  },

  seekTo: async (position: number) => {
    const { currentSound, duration } = get();
    try {
      if (currentSound && duration > 0) {
        const clampedPosition = Math.max(0, Math.min(position, duration));
        const positionMillis = clampedPosition * 1000;

        await currentSound.setPositionAsync(positionMillis);
        set({ position: clampedPosition });
      }
    } catch (error) {
      console.error('Error seeking to position:', error);
      set({ error: 'Failed to seek audio' });
    }
  },

  playNext: async () => {
    const { nextTrackHandler } = get();
    try {
      if (nextTrackHandler) {
        await nextTrackHandler();
      }
    } catch (error) {
      console.error('Error playing next track:', error);
      set({ error: 'Failed to play next track' });
    }
  },

  playPrevious: async () => {
    const { previousTrackHandler } = get();
    try {
      if (previousTrackHandler) {
        await previousTrackHandler();
      }
    } catch (error) {
      console.error('Error playing previous track:', error);
      set({ error: 'Failed to play previous track' });
    }
  },

  updateProgress: async () => {
    const { currentSound, isPlaying } = get();
    if (currentSound && isPlaying) {
      try {
        const status = await currentSound.getStatusAsync();
        if (status.isLoaded) {
          set({ position: status.positionMillis / 1000 });
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  },

  reset: () => {
    const { currentSound } = get();
    if (currentSound) {
      currentSound.unloadAsync().catch(console.error);
    }

    set({
      currentSound: null,
      isPlaying: false,
      currentAudio: null,
      currentSectionId: null,
      currentAudioIndex: 0,
      position: 0,
      duration: 0,
      loading: false,
      error: null,
      isSeeking: false,
      seekPosition: 0,
      nextTrackHandler: null,
      previousTrackHandler: null,
    });
  },
}));
