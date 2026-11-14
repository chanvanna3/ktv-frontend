import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook for live microphone capture with acoustic feedback protection,
 * automatic headphone/earphone detection, simultaneous music+voice monitoring,
 * Studio Pre-amp Boost (full rich vocals), Vocal Presence EQ, and Studio Echo/Delay.
 */
export function useLiveMicrophone() {
  const [isMicActive, setIsMicActive] = useState(false);
  // Default to 1.8x (180% Studio Boost) so smartphone mic is loud, full, and clear over backing music!
  const [micVolume, setMicVolume] = useState(1.8); // 0.0 - 3.0
  const [isEchoOn, setIsEchoOn] = useState(true);   // Default ON for karaoke booth feel
  const [echoLevel, setEchoLevel] = useState(0.25); // Safe gentle feedback (0.0 - 0.50)
  const [delayTime, setDelayTime] = useState(0.20); // 0.05 - 0.60s (Delay in seconds)
  const [isMonitorSpeaker, setIsMonitorSpeaker] = useState(false); // Hear yourself through headphones
  const [isHeadphonesConnected, setIsHeadphonesConnected] = useState(false);
  const [micError, setMicError] = useState(null);

  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const highpassNodeRef = useRef(null);
  const presenceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const delayNodeRef = useRef(null);
  const feedbackNodeRef = useRef(null);
  const limiterNodeRef = useRef(null);
  const monitorGainNodeRef = useRef(null);
  const isMonitorSpeakerRef = useRef(isMonitorSpeaker);

  // Keep ref in sync
  useEffect(() => {
    isMonitorSpeakerRef.current = isMonitorSpeaker;
  }, [isMonitorSpeaker]);

  // Check if headphones or external headset are detected
  const detectHeadphones = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return false;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasHeadphones = devices.some((device) => {
        const label = (device.label || '').toLowerCase();
        return (
          label.includes('headphone') ||
          label.includes('headset') ||
          label.includes('earphone') ||
          label.includes('airpod') ||
          label.includes('buds') ||
          label.includes('bluetooth') ||
          label.includes('wireless') ||
          label.includes('hands-free')
        );
      });
      return hasHeadphones;
    } catch (e) {
      return false;
    }
  }, []);

  // Listen to device changes (headphones plugged in / unplugged)
  useEffect(() => {
    let isMounted = true;
    const handleDeviceChange = async () => {
      const detected = await detectHeadphones();
      if (!isMounted) return;
      if (detected) {
        setIsHeadphonesConnected(true);
        setIsMonitorSpeaker(true);
      }
    };

    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      handleDeviceChange();
      return () => {
        isMounted = false;
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, [detectHeadphones]);

  const startMic = useCallback(async (forcedMonitor) => {
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('ឧបករណ៍ ឬ Browser របស់អ្នកមិនគាំទ្រ Microphone ឡើយ។');
      }

      // FOR SINGING: echoCancellation keeps hardware processing when available,
      // but noiseSuppression: false & autoGainControl: false prevent the mobile OS
      // from squashing/muting sustained singing notes and vibrato!
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      mediaStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // 1. High-pass Filter (85Hz): eliminates handling rumble and wind pops
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 85;
      highpassNodeRef.current = highpass;

      // 2. Vocal Presence EQ (3200Hz, +3.5dB boost): gives crisp, bright, professional vocal clarity
      const presence = ctx.createBiquadFilter();
      presence.type = 'peaking';
      presence.frequency.value = 3200;
      presence.gain.value = 3.5;
      presence.Q.value = 1.1;
      presenceNodeRef.current = presence;

      // 3. Master Mic Pre-amp Gain
      const gain = ctx.createGain();
      gain.gain.value = micVolume; // 1.8x default boost for full voice
      gainNodeRef.current = gain;

      // 4. Vocal Studio Dynamics Compressor: smooths dynamics without choking or squashing loudness
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -6; // Gentle ceiling (was -16 which smothered volume)
      limiter.knee.value = 24;
      limiter.ratio.value = 4.0;    // Musical 4:1 compression
      limiter.attack.value = 0.005;
      limiter.release.value = 0.15;
      limiterNodeRef.current = limiter;

      // 5. Monitor Gain: routes microphone into headphones
      const shouldMonitor = typeof forcedMonitor === 'boolean' ? forcedMonitor : isMonitorSpeakerRef.current;
      const monitorGain = ctx.createGain();
      monitorGain.gain.value = shouldMonitor ? 1.0 : 0.0;
      monitorGainNodeRef.current = monitorGain;

      // 6. Delay / Echo effect nodes
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = delayTime;
      delayNodeRef.current = delay;

      const feedback = ctx.createGain();
      feedback.gain.value = isEchoOn ? Math.min(0.45, echoLevel) : 0;
      feedbackNodeRef.current = feedback;

      // High-Fidelity Signal Chain:
      // source -> highpass (85Hz) -> presence (3.2kHz) -> preamp gain (1.8x)
      source.connect(highpass);
      highpass.connect(presence);
      presence.connect(gain);

      // Echo Loop
      gain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);

      // Output mix to monitor & limiter -> destination (headphones)
      gain.connect(monitorGain);
      delay.connect(monitorGain);
      monitorGain.connect(limiter);
      limiter.connect(ctx.destination);

      setIsMicActive(true);
    } catch (err) {
      console.error('Microphone activation failed:', err);
      setMicError(err.message || 'មិនអាចបើក Microphone បានទេ។');
      setIsMicActive(false);
    }
  }, [micVolume, isEchoOn, echoLevel, delayTime]);

  const stopMic = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicActive(false);
  }, []);

  const toggleMic = useCallback(() => {
    if (isMicActive) {
      stopMic();
    } else {
      startMic();
    }
  }, [isMicActive, startMic, stopMic]);

  // Headphone mode toggle: automatically activates microphone and monitoring into headphones
  const toggleHeadphones = useCallback((forcedState) => {
    setIsHeadphonesConnected((prev) => {
      const nextState = typeof forcedState === 'boolean' ? forcedState : !prev;
      setIsMonitorSpeaker(nextState);
      isMonitorSpeakerRef.current = nextState;

      if (nextState) {
        // User plugged in headphones: start mic & enable karaoke echo
        setIsEchoOn(true);
        if (!mediaStreamRef.current) {
          startMic(true);
        } else if (monitorGainNodeRef.current && audioContextRef.current) {
          monitorGainNodeRef.current.gain.setTargetAtTime(1.0, audioContextRef.current.currentTime, 0.03);
        }
      } else {
        // Unplugged: immediately mute monitor speaker to prevent howling feedback!
        if (monitorGainNodeRef.current && audioContextRef.current) {
          monitorGainNodeRef.current.gain.setTargetAtTime(0.0, audioContextRef.current.currentTime, 0.03);
        }
      }
      return nextState;
    });
  }, [startMic]);

  // Adjust volume
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(micVolume, audioContextRef.current.currentTime, 0.03);
    }
  }, [micVolume]);

  // Adjust monitor speaker gain
  useEffect(() => {
    if (monitorGainNodeRef.current && audioContextRef.current) {
      const target = isMonitorSpeaker ? 1.0 : 0.0;
      monitorGainNodeRef.current.gain.setTargetAtTime(target, audioContextRef.current.currentTime, 0.03);
    }
  }, [isMonitorSpeaker]);

  // Adjust echo level & toggle safely
  useEffect(() => {
    if (feedbackNodeRef.current && audioContextRef.current) {
      const safeLevel = Math.min(0.45, Math.max(0, echoLevel));
      const targetGain = isEchoOn ? safeLevel : 0;
      feedbackNodeRef.current.gain.setTargetAtTime(targetGain, audioContextRef.current.currentTime, 0.03);
    }
  }, [isEchoOn, echoLevel]);

  // Adjust delay time
  useEffect(() => {
    if (delayNodeRef.current && audioContextRef.current) {
      const targetDelay = Math.min(0.6, Math.max(0.05, delayTime));
      delayNodeRef.current.delayTime.setTargetAtTime(targetDelay, audioContextRef.current.currentTime, 0.03);
    }
  }, [delayTime]);

  // Preset Echo / Delay Profiles
  const setEchoPreset = useCallback((preset) => {
    setIsEchoOn(true);
    if (preset === 'room') {
      setDelayTime(0.12);
      setEchoLevel(0.18);
    } else if (preset === 'karaoke') {
      setDelayTime(0.20);
      setEchoLevel(0.28);
    } else if (preset === 'concert') {
      setDelayTime(0.32);
      setEchoLevel(0.38);
    } else if (preset === 'space') {
      setDelayTime(0.42);
      setEchoLevel(0.45);
    }
  }, []);

  // Quick Mic Boost presets
  const setMicBoostPreset = useCallback((level) => {
    if (level === 'normal') setMicVolume(1.0);
    else if (level === 'full') setMicVolume(1.8);
    else if (level === 'boost') setMicVolume(2.5);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMic();
    };
  }, [stopMic]);

  return {
    isMicActive,
    toggleMic,
    startMic,
    stopMic,
    micVolume,
    setMicVolume,
    setMicBoostPreset,
    isEchoOn,
    setIsEchoOn,
    echoLevel,
    setEchoLevel,
    delayTime,
    setDelayTime,
    setEchoPreset,
    isMonitorSpeaker,
    setIsMonitorSpeaker,
    isHeadphonesConnected,
    setIsHeadphonesConnected,
    toggleHeadphones,
    micError,
    micStream: mediaStreamRef.current,
  };
}
