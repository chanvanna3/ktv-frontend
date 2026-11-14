import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sliders,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Radio,
  Music,
  Headphones,
  Disc,
  Download,
  Square,
  Play,
  RotateCcw,
  Activity,
  ShieldCheck,
  ChevronDown,
  Layers,
  Settings,
  X,
  Gauge,
  Flame,
  Heart,
  Sun,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { VOICE_PRESETS } from '../hooks/useVoiceStudioPro';

export function KtvVoiceStudioPro({
  studio,
  isOpen,
  onClose,
  videoTitle = '',
}) {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'autotune' | 'eq' | 'fx' | 'balance' | 'record'
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // Live Waveform Canvas visualizer
  useEffect(() => {
    if (!isOpen) return;

    let isRunning = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const buffer = new Float32Array(256);

    const drawWaveform = () => {
      if (!isRunning) return;

      const analyser = studio.outputAnalyser || studio.inputAnalyser;
      if (analyser && studio.isMicActive) {
        analyser.getFloatTimeDomainData(buffer);

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Draw neon glowing waveform
        ctx.lineWidth = 2.5;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#a855f7'); // purple
        gradient.addColorStop(0.5, '#06b6d4'); // cyan
        gradient.addColorStop(1, '#ec4899'); // pink
        ctx.strokeStyle = gradient;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        const sliceWidth = width / buffer.length;
        let x = 0;

        for (let i = 0; i < buffer.length; i++) {
          const v = buffer[i];
          const y = (v * height) / 2 + height / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else {
        // Idle flat neon line
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(drawWaveform);
    };

    animRef.current = requestAnimationFrame(drawWaveform);

    return () => {
      isRunning = false;
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isOpen, studio.isMicActive, studio.outputAnalyser, studio.inputAnalyser]);

  if (!isOpen) return null;

  // Format recording timer
  const formatSecs = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper for preset icons
  const getPresetIcon = (iconName) => {
    switch (iconName) {
      case 'sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'mic':
        return <Mic className="w-5 h-5" />;
      case 'music':
        return <Music className="w-5 h-5" />;
      case 'heart':
        return <Heart className="w-5 h-5" />;
      case 'flame':
        return <Flame className="w-5 h-5" />;
      case 'disc':
        return <Disc className="w-5 h-5" />;
      case 'sun':
        return <Sun className="w-5 h-5" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-sans">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-purple-500/40 shadow-2xl shadow-purple-500/20 overflow-hidden text-slate-100">
        {/* ======================================================== */}
        {/* 1. STUDIO HEADER: Title, Live Meters, Device Selector */}
        {/* ======================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/30">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Mic className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                  KTV VOICE STUDIO PRO
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 border border-purple-500/50 text-purple-300 uppercase tracking-widest">
                  PRO DSP
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                ប្រព័ន្ធកែសម្រួលសំឡេងច្រៀងអាជីពកម្រិតស្ទូឌីយោ (0ms Lag Live Vocal Engine)
              </p>
            </div>
          </div>

          {/* Quick Hardware Controls: Mic On/Off, Mute, Monitor, Close */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Device Selector */}
            {studio.availableMics.length > 1 && (
              <select
                value={studio.selectedMicId}
                onChange={(e) => studio.changeMicDevice(e.target.value)}
                className="max-w-[140px] sm:max-w-[180px] bg-slate-950 border border-slate-800 text-[11px] rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-purple-500 truncate cursor-pointer"
              >
                {studio.availableMics.map((m) => (
                  <option key={m.deviceId} value={m.deviceId}>
                    {m.label}
                  </option>
                ))}
              </select>
            )}

            {/* Mic Toggle Button */}
            <button
              onClick={studio.toggleMic}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-md ${
                studio.isMicActive
                  ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {studio.isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{studio.isMicActive ? 'MIC ON' : 'បើក MIC'}</span>
            </button>

            {/* Mute Toggle */}
            <button
              onClick={studio.toggleMute}
              disabled={!studio.isMicActive}
              className={`p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                studio.isMuted
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={studio.isMuted ? 'បើកសំឡេងច្រៀងវិញ' : 'Mute សំឡេងច្រៀង'}
            >
              {studio.isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Monitor Toggle */}
            <button
              onClick={studio.toggleMonitoring}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                studio.isMonitoring
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
              title="ស្តាប់សំឡេងច្រៀងផ្ទាល់ក្នុងកាស"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">កាសស្តាប់:</span>
              <span>{studio.isMonitoring ? 'ON' : 'OFF'}</span>
            </button>

            {/* Close Studio Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. REAL-TIME WAVEFORM & DUAL VU LEVEL METERS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 px-5 py-3 bg-slate-950 border-b border-slate-800/80">
          {/* Waveform Canvas */}
          <div className="md:col-span-2 relative h-16 rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden flex items-center justify-center p-1">
            <canvas ref={canvasRef} width={420} height={64} className="w-full h-full object-cover" />
            <div className="absolute top-1.5 left-2.5 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded-md border border-cyan-500/20">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>LIVE VOCAL WAVEFORM</span>
            </div>
            {studio.detectedPitch && (
              <div className="absolute bottom-1.5 right-2.5 flex items-center gap-1 text-[11px] font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-md">
                <span>Pitch: {studio.detectedPitch.noteName}</span>
                <span className="text-cyan-300 font-normal text-[10px]">({studio.detectedPitch.freq}Hz)</span>
              </div>
            )}
          </div>

          {/* Dual VU Meter: Input Level */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3 text-purple-400" />
                <span>Input Level</span>
              </span>
              <span className="font-mono text-purple-400">{studio.inputLevel}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex p-0.5 gap-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500 transition-all duration-75"
                style={{ width: `${studio.inputLevel}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 truncate">
              {studio.isMicActive ? (studio.inputLevel > 0 ? '🎙️ កំពុងចាប់សំឡេង...' : 'រង់ចាំច្រៀង...') : 'Mic មិនទាន់បើក'}
            </span>
          </div>

          {/* Dual VU Meter: Processed Output Level */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" />
                <span>Output Level (DSP)</span>
              </span>
              <span className="font-mono text-cyan-400">{studio.outputLevel}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex p-0.5 gap-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-400 to-pink-500 transition-all duration-75"
                style={{ width: `${studio.outputLevel}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 truncate">
              {studio.outputLevel > 80 ? '🔥 កម្រិតខ្លាំងល្អ' : 'កម្រិតសម្លេងធម្មតា'}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. STUDIO RACK TABS */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1 px-5 py-2.5 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'presets', label: '✨ 1-Click Presets', labelKm: 'ម៉ូដសំឡេងពិសេស' },
            { id: 'autotune', label: '⚡ Auto-Tune & Pitch', labelKm: 'តម្រង់សម្លេង Note' },
            { id: 'eq', label: '🎛️ 3-Band EQ & Comp', labelKm: 'Bass, Mid, Treble' },
            { id: 'fx', label: '🌊 Reverb & Echo', labelKm: 'អេកូ & បន្ទរស្ទូឌីយោ' },
            { id: 'balance', label: '⚖️ Vocal / Music Balance', labelKm: 'តុល្យភាពភ្លេង & Mic' },
            { id: 'record', label: '🔴 Voice Recorder', labelKm: 'ថតសម្លេងច្រៀង' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* 4. TAB CONTENTS */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: 1-CLICK VOICE PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-purple-300">
                    ✨ 8 Professional Voice Presets (ជ្រើសរើសម៉ូដសំឡេងដោយចុចតែម្តង)
                  </h3>
                  <p className="text-xs text-slate-400">
                    ប្រព័ន្ធនឹងកែសម្រួល Reverb, Echo, EQ, Compressor និង Auto-Tune ដោយស្វ័យប្រវត្តិតាមស្ទីលនីមួយៗ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {Object.values(VOICE_PRESETS).map((preset) => {
                  const isActive = studio.activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => studio.applyPreset(preset.id)}
                      className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                        isActive
                          ? 'bg-slate-900 border-purple-500 shadow-lg shadow-purple-500/20'
                          : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top icon and badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr ${preset.color} text-white shadow-md`}
                        >
                          {getPresetIcon(preset.icon)}
                        </div>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500 text-white uppercase tracking-wider shadow-sm">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-white group-hover:text-purple-300 transition-colors">
                          {preset.name}
                        </h4>
                        <span className="text-[11px] font-bold text-purple-400 block mb-1">
                          {preset.nameKm}
                        </span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          {preset.descKm}
                        </p>
                      </div>

                      {/* Active indicator bar */}
                      <div
                        className={`mt-3 h-1 w-full rounded-full bg-gradient-to-r ${preset.color} ${
                          isActive ? 'opacity-100' : 'opacity-20 group-hover:opacity-40'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AI AUTO-TUNE & PITCH CORRECTION */}
          {activeTab === 'autotune' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Real-Time AI Auto-Tune & Pitch Correction</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    តម្រង់សម្លេងច្រៀងឱ្យត្រូវតាម Scale និង Key ភ្លេងដោយស្វ័យប្រវត្តិតាមពេលវេលាជាក់ស្តែង
                  </p>
                </div>

                {/* Auto-Tune On/Off Switch */}
                <button
                  onClick={() => studio.setIsAutoTuneActive(!studio.isAutoTuneActive)}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs cursor-pointer border transition-all ${
                    studio.isAutoTuneActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {studio.isAutoTuneActive ? 'AUTO-TUNE: ON' : 'AUTO-TUNE: OFF'}
                </button>
              </div>

              {/* Pitch Visualizer & Note Gauge */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-purple-600 flex flex-col items-center justify-center font-mono shadow-lg shadow-cyan-500/20">
                    <span className="text-xs font-bold text-cyan-200">NOTE</span>
                    <span className="text-xl font-black text-white">
                      {studio.detectedPitch ? studio.detectedPitch.rawName : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-300 font-bold block">
                      {studio.detectedPitch ? (
                        <span className="text-emerald-400">
                          Detected: {studio.detectedPitch.noteName} ({studio.detectedPitch.freq} Hz)
                        </span>
                      ) : (
                        <span className="text-slate-400">កំពុងស្តាប់សម្លេងច្រៀងរបស់អ្នក...</span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Target Note: {studio.detectedPitch ? studio.detectedPitch.targetNoteName : '--'} | Tuning Cents:{' '}
                      {studio.detectedPitch ? `${studio.detectedPitch.centsOff} ¢` : '0 ¢'}
                    </span>
                  </div>
                </div>

                {/* Cents Offset Tuning Meter */}
                <div className="w-full sm:w-64 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>-50¢ (Flat)</span>
                    <span className="text-cyan-400 font-bold">In Tune</span>
                    <span>+50¢ (Sharp)</span>
                  </div>
                  <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center">
                    <div className="absolute w-0.5 h-full bg-white z-10" />
                    {studio.detectedPitch && (
                      <div
                        className="absolute h-full w-2.5 rounded-full bg-cyan-400 transition-all duration-75 shadow-sm shadow-cyan-400"
                        style={{
                          left: `calc(50% + ${(Math.max(-50, Math.min(50, studio.detectedPitch.centsOff)) / 50) * 45}%)`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Musical Key and Scale Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Musical Key */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-200 block">
                    ជ្រើសរើស Key តន្ត្រី (Musical Key):
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {studio.NOTE_NAMES.map((key) => (
                      <button
                        key={key}
                        onClick={() => studio.setSelectedKey(key)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          studio.selectedKey === key
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Scale Type */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-200 block">
                    ប្រភេទ Scale (Khmer, Pentatonic, Major, Minor):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'khmerPentatonic', label: '🇰🇭 Khmer Pentatonic' },
                      { id: 'major', label: 'Major (ភ្លេងសប្បាយ)' },
                      { id: 'minor', label: 'Minor (ភ្លេងកំសត់)' },
                      { id: 'chromatic', label: 'Chromatic (គ្រប់ 12 Notes)' },
                    ].map((scale) => (
                      <button
                        key={scale.id}
                        onClick={() => studio.setSelectedScale(scale.id)}
                        className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer ${
                          studio.selectedScale === scale.id
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {scale.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Correction Strength Slider */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    កម្លាំង Auto-Tune (Correction Strength):
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {Math.round(studio.autoTuneStrength * 100)}% ({studio.autoTuneStrength > 0.8 ? 'Robotic / Modern Pop' : 'Natural Voice'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={studio.autoTuneStrength}
                  onChange={(e) => studio.setAutoTuneStrength(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0% (បិទ)</span>
                  <span>50% (សំឡេងធម្មជាតិ ស្រទន់)</span>
                  <span>100% (Pop Star Auto-Tune)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 3-BAND STUDIO EQ & COMPRESSOR */}
          {activeTab === 'eq' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>3-Band Studio Equalizer (Bass, Mid, Treble) & Vocal Compressor</span>
                </h3>
                <p className="text-xs text-slate-400">
                  កែសម្រួលសម្លេងបាស សម្លេងកណ្តាល និងសម្លេងស្រួយ ព្រមទាំងបង្ហាប់សម្លេងឱ្យណែនស្មើល្អ
                </p>
              </div>

              {/* 3-Band Equalizer Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bass Slider */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-300">Bass (120Hz)</span>
                    <span className="font-mono text-emerald-400">
                      {studio.eqBass > 0 ? `+${studio.eqBass}` : studio.eqBass} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={studio.eqBass}
                    onChange={(e) => studio.setEqBass(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    បង្កើនភាពធ្ងន់ និងភាពកក់ក្តៅដល់សម្លេងច្រៀង។
                  </p>
                </div>

                {/* Mid Slider */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-yellow-300">Mid (1.5kHz)</span>
                    <span className="font-mono text-yellow-400">
                      {studio.eqMid > 0 ? `+${studio.eqMid}` : studio.eqMid} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={studio.eqMid}
                    onChange={(e) => studio.setEqMid(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    ធ្វើឱ្យសម្លេងច្រៀងលឺច្បាស់ និងលេចធ្លោពីលើភ្លេង។
                  </p>
                </div>

                {/* Treble Slider */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-cyan-300">Treble (6.5kHz)</span>
                    <span className="font-mono text-cyan-400">
                      {studio.eqTreble > 0 ? `+${studio.eqTreble}` : studio.eqTreble} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={studio.eqTreble}
                    onChange={(e) => studio.setEqTreble(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    បង្កើនភាពស្រួយ ភ្លឺថ្លា ដូចតារាចម្រៀងអាជីព។
                  </p>
                </div>
              </div>

              {/* Vocal Dynamics Compressor & Noise Gate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Compressor */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-purple-300">Vocal Compressor Threshold</span>
                    <span className="font-mono text-purple-400">{studio.compThreshold} dB</span>
                  </div>
                  <input
                    type="range"
                    min="-36"
                    max="-6"
                    step="1"
                    value={studio.compThreshold}
                    onChange={(e) => studio.setCompThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                  <p className="text-[10px] text-slate-400">
                    រក្សាកម្រិតសម្លេងឱ្យស្មើល្អ មិនលឺខ្លាំងពេកពេលស្រែក ឬខ្សោយពេកពេលច្រៀងតិចៗ។
                  </p>
                </div>

                {/* Noise Gate */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-pink-300">Noise Gate Threshold</span>
                    <span className="font-mono text-pink-400">{studio.noiseGateThreshold} dB</span>
                  </div>
                  <input
                    type="range"
                    min="-65"
                    max="-30"
                    step="1"
                    value={studio.noiseGateThreshold}
                    onChange={(e) => studio.setNoiseGateThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
                  />
                  <p className="text-[10px] text-slate-400">
                    កាត់សម្លេងខ្យល់ដង្ហើម និងសម្លេងរំខានជុំវិញចោលនៅពេលយើងមិនទាន់បញ្ចេញសម្លេង។
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDIO REVERB & STEREO ECHO */}
          {activeTab === 'fx' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-indigo-400" />
                  <span>Studio Reverb & Stereo Tape Echo Effects</span>
                </h3>
                <p className="text-xs text-slate-400">
                  បង្កើតសម្លេងបន្ទរ Reverb បែប Recording Studio និងអេកូ Echo រណ្តំពិរោះ
                </p>
              </div>

              {/* Reverb Types */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-200 block">
                  ជ្រើសរើសប្រភេទបន្ទរ Reverb (Reverb Space):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'studio', name: 'Studio Reverb', desc: 'បន្ទរបែបស្ទូឌីយោថតសម្លេង' },
                    { id: 'room', name: 'Acoustic Room', desc: 'បន្ទរបន្ទប់ឈើកក់ក្តៅ' },
                    { id: 'hall', name: 'Concert Hall', desc: 'បន្ទរឆាកតន្ត្រីធំទូលាយ' },
                    { id: 'concert', name: 'Stadium Arena', desc: 'បន្ទរពហុកីឡដ្ឋានធំ' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => studio.changeReverbType(r.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        studio.reverbType === r.id
                          ? 'bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <h5 className="text-xs font-bold text-white mb-0.5">{r.name}</h5>
                      <p className="text-[10px] text-slate-400">{r.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Reverb Wetness Slider */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-indigo-300">កម្រិតបន្ទរ Reverb (Wetness):</span>
                    <span className="font-mono text-indigo-400">
                      {Math.round(studio.reverbLevel * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.85"
                    step="0.05"
                    value={studio.reverbLevel}
                    onChange={(e) => studio.setReverbLevel(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                </div>
              </div>

              {/* Echo / Feedback Delay */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Stereo Echo / Slapback Delay</span>
                  </h4>
                  <button
                    onClick={() => studio.setIsEchoOn(!studio.isEchoOn)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer border transition-all ${
                      studio.isEchoOn
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {studio.isEchoOn ? 'ECHO: ON' : 'ECHO: OFF'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Delay Time */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">ពេលវេលាឌីឡេ (Delay Time):</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {Math.round(studio.delayTime * 1000)} ms
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.04"
                      max="0.40"
                      step="0.01"
                      value={studio.delayTime}
                      disabled={!studio.isEchoOn}
                      onChange={(e) => studio.setDelayTime(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
                    />
                  </div>

                  {/* Echo Feedback */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">ចំនួនជុំបន្ទរ (Feedback):</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {Math.round(studio.echoFeedback * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.65"
                      step="0.05"
                      value={studio.echoFeedback}
                      disabled={!studio.isEchoOn}
                      onChange={(e) => studio.setEchoFeedback(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VOCAL / MUSIC BALANCE */}
          {activeTab === 'balance' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-pink-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-pink-400" />
                  <span>Vocal and Background Music Balance (តុល្យភាពភ្លេង និងសំឡេងច្រៀង)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  កំណត់កម្រិតសំឡេង Microphone និងភ្លេងខារ៉ាអូខេឱ្យស៊ីចង្វាក់គ្នាបំផុត
                </p>
              </div>

              {/* Master Balance Slider */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-400 flex items-center gap-1.5">
                    <Music className="w-4 h-4" />
                    <span>ភ្លេង (Music): {100 - studio.vocalMusicBalance}%</span>
                  </span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200">
                    {studio.vocalMusicBalance === 50 ? '50 / 50 Balanced' : `${studio.vocalMusicBalance}% Vocal`}
                  </span>
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <Mic className="w-4 h-4" />
                    <span>សំឡេង Mic: {studio.vocalMusicBalance}%</span>
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={studio.vocalMusicBalance}
                  onChange={(e) => studio.setVocalMusicBalance(parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-purple-500 via-cyan-400 to-rose-500 rounded-lg appearance-none cursor-pointer"
                />

                {/* Quick Balance Presets */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {[
                    { val: 30, label: 'ភ្លេងលឺខ្លាំងជាង (Music 70%)' },
                    { val: 50, label: '⚖️ 50 / 50 ស្មើគ្នា' },
                    { val: 70, label: 'សំឡេងច្រៀងខ្លាំងជាង (Mic 70%)' },
                  ].map((b) => (
                    <button
                      key={b.val}
                      onClick={() => studio.setVocalMusicBalance(b.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        studio.vocalMusicBalance === b.val
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Master Mic Volume */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200">កម្រិតបំពងសំឡេង Microphone (Mic Pre-amp Gain):</span>
                  <span className="font-mono text-purple-400">{Math.round(studio.micVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={studio.micVolume}
                  onChange={(e) => studio.setMicVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>
            </div>
          )}

          {/* TAB 6: PERFORMANCE VOICE RECORDER */}
          {activeTab === 'record' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <Disc className="w-4 h-4 text-rose-500 animate-spin" />
                  <span>Karaoke Performance Studio Recorder (ថតសម្លេងច្រៀង & ភ្លេងរួមគ្នា)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ថតសម្លេងច្រៀងរបស់អ្នកជាមួយនឹង Reverb, Echo, Auto-Tune និងភ្លេងខារ៉ាអូខេ រួចទាញយកជា Audio File
                </p>
              </div>

              {/* Recording Box */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-white">
                  {formatSecs(studio.recordingSeconds)}
                </div>

                <div className="flex items-center gap-3">
                  {!studio.isRecording ? (
                    <button
                      onClick={studio.startRecording}
                      disabled={!studio.isMicActive}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-xl shadow-rose-600/30 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                      <span>ចាប់ផ្តើមថត (START RECORDING)</span>
                    </button>
                  ) : (
                    <button
                      onClick={studio.stopRecording}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border border-slate-700 shadow-xl cursor-pointer transition-all"
                    >
                      <Square className="w-4 h-4 text-rose-400 fill-rose-400" />
                      <span>បញ្ឈប់ការថត (STOP)</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 max-w-sm">
                  {studio.isRecording
                    ? '🔴 កំពុងថតសម្លេងច្រៀង និងភ្លេងខារ៉ាអូខេក្នុងគុណភាពខ្ពស់ 192kbps...'
                    : 'ចុច Start Recording ដើម្បីថតបទចម្រៀងរបស់អ្នក'}
                </p>

                {/* Recorded Audio Playback & Download */}
                {studio.recordedAudioUrl && (
                  <div className="w-full max-w-md pt-4 mt-4 border-t border-slate-800/80 space-y-3 animate-fade-in">
                    <span className="text-xs font-bold text-emerald-400 block">
                      ✅ ថតចប់ជោគជ័យ! ស្តាប់ឡើងវិញ ឬទាញយកទុក៖
                    </span>
                    <audio
                      src={studio.recordedAudioUrl}
                      controls
                      className="w-full h-10 rounded-xl bg-slate-900"
                    />
                    <button
                      onClick={() => studio.downloadRecording(videoTitle || 'KTV-Song')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>ទាញយកបទចម្រៀងដែលបានថត (Download Audio)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 5. STUDIO FOOTER STATUS BAR */}
        {/* ======================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-800 bg-slate-950 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px]">
              Studio Mode: <strong className="text-slate-200">{VOICE_PRESETS[studio.activePresetId]?.name}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px]">
              Anti-Ducking: <strong className="text-emerald-400">Active (ភ្លេងលឺធម្មតា)</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:opacity-95 cursor-pointer transition-all"
          >
            រួចរាល់ (Close Studio)
          </button>
        </div>
      </div>
    </div>
  );
}
