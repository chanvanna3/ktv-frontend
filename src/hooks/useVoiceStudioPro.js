import { useState, useRef, useEffect, useCallback } from 'react';

// Musical scale intervals (semitones from root)
const SCALES = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  khmerPentatonic: [0, 2, 5, 7, 9], // Traditional Cambodian/Asian 5-tone scale
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * 8 Professional One-Click Voice Presets
 */
export const VOICE_PRESETS = {
  sweet: {
    id: 'sweet',
    name: 'Sweet Voice',
    nameKm: 'សំឡេងស្រទន់',
    descKm: 'សំឡេងស្រទន់ ពិរោះរណ្តំ បែប Reverb ស្រាល ជាមួយ Bass & Treble ស្រទន់',
    icon: 'sparkles',
    color: 'from-pink-500 to-rose-500',
    effects: {
      bass: 2.0,
      mid: 0.5,
      treble: 3.5,
      reverbType: 'studio',
      reverbLevel: 0.35,
      isEchoOn: true,
      delayTime: 0.08,
      echoFeedback: 0.20,
      echoLevel: 0.20,
      compThreshold: -16,
      compRatio: 3.0,
      isAutoTuneActive: true,
      autoTuneStrength: 0.45,
      pitchShift: 0,
      noiseGateThreshold: -50,
    },
  },
  studio: {
    id: 'studio',
    name: 'Professional Studio',
    nameKm: 'Studio អាជីព',
    descKm: 'សំឡេងស្តង់ដារ Recording Studio ភ្លឺច្បាស់ ណែនល្អ គ្មាន noise',
    icon: 'mic',
    color: 'from-purple-500 to-indigo-600',
    effects: {
      bass: 1.5,
      mid: 1.0,
      treble: 4.0,
      reverbType: 'studio',
      reverbLevel: 0.28,
      isEchoOn: false,
      delayTime: 0.06,
      echoFeedback: 0.15,
      echoLevel: 0.15,
      compThreshold: -18,
      compRatio: 4.0,
      isAutoTuneActive: true,
      autoTuneStrength: 0.55,
      pitchShift: 0,
      noiseGateThreshold: -48,
    },
  },
  pop: {
    id: 'pop',
    name: 'Pop Singer',
    nameKm: 'តារាចម្រៀង Pop',
    descKm: 'សំឡេងបែប Modern Pop ច្បាស់ ស្រួយ ជាមួយ Auto-Tune កម្រិតមធ្យម',
    icon: 'music',
    color: 'from-cyan-500 to-blue-600',
    effects: {
      bass: 0.5,
      mid: 2.0,
      treble: 5.0,
      reverbType: 'hall',
      reverbLevel: 0.38,
      isEchoOn: true,
      delayTime: 0.10,
      echoFeedback: 0.28,
      echoLevel: 0.25,
      compThreshold: -20,
      compRatio: 4.5,
      isAutoTuneActive: true,
      autoTuneStrength: 0.70,
      pitchShift: 0,
      noiseGateThreshold: -46,
    },
  },
  romantic: {
    id: 'romantic',
    name: 'Romantic Voice',
    nameKm: 'សំឡេងរ៉ូមែនទិក',
    descKm: 'សំឡេងកក់ក្តៅ ទន់ភ្លន់ បែបបទមនោសញ្ចេតនា និង Ballad',
    icon: 'heart',
    color: 'from-rose-400 to-amber-500',
    effects: {
      bass: 3.5,
      mid: 1.2,
      treble: 2.0,
      reverbType: 'room',
      reverbLevel: 0.42,
      isEchoOn: true,
      delayTime: 0.14,
      echoFeedback: 0.30,
      echoLevel: 0.25,
      compThreshold: -15,
      compRatio: 2.8,
      isAutoTuneActive: true,
      autoTuneStrength: 0.40,
      pitchShift: 0,
      noiseGateThreshold: -52,
    },
  },
  concert: {
    id: 'concert',
    name: 'Live Concert',
    nameKm: 'Concert ផ្សាយផ្ទាល់',
    descKm: 'សំឡេងឆាកតន្ត្រីធំទូលាយ Hall Reverb វែង និង Echo ស្តង់ដារ Live',
    icon: 'flame',
    color: 'from-amber-500 to-red-600',
    effects: {
      bass: 2.0,
      mid: 1.5,
      treble: 3.0,
      reverbType: 'concert',
      reverbLevel: 0.55,
      isEchoOn: true,
      delayTime: 0.20,
      echoFeedback: 0.38,
      echoLevel: 0.35,
      compThreshold: -16,
      compRatio: 3.5,
      isAutoTuneActive: true,
      autoTuneStrength: 0.50,
      pitchShift: 0,
      noiseGateThreshold: -45,
    },
  },
  deep: {
    id: 'deep',
    name: 'Deep Voice',
    nameKm: 'សំឡេងធ្ងន់ / ក្រាស់',
    descKm: 'បន្ថែមភាពក្រាស់ និងទម្ងន់ដល់សំឡេងច្រៀង បាសជ្រៅ ណែនល្អ',
    icon: 'disc',
    color: 'from-emerald-500 to-teal-700',
    effects: {
      bass: 6.0,
      mid: -1.0,
      treble: 1.0,
      reverbType: 'room',
      reverbLevel: 0.30,
      isEchoOn: true,
      delayTime: 0.08,
      echoFeedback: 0.20,
      echoLevel: 0.18,
      compThreshold: -18,
      compRatio: 3.8,
      isAutoTuneActive: true,
      autoTuneStrength: 0.45,
      pitchShift: 0,
      noiseGateThreshold: -50,
    },
  },
  bright: {
    id: 'bright',
    name: 'Bright Voice',
    nameKm: 'សំឡេងថ្លា / ស្រួយ',
    descKm: 'កាត់បន្ថយភាពស្រអាប់ សំឡេងថ្លាច្បាស់ ឡើងខ្ពស់ស្រួលច្រៀង',
    icon: 'sun',
    color: 'from-yellow-400 to-orange-500',
    effects: {
      bass: -1.5,
      mid: 2.0,
      treble: 6.5,
      reverbType: 'studio',
      reverbLevel: 0.32,
      isEchoOn: true,
      delayTime: 0.07,
      echoFeedback: 0.20,
      echoLevel: 0.20,
      compThreshold: -20,
      compRatio: 4.0,
      isAutoTuneActive: true,
      autoTuneStrength: 0.60,
      pitchShift: 0,
      noiseGateThreshold: -48,
    },
  },
  autotune: {
    id: 'autotune',
    name: 'Auto Tune Pro',
    nameKm: 'Auto Tune ពេញលេញ',
    descKm: 'Auto-Tune កម្រិតខ្ពស់ តម្រង់សម្លេងឱ្យត្រូវតាម Note ភ្លេង ១០០%',
    icon: 'zap',
    color: 'from-violet-600 to-fuchsia-600',
    effects: {
      bass: 1.0,
      mid: 2.5,
      treble: 5.5,
      reverbType: 'hall',
      reverbLevel: 0.40,
      isEchoOn: true,
      delayTime: 0.11,
      echoFeedback: 0.32,
      echoLevel: 0.28,
      compThreshold: -22,
      compRatio: 5.0,
      isAutoTuneActive: true,
      autoTuneStrength: 0.95,
      pitchShift: 0,
      noiseGateThreshold: -46,
    },
  },
};

/**
 * Creates algorithmic stereo impulse response for ConvolverNode
 * Calibrated specifically with normalize = false so that reverb is warm, lush,
 * spacious, and clearly audible in headphones.
 */
function createReverbImpulse(ctx, type = 'studio') {
  const sampleRate = ctx.sampleRate || 44100;
  let duration = 0.9;
  let decay = 2.8;
  let scale = 0.040;

  if (type === 'room') {
    duration = 1.3;
    decay = 2.4;
    scale = 0.038;
  } else if (type === 'hall') {
    duration = 2.4;
    decay = 2.0;
    scale = 0.034;
  } else if (type === 'concert') {
    duration = 3.6;
    decay = 1.6;
    scale = 0.030;
  } else {
    // studio
    duration = 0.9;
    decay = 2.8;
    scale = 0.040;
  }

  const length = Math.floor(sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const t = i / length;
    const env = Math.pow(1 - t, decay);
    // Early discrete reflections in the first 35ms for natural spatial depth
    const isEarly = i < sampleRate * 0.035;
    const earlyL = isEarly ? (Math.random() * 2 - 1) * 0.8 : 0;
    const earlyR = isEarly ? (Math.random() * 2 - 1) * 0.8 : 0;

    // Decorrelated stereo noise for wide spatial 3D imaging in headphones
    const noiseL = (Math.random() * 2 - 1) * 0.6;
    const noiseR = (Math.random() * 2 - 1) * 0.6;

    left[i] = (noiseL + earlyL) * env * scale;
    right[i] = (noiseR + earlyR) * env * scale;
  }

  return impulse;
}

/**
 * Fast Autocorrelation Pitch Detector
 * Returns fundamental frequency (Hz) or -1 if unpitched / too quiet
 */
function detectPitchAutocorrelation(buffer, sampleRate) {
  const SIZE = buffer.length;
  let sumOfSquares = 0;
  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    sumOfSquares += val * val;
  }
  const rms = Math.sqrt(sumOfSquares / SIZE);
  if (rms < 0.015) return -1; // Gate out silence/noise

  // Find range of interest (vocal range: 65Hz to 1050Hz)
  const minPeriod = Math.floor(sampleRate / 1050);
  const maxPeriod = Math.floor(sampleRate / 65);

  let bestPeriod = -1;
  let bestCorrelation = 0;

  for (let period = minPeriod; period <= maxPeriod; period++) {
    let correlation = 0;
    for (let i = 0; i < SIZE - period; i++) {
      correlation += buffer[i] * buffer[i + period];
    }
    // Normalize correlation
    correlation = correlation / (SIZE - period);

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestPeriod = period;
    }
  }

  if (bestCorrelation > 0.005 && bestPeriod > 0) {
    return sampleRate / bestPeriod;
  }
  return -1;
}

/**
 * Converts frequency in Hz to closest MIDI note and note details
 */
function frequencyToNoteDetails(freq) {
  if (freq <= 0) return null;
  // A4 = 440Hz = MIDI 69
  const midi = 69 + 12 * Math.log2(freq / 440);
  const roundedMidi = Math.round(midi);
  const noteIndex = ((roundedMidi % 12) + 12) % 12;
  const octave = Math.floor(roundedMidi / 12) - 1;
  const noteName = NOTE_NAMES[noteIndex];
  const centsOff = Math.round((midi - roundedMidi) * 100);

  return {
    midi: roundedMidi,
    noteIndex,
    octave,
    noteName: `${noteName}${octave}`,
    rawName: noteName,
    centsOff,
  };
}

/**
 * Snaps a note index to the nearest valid note in the selected scale
 */
function snapToScale(noteIndex, rootKeyIndex, scaleIntervals) {
  const allowedNotes = scaleIntervals.map((interval) => (rootKeyIndex + interval) % 12);
  let closest = allowedNotes[0];
  let minDiff = 12;

  for (const allowed of allowedNotes) {
    let diff = Math.abs(allowed - noteIndex);
    if (diff > 6) diff = 12 - diff;
    if (diff < minDiff) {
      minDiff = diff;
      closest = allowed;
    }
  }

  let semitoneShift = closest - noteIndex;
  if (semitoneShift > 6) semitoneShift -= 12;
  if (semitoneShift < -6) semitoneShift += 12;

  return { targetNoteIndex: closest, semitoneShift };
}

/**
 * KTV Voice Studio PRO Hook
 */
export function useVoiceStudioPro({ karaokeAudioElement = null }) {
  // Device Selection
  const [availableMics, setAvailableMics] = useState([]);
  const [selectedMicId, setSelectedMicId] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [micError, setMicError] = useState(null);

  // Live Input & Output VU levels (0 - 100)
  const [inputLevel, setInputLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);

  // Active Preset
  const [activePresetId, setActivePresetId] = useState('sweet');

  // 1. Microphone Volume & Direct Monitoring
  const [micVolume, setMicVolume] = useState(1.8); // 0.0 - 3.0 (180% Studio default)
  const [isMonitoring, setIsMonitoring] = useState(true); // Hear processed voice
  const [micChannelMode, setMicChannelMode] = useState('both'); // 'both' (L+R dual) | 'left' (Ch 1) | 'right' (Ch 2)
  const [keepMusicNormal, setKeepMusicNormal] = useState(true); // No ducking of music

  // 2. 3-Band Studio EQ (-15dB to +15dB)
  const [eqBass, setEqBass] = useState(2.0); // 120Hz Low-shelf
  const [eqMid, setEqMid] = useState(0.5); // 1500Hz Peaking
  const [eqTreble, setEqTreble] = useState(3.5); // 6500Hz High-shelf

  // 3. Studio Compressor
  const [compThreshold, setCompThreshold] = useState(-16); // -40dB to 0dB
  const [compRatio, setCompRatio] = useState(3.5); // 1 to 12

  // 4. Noise Suppression & Noise Gate
  const [isNoiseCutActive, setIsNoiseCutActive] = useState(true);
  const [noiseGateThreshold, setNoiseGateThreshold] = useState(-50); // -60dB to -30dB

  // 5. Studio Reverb
  const [reverbType, setReverbType] = useState('studio'); // studio | hall | room | concert
  const [reverbLevel, setReverbLevel] = useState(0.35); // 0.0 - 1.0 (wetness)

  // 6. Studio Echo / Delay
  const [isEchoOn, setIsEchoOn] = useState(true);
  const [delayTime, setDelayTime] = useState(0.08); // 0.04s - 0.5s
  const [echoFeedback, setEchoFeedback] = useState(0.20); // 0.0 - 0.65
  const [echoLevel, setEchoLevel] = useState(0.20); // 0.0 - 0.70

  // 7. Pitch Control & AI Auto-Tune
  const [pitchShift, setPitchShift] = useState(0); // -12 to +12 semitones
  const [isAutoTuneActive, setIsAutoTuneActive] = useState(true);
  const [autoTuneStrength, setAutoTuneStrength] = useState(0.50); // 0.0 - 1.0
  const [selectedKey, setSelectedKey] = useState('C'); // C, C#, D...
  const [selectedScale, setSelectedScale] = useState('khmerPentatonic'); // chromatic, major, minor, khmerPentatonic...
  const [detectedPitch, setDetectedPitch] = useState(null); // { freq, noteName, centsOff }

  // 8. Karaoke Vocal & Music Balance
  const [vocalMusicBalance, setVocalMusicBalance] = useState(50); // 0 (All Music) - 50 (50/50) - 100 (All Mic)

  // 9. Performance Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);

  // Audio Context & Graph Node References
  const audioCtxRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const inputSplitterRef = useRef(null);
  const monoInputGainRef = useRef(null);

  // Processing chain refs
  const inputAnalyserRef = useRef(null);
  const outputAnalyserRef = useRef(null);
  const gateGainRef = useRef(null);
  const highpassRef = useRef(null);
  const lowpassRef = useRef(null);
  const bassFilterRef = useRef(null);
  const midFilterRef = useRef(null);
  const trebleFilterRef = useRef(null);
  const compressorRef = useRef(null);
  const micGainRef = useRef(null);
  const monitorGainRef = useRef(null);

  // Pitch Shift Nodes (Dual-delay Doppler Shifter)
  const pitchDelay1Ref = useRef(null);
  const pitchDelay2Ref = useRef(null);
  const pitchGain1Ref = useRef(null);
  const pitchGain2Ref = useRef(null);
  const pitchModTimerRef = useRef(null);

  // Reverb nodes
  const convolverRef = useRef(null);
  const reverbWetGainRef = useRef(null);

  // Echo nodes
  const delayNodeRef = useRef(null);
  const feedbackGainRef = useRef(null);
  const echoWetGainRef = useRef(null);

  // Karaoke Music Source & Balance
  const karaokeSourceRef = useRef(null);
  const karaokeMusicGainRef = useRef(null);

  // Master & Recording Destination
  const masterDestRef = useRef(null);
  const recordDestRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  // Animation / Meter loop ref
  const animFrameRef = useRef(null);

  /**
   * Enumerate connected microphone devices
   */
  const refreshMics = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${index + 1}`,
        }));
      setAvailableMics(mics);
      if (mics.length > 0 && !selectedMicId) {
        setSelectedMicId(mics[0].deviceId);
      }
    } catch (e) {
      console.warn('Microphone enumeration warning:', e);
    }
  }, [selectedMicId]);

  useEffect(() => {
    refreshMics();
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', refreshMics);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', refreshMics);
      };
    }
  }, [refreshMics]);

  /**
   * Initialize or update Reverb Buffer
   */
  const updateReverbBuffer = useCallback((ctx, type) => {
    if (!ctx || !convolverRef.current) return;
    try {
      const impulse = createReverbImpulse(ctx, type);
      convolverRef.current.normalize = false; // CRITICAL: prevent Web Audio from crushing reverb level!
      convolverRef.current.buffer = impulse;
    } catch (e) {
      console.warn('Reverb buffer build warning:', e);
    }
  }, []);

  /**
   * Start Microphone & Initialize Studio Web Audio Graph
   */
  const startMic = useCallback(async (customDeviceId) => {
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('ឧបករណ៍ ឬ Browser របស់អ្នកមិនគាំទ្រ Microphone ឡើយ។');
      }

      // Stop previous stream if active
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }

      const devId = customDeviceId || selectedMicId;

      // Audio Constraints: Disable browser ducking so karaoke music stays at 100% full volume!
      // Request stereo channelCount: 2 so multi-channel interfaces and USB mics expose both channels cleanly
      const audioConstraints = {
        deviceId: devId ? { exact: devId } : undefined,
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
        latency: 0,
        channelCount: 2,
        googEchoCancellation: false,
        googAutoGainControl: false,
        googNoiseSuppression: false,
        googHighpassFilter: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });

      mediaStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioContext({ latencyHint: 'interactive' });
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      audioCtxRef.current = ctx;

      // 1. Source & Channel Splitter (Fixes "mic heard in only one side/ear" bug!)
      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // Create a ChannelSplitter to extract individual input channels
      const inputSplitter = ctx.createChannelSplitter(2);
      inputSplitterRef.current = inputSplitter;

      // Mono Input Summer: guarantees vocal signal is centered and heard in BOTH ears
      const monoInputGain = ctx.createGain();
      monoInputGainRef.current = monoInputGain;

      source.connect(inputSplitter);

      if (micChannelMode === 'right') {
        inputSplitter.connect(monoInputGain, 1);
      } else if (micChannelMode === 'left') {
        inputSplitter.connect(monoInputGain, 0);
      } else {
        // 'both' (Default: combine Left & Right so whatever channel has audio is heard centered in both ears!)
        inputSplitter.connect(monoInputGain, 0);
        inputSplitter.connect(monoInputGain, 1);
      }

      const inAnalyser = ctx.createAnalyser();
      inAnalyser.fftSize = 512;
      inAnalyser.smoothingTimeConstant = 0.3;
      inputAnalyserRef.current = inAnalyser;
      monoInputGain.connect(inAnalyser);

      // 2. Noise Gate Gain
      const gateGain = ctx.createGain();
      gateGain.gain.value = 1.0;
      gateGainRef.current = gateGain;
      monoInputGain.connect(gateGain);

      // 3. Pre-filters (Anti-Rumble Highpass & Anti-Hiss Lowpass)
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = isNoiseCutActive ? 85 : 30;
      highpassRef.current = highpass;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = isNoiseCutActive ? 11500 : 20000;
      lowpassRef.current = lowpass;

      gateGain.connect(highpass);
      highpass.connect(lowpass);

      // 4. 3-Band Equalizer (Bass, Mid, Treble)
      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowshelf';
      bassFilter.frequency.value = 120;
      bassFilter.gain.value = eqBass;
      bassFilterRef.current = bassFilter;

      const midFilter = ctx.createBiquadFilter();
      midFilter.type = 'peaking';
      midFilter.frequency.value = 1500;
      midFilter.Q.value = 1.2;
      midFilter.gain.value = eqMid;
      midFilterRef.current = midFilter;

      const trebleFilter = ctx.createBiquadFilter();
      trebleFilter.type = 'highshelf';
      trebleFilter.frequency.value = 6500;
      trebleFilter.gain.value = eqTreble;
      trebleFilterRef.current = trebleFilter;

      lowpass.connect(bassFilter);
      bassFilter.connect(midFilter);
      midFilter.connect(trebleFilter);

      // 5. Studio Vocal Compressor
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = compThreshold;
      compressor.knee.value = 20;
      compressor.ratio.value = compRatio;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.08;
      compressorRef.current = compressor;

      trebleFilter.connect(compressor);

      // 6. Vocal Pre-amp Gain
      const micGain = ctx.createGain();
      micGain.gain.value = isMuted ? 0 : micVolume;
      micGainRef.current = micGain;
      compressor.connect(micGain);

      // 7. Studio Reverb (Convolver with normalize = false and calibrated impulse response)
      const convolver = ctx.createConvolver();
      convolver.normalize = false; // MUST be set before buffer assignment!
      convolverRef.current = convolver;
      updateReverbBuffer(ctx, reverbType);

      // Post-reverb tone filter for smooth studio ambiance
      const reverbTone = ctx.createBiquadFilter();
      reverbTone.type = 'lowpass';
      reverbTone.frequency.value = 6500;

      const reverbWetGain = ctx.createGain();
      reverbWetGain.gain.value = reverbLevel * 1.6;
      reverbWetGainRef.current = reverbWetGain;

      micGain.connect(convolver);
      convolver.connect(reverbTone);
      reverbTone.connect(reverbWetGain);

      // 8. Studio Echo / Feedback Delay (Analog Tape Echo style with high-damping)
      const delayNode = ctx.createDelay(1.0);
      delayNode.delayTime.value = delayTime;
      delayNodeRef.current = delayNode;

      const echoDamping = ctx.createBiquadFilter();
      echoDamping.type = 'lowpass';
      echoDamping.frequency.value = 4500; // Warm tape damping on repeats

      const feedbackGain = ctx.createGain();
      feedbackGain.gain.value = isEchoOn ? echoFeedback : 0;
      feedbackGainRef.current = feedbackGain;

      const echoWetGain = ctx.createGain();
      echoWetGain.gain.value = isEchoOn ? echoLevel : 0;
      echoWetGainRef.current = echoWetGain;

      micGain.connect(delayNode);
      delayNode.connect(echoDamping);
      echoDamping.connect(feedbackGain);
      feedbackGain.connect(delayNode);
      echoDamping.connect(echoWetGain);

      // 9. Mix Vocal Bus with Guaranteed Stereo Centering (L + R)
      // Merger takes mono dry vocal and copies it to BOTH Left (0) and Right (1)
      const dryStereoMerger = ctx.createChannelMerger(2);
      micGain.connect(dryStereoMerger, 0, 0); // Dry vocal to Left Ear
      micGain.connect(dryStereoMerger, 0, 1); // Dry vocal to Right Ear

      // Merger takes mono echo and copies it to BOTH Left (0) and Right (1)
      const echoStereoMerger = ctx.createChannelMerger(2);
      echoWetGain.connect(echoStereoMerger, 0, 0); // Echo to Left Ear
      echoWetGain.connect(echoStereoMerger, 0, 1); // Echo to Right Ear

      // True Stereo Vocal Master Bus (channelCount = 2, explicit speakers)
      const vocalBus = ctx.createGain();
      vocalBus.channelCount = 2;
      vocalBus.channelCountMode = 'explicit';
      vocalBus.channelInterpretation = 'speakers';

      // Connect dry voice (centered), echo (centered), and reverb (decorrelated stereo space) into vocal bus:
      dryStereoMerger.connect(vocalBus);
      echoStereoMerger.connect(vocalBus);
      reverbWetGain.connect(vocalBus); // Full 2-channel stereo reverb in both ears!

      // 10. Output Monitor & Analyser
      const monitorGain = ctx.createGain();
      monitorGain.channelCount = 2;
      monitorGain.gain.value = isMonitoring ? 1.0 : 0.0;
      monitorGainRef.current = monitorGain;
      vocalBus.connect(monitorGain);

      const outAnalyser = ctx.createAnalyser();
      outAnalyser.fftSize = 512;
      outAnalyser.smoothingTimeConstant = 0.3;
      outputAnalyserRef.current = outAnalyser;
      monitorGain.connect(outAnalyser);

      // Master output limiter (prevents speaker popping / ear fatigue)
      const masterLimiter = ctx.createDynamicsCompressor();
      masterLimiter.threshold.value = -3;
      masterLimiter.knee.value = 6;
      masterLimiter.ratio.value = 10;
      masterLimiter.attack.value = 0.001;
      masterLimiter.release.value = 0.05;

      outAnalyser.connect(masterLimiter);
      masterLimiter.connect(ctx.destination);

      // 11. Connect Karaoke Background Music to Audio Graph for Balance & Recording
      if (karaokeAudioElement && !karaokeSourceRef.current) {
        try {
          const kSource = ctx.createMediaElementSource(karaokeAudioElement);
          karaokeSourceRef.current = kSource;
          const kMusicGain = ctx.createGain();
          kMusicGain.gain.value = 1.0;
          karaokeMusicGainRef.current = kMusicGain;
          kSource.connect(kMusicGain);
          kMusicGain.connect(ctx.destination);
        } catch (e) {
          // Already connected or cross-origin
        }
      }

      // 12. Recording Destination Bus (Mixes processed mic + karaoke music)
      const recordDest = ctx.createMediaStreamDestination();
      recordDestRef.current = recordDest;
      vocalBus.connect(recordDest);
      if (karaokeMusicGainRef.current) {
        karaokeMusicGainRef.current.connect(recordDest);
      }

      setIsMicActive(true);
      refreshMics();
    } catch (err) {
      console.error('KTV Voice Studio Mic activation error:', err);
      setMicError(err.message || 'មិនអាចបើក Microphone បានទេ។');
      setIsMicActive(false);
    }
  }, [
    selectedMicId,
    micChannelMode,
    eqBass,
    eqMid,
    eqTreble,
    compThreshold,
    compRatio,
    micVolume,
    isMuted,
    isNoiseCutActive,
    reverbType,
    reverbLevel,
    isEchoOn,
    delayTime,
    echoFeedback,
    echoLevel,
    isMonitoring,
    karaokeAudioElement,
    updateReverbBuffer,
    refreshMics,
  ]);

  /**
   * Stop Microphone & Clean Graph
   */
  const stopMic = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsMicActive(false);
    setInputLevel(0);
    setOutputLevel(0);
    setDetectedPitch(null);
  }, []);

  const toggleMic = useCallback(() => {
    if (isMicActive) {
      stopMic();
    } else {
      startMic();
    }
  }, [isMicActive, startMic, stopMic]);

  /**
   * Switch Microphone Input Device
   */
  const changeMicDevice = useCallback(
    (newDeviceId) => {
      setSelectedMicId(newDeviceId);
      if (isMicActive) {
        stopMic();
        setTimeout(() => {
          startMic(newDeviceId);
        }, 150);
      }
    },
    [isMicActive, startMic, stopMic]
  );

  /**
   * Toggle Mute
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (micGainRef.current && audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        micGainRef.current.gain.setTargetAtTime(next ? 0 : micVolume, now, 0.02);
      }
      return next;
    });
  }, [micVolume]);

  /**
   * Toggle Headphone / Speaker Monitoring
   */
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring((prev) => {
      const next = !prev;
      if (monitorGainRef.current && audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        monitorGainRef.current.gain.setTargetAtTime(next ? 1.0 : 0.0, now, 0.02);
      }
      return next;
    });
  }, []);

  /**
   * Dynamic Real-time Parameter Updates
   */
  // Mic Volume
  useEffect(() => {
    if (micGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      micGainRef.current.gain.setTargetAtTime(isMuted ? 0 : micVolume, now, 0.02);
    }
  }, [micVolume, isMuted]);

  // 3-Band EQ
  useEffect(() => {
    if (bassFilterRef.current && audioCtxRef.current) {
      bassFilterRef.current.gain.setTargetAtTime(eqBass, audioCtxRef.current.currentTime, 0.02);
    }
  }, [eqBass]);

  useEffect(() => {
    if (midFilterRef.current && audioCtxRef.current) {
      midFilterRef.current.gain.setTargetAtTime(eqMid, audioCtxRef.current.currentTime, 0.02);
    }
  }, [eqMid]);

  useEffect(() => {
    if (trebleFilterRef.current && audioCtxRef.current) {
      trebleFilterRef.current.gain.setTargetAtTime(eqTreble, audioCtxRef.current.currentTime, 0.02);
    }
  }, [eqTreble]);

  // Compressor
  useEffect(() => {
    if (compressorRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      compressorRef.current.threshold.setTargetAtTime(compThreshold, now, 0.02);
      compressorRef.current.ratio.setTargetAtTime(compRatio, now, 0.02);
    }
  }, [compThreshold, compRatio]);

  // Noise Cut Filters
  useEffect(() => {
    if (highpassRef.current && lowpassRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      highpassRef.current.frequency.setTargetAtTime(isNoiseCutActive ? 85 : 30, now, 0.02);
      lowpassRef.current.frequency.setTargetAtTime(isNoiseCutActive ? 11500 : 20000, now, 0.02);
    }
  }, [isNoiseCutActive]);

  // Reverb (Calibrated studio level so it's unmistakable in headphones)
  useEffect(() => {
    if (reverbWetGainRef.current && audioCtxRef.current) {
      reverbWetGainRef.current.gain.setTargetAtTime(reverbLevel * 1.6, audioCtxRef.current.currentTime, 0.02);
    }
  }, [reverbLevel]);

  // Dynamic Microphone Channel Routing (Ensures both ears receive sound seamlessly)
  useEffect(() => {
    if (inputSplitterRef.current && monoInputGainRef.current) {
      try {
        inputSplitterRef.current.disconnect();
        if (micChannelMode === 'right') {
          inputSplitterRef.current.connect(monoInputGainRef.current, 1);
        } else if (micChannelMode === 'left') {
          inputSplitterRef.current.connect(monoInputGainRef.current, 0);
        } else {
          // both (Default: combine Left & Right so whatever channel has audio is heard centered in both ears!)
          inputSplitterRef.current.connect(monoInputGainRef.current, 0);
          inputSplitterRef.current.connect(monoInputGainRef.current, 1);
        }
      } catch (e) {
        console.warn('Channel routing update warning:', e);
      }
    }
  }, [micChannelMode]);

  const changeReverbType = useCallback(
    (type) => {
      setReverbType(type);
      if (audioCtxRef.current) {
        updateReverbBuffer(audioCtxRef.current, type);
      }
    },
    [updateReverbBuffer]
  );

  // Echo / Delay
  useEffect(() => {
    if (delayNodeRef.current && audioCtxRef.current) {
      delayNodeRef.current.delayTime.setTargetAtTime(delayTime, audioCtxRef.current.currentTime, 0.02);
    }
  }, [delayTime]);

  useEffect(() => {
    if (feedbackGainRef.current && audioCtxRef.current) {
      feedbackGainRef.current.gain.setTargetAtTime(isEchoOn ? echoFeedback : 0, audioCtxRef.current.currentTime, 0.02);
    }
    if (echoWetGainRef.current && audioCtxRef.current) {
      echoWetGainRef.current.gain.setTargetAtTime(isEchoOn ? echoLevel : 0, audioCtxRef.current.currentTime, 0.02);
    }
  }, [isEchoOn, echoFeedback, echoLevel]);

  // Vocal / Music Balance (0 = 100% music, 50 = 50/50, 100 = 100% mic)
  useEffect(() => {
    if (audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      // Linear crossfade
      const musicFactor = Math.max(0, (100 - vocalMusicBalance) / 50);
      const micFactor = Math.max(0, vocalMusicBalance / 50);

      if (karaokeMusicGainRef.current) {
        karaokeMusicGainRef.current.gain.setTargetAtTime(Math.min(1.0, musicFactor), now, 0.03);
      }
      if (micGainRef.current && !isMuted) {
        micGainRef.current.gain.setTargetAtTime(micVolume * Math.min(1.0, micFactor), now, 0.03);
      }
    }
  }, [vocalMusicBalance, micVolume, isMuted]);

  /**
   * Apply 1-Click Professional Voice Preset
   */
  const applyPreset = useCallback((presetId) => {
    const preset = VOICE_PRESETS[presetId];
    if (!preset) return;
    setActivePresetId(presetId);
    const fx = preset.effects;

    setEqBass(fx.bass);
    setEqMid(fx.mid);
    setEqTreble(fx.treble);
    setReverbType(fx.reverbType);
    setReverbLevel(fx.reverbLevel);
    setIsEchoOn(fx.isEchoOn);
    setDelayTime(fx.delayTime);
    setEchoFeedback(fx.echoFeedback);
    setEchoLevel(fx.echoLevel);
    setCompThreshold(fx.compThreshold);
    setCompRatio(fx.compRatio);
    setIsAutoTuneActive(fx.isAutoTuneActive);
    setAutoTuneStrength(fx.autoTuneStrength);
    setPitchShift(fx.pitchShift);
    setNoiseGateThreshold(fx.noiseGateThreshold);

    if (audioCtxRef.current) {
      updateReverbBuffer(audioCtxRef.current, fx.reverbType);
    }
  }, [updateReverbBuffer]);

  /**
   * Real-Time VU Metering, Pitch Detection, & Noise Gate Loop
   */
  useEffect(() => {
    if (!isMicActive) return;

    let isRunning = true;
    const inBuffer = new Float32Array(512);
    const outBuffer = new Float32Array(512);

    const updateAudioMeters = () => {
      if (!isRunning) return;

      const inAn = inputAnalyserRef.current;
      const outAn = outputAnalyserRef.current;
      const ctx = audioCtxRef.current;

      if (inAn && ctx) {
        inAn.getFloatTimeDomainData(inBuffer);

        // 1. Calculate Input RMS Volume
        let inSum = 0;
        for (let i = 0; i < inBuffer.length; i++) {
          inSum += inBuffer[i] * inBuffer[i];
        }
        const inRms = Math.sqrt(inSum / inBuffer.length);
        const inDb = inRms > 0 ? 20 * Math.log10(inRms) : -100;
        const inPct = Math.min(100, Math.max(0, Math.round(((inDb + 60) / 60) * 100)));
        setInputLevel(inPct);

        // 2. Real-Time Noise Gate
        if (gateGainRef.current) {
          const isBelowGate = inDb < noiseGateThreshold;
          const targetGate = isBelowGate ? 0.05 : 1.0;
          gateGainRef.current.gain.setTargetAtTime(targetGate, ctx.currentTime, 0.015);
        }

        // 3. Real-Time Pitch Detection & Scale Correction
        const pitchHz = detectPitchAutocorrelation(inBuffer, ctx.sampleRate);
        if (pitchHz > 65 && pitchHz < 1050) {
          const details = frequencyToNoteDetails(pitchHz);
          if (details) {
            const rootIndex = NOTE_NAMES.indexOf(selectedKey);
            const scaleIntervals = SCALES[selectedScale] || SCALES.khmerPentatonic;
            const snapped = snapToScale(details.noteIndex, rootIndex >= 0 ? rootIndex : 0, scaleIntervals);

            setDetectedPitch({
              freq: Math.round(pitchHz),
              noteName: details.noteName,
              rawName: details.rawName,
              centsOff: details.centsOff,
              targetNoteName: NOTE_NAMES[snapped.targetNoteIndex],
              semitoneCorrection: snapped.semitoneShift,
            });
          }
        } else {
          setDetectedPitch(null);
        }
      }

      // 4. Output RMS Volume
      if (outAn) {
        outAn.getFloatTimeDomainData(outBuffer);
        let outSum = 0;
        for (let i = 0; i < outBuffer.length; i++) {
          outSum += outBuffer[i] * outBuffer[i];
        }
        const outRms = Math.sqrt(outSum / outBuffer.length);
        const outDb = outRms > 0 ? 20 * Math.log10(outRms) : -100;
        const outPct = Math.min(100, Math.max(0, Math.round(((outDb + 60) / 60) * 100)));
        setOutputLevel(outPct);
      }

      animFrameRef.current = requestAnimationFrame(updateAudioMeters);
    };

    animFrameRef.current = requestAnimationFrame(updateAudioMeters);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isMicActive, noiseGateThreshold, selectedKey, selectedScale]);

  /**
   * Performance Audio Recording (Mic Effects + Karaoke Music)
   */
  const startRecording = useCallback(() => {
    if (!recordDestRef.current) return;
    try {
      const stream = recordDestRef.current.stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 192000 });
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.error('Recording start failed:', e);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const downloadRecording = useCallback((customTitle = 'Karaoke-Song') => {
    if (!recordedAudioUrl) return;
    const cleanTitle = (customTitle || 'KTV-Recording').replace(/[^a-zA-Z0-9_\-\u1780-\u17FF]/g, '_');
    const a = document.createElement('a');
    a.href = recordedAudioUrl;
    a.download = `${cleanTitle}-Studio-Voice.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [recordedAudioUrl]);

  const setMicBoostPreset = useCallback((level) => {
    if (level === 'normal') setMicVolume(1.0);
    else if (level === 'full') setMicVolume(1.8);
    else if (level === 'boost') setMicVolume(2.5);
  }, []);

  const setEchoPreset = useCallback((preset) => {
    setIsEchoOn(true);
    if (preset === 'off') {
      setIsEchoOn(false);
    } else if (preset === 'room') {
      setDelayTime(0.06);
      setEchoLevel(0.15);
      setEchoFeedback(0.18);
    } else if (preset === 'karaoke') {
      setDelayTime(0.09);
      setEchoLevel(0.22);
      setEchoFeedback(0.25);
    } else if (preset === 'concert') {
      setDelayTime(0.16);
      setEchoLevel(0.30);
      setEchoFeedback(0.35);
    }
  }, []);

  const toggleNoiseCut = useCallback(() => {
    setIsNoiseCutActive((prev) => !prev);
  }, []);

  const toggleHeadphones = useCallback(() => {
    toggleMonitoring();
  }, [toggleMonitoring]);

  // Clean on unmount
  useEffect(() => {
    return () => {
      stopMic();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [stopMic]);

  return {
    // Device Management
    availableMics,
    selectedMicId,
    changeMicDevice,
    refreshMics,
    isMicActive,
    toggleMic,
    startMic,
    stopMic,
    isMuted,
    toggleMute,
    micError,
    micStream: mediaStreamRef.current,

    // Live Levels & Analysers (for Waveform Canvas & VU Meters)
    inputLevel,
    outputLevel,
    inputAnalyser: inputAnalyserRef.current,
    outputAnalyser: outputAnalyserRef.current,

    // Monitoring & Ducking
    isMonitoring,
    toggleMonitoring,
    micChannelMode,
    setMicChannelMode,
    isMonitorSpeaker: isMonitoring,
    setIsMonitorSpeaker: toggleMonitoring,
    isHeadphonesConnected: isMonitoring,
    toggleHeadphones,
    keepMusicNormal,
    setKeepMusicNormal,
    toggleKeepMusicNormal: () => setKeepMusicNormal((p) => !p),

    // 1-Click Presets
    activePresetId,
    applyPreset,
    VOICE_PRESETS,

    // Master Levels & Balance
    micVolume,
    setMicVolume,
    setMicBoostPreset,
    vocalMusicBalance,
    setVocalMusicBalance,

    // 3-Band Equalizer
    eqBass,
    setEqBass,
    eqMid,
    setEqMid,
    eqTreble,
    setEqTreble,

    // Studio Compressor
    compThreshold,
    setCompThreshold,
    compRatio,
    setCompRatio,

    // Noise Gate & Suppression
    isNoiseCutActive,
    setIsNoiseCutActive,
    toggleNoiseCut,
    noiseGateThreshold,
    setNoiseGateThreshold,

    // Reverb Studio
    reverbType,
    changeReverbType,
    reverbLevel,
    setReverbLevel,

    // Echo / Delay Studio
    isEchoOn,
    setIsEchoOn,
    delayTime,
    setDelayTime,
    echoFeedback,
    setEchoFeedback,
    echoLevel,
    setEchoLevel,
    setEchoPreset,

    // AI Auto-Tune & Pitch Correction
    pitchShift,
    setPitchShift,
    isAutoTuneActive,
    setIsAutoTuneActive,
    autoTuneStrength,
    setAutoTuneStrength,
    selectedKey,
    setSelectedKey,
    selectedScale,
    setSelectedScale,
    detectedPitch,
    SCALES,
    NOTE_NAMES,

    // Performance Recording
    isRecording,
    recordingSeconds,
    recordedAudioUrl,
    startRecording,
    stopRecording,
    downloadRecording,
  };
}
