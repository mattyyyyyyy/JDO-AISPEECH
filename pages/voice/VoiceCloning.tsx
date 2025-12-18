
import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../../components/GlassCard';
import Waveform from '../../components/Waveform';
import { UploadCloud, Mic, Trash2, ArrowRight, CheckCircle2, StopCircle, Clock, Shield, Globe, Sparkles } from 'lucide-react';
import { RANDOM_READING_TEXTS, MOCK_VOICES } from '../../constants';
import { Voice } from '../../types';

const VoiceCloning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [creationStep, setCreationStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [readingText, setReadingText] = useState(RANDOM_READING_TEXTS[0]);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordTime(prev => prev >= 180 ? 180 : prev + 1);
      }, 1000);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const startRecording = () => {
    setRecordTime(0);
    setIsRecording(true);
    setReadingText(RANDOM_READING_TEXTS[Math.floor(Math.random() * RANDOM_READING_TEXTS.length)]);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setFile(new File(["audio content"], "recorded_sample.wav", { type: "audio/wav" }));
  };

  const handleCreate = () => {
     const newVoice: Voice = {
       id: `custom_${Date.now()}`,
       name: projectName,
       gender: 'Male',
       language: 'Chinese',
       tags: ['Custom', 'Cloned'],
       category: 'Character',
       avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${projectName}`,
       isCustom: true,
       isPublic: isPublic,
       previewUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"
     };
     MOCK_VOICES.unshift(newVoice);
     alert("声音模型创建成功！");
     setCreationStep(1); setFile(null); setProjectName(''); setDescription('');
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12 overflow-y-auto scrollbar-hide">
      {creationStep === 1 && (
        <>
          <div className="text-center space-y-3 mb-4">
            <h1 className="text-4xl font-black text-white tracking-tight">克隆您的声音</h1>
            <p className="text-white/40 text-lg">通过 30 秒的样本，为您的数字身份赋予灵魂。</p>
          </div>
          <GlassCard className="p-10 flex flex-col items-center gap-10 min-h-[500px] border-white/5 bg-white/[0.01]">
             <div className="bg-white/5 p-1 rounded-2xl flex border border-white/10 w-[440px] shadow-inner">
                <button onClick={() => { setActiveTab('upload'); setIsRecording(false); setFile(null); }} className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-3 ${activeTab === 'upload' ? 'bg-spark-accent text-white shadow-xl' : 'text-white/40 hover:text-white/60'}`}><UploadCloud size={20} /> 上传音频</button>
                <button onClick={() => { setActiveTab('record'); setFile(null); }} className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-3 ${activeTab === 'record' ? 'bg-spark-accent text-white shadow-xl' : 'text-white/40 hover:text-white/60'}`}><Mic size={20} /> 录制音频</button>
             </div>
             <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center">
                {activeTab === 'upload' && !file && <div className="w-full h-80 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] hover:border-spark-accent/40 transition-all relative group cursor-pointer shadow-inner"><input type="file" accept=".wav,.mp3" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><div className="w-20 h-20 rounded-full bg-spark-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><UploadCloud size={32} className="text-spark-accent" /></div><h3 className="text-xl font-bold text-white mb-2">拖拽或点击上传</h3><p className="text-white/30 text-sm">支持 WAV, MP3 (建议 30-60 秒)</p></div>}
                {activeTab === 'record' && !file && <div className="w-full flex flex-col items-center gap-8">{!isRecording ? <div className="text-center space-y-10 flex flex-col items-center"><div className="bg-white/[0.03] p-10 rounded-[2rem] border border-white/5 max-w-xl w-full shadow-inner"><p className="text-white/80 text-2xl font-light leading-relaxed italic">"{readingText}"</p></div><button onClick={startRecording} className="w-24 h-24 rounded-full bg-spark-accent flex items-center justify-center text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 active:scale-95 transition-all"><Mic size={40} /></button><p className="text-white/30 font-medium">点击麦克风开始录制演示文本</p></div> : <div className="flex flex-col items-center gap-10 w-full"><div className="flex items-center gap-4 text-red-500 bg-red-500/10 px-8 py-3 rounded-2xl border border-red-500/20"><div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div><span className="font-mono text-3xl font-black">{formatTime(recordTime)}</span></div><div className="w-full h-32 opacity-50"><Waveform isAnimating={true} color="#ef4444" /></div><button onClick={stopRecording} className="px-12 py-5 rounded-2xl bg-white text-black font-black text-lg flex items-center gap-3 shadow-2xl hover:bg-white/90 active:scale-95 transition-all"><StopCircle size={28} /> 停止录音</button></div>}</div>}
                {file && <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 animate-in zoom-in-95 shadow-2xl"><div className="flex items-center gap-5 mb-8"><div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20"><CheckCircle2 size={32} /></div><div className="min-w-0"><h3 className="text-xl font-bold text-white mb-1">样本已就绪</h3><p className="text-sm text-white/40 truncate">{file.name}</p></div><button onClick={() => setFile(null)} className="ml-auto p-2 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={24} /></button></div><button onClick={() => setCreationStep(2)} className="w-full py-4 rounded-2xl bg-spark-accent text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-blue-500 transition-all">下一步：配置模型 <ArrowRight size={20} /></button></div>}
             </div>
          </GlassCard>
        </>
      )}

      {creationStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2">实时预览预览</span>
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden group shadow-2xl bg-gradient-to-br from-[#1a1a1e] to-[#0a0a0c] border border-white/5 p-8 flex flex-col">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-spark-accent/10 blur-[100px] -z-0" />
              
              {/* Card Header */}
              <div className="flex justify-between items-start relative z-10 mb-8">
                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isPublic ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-white/30'}`}>
                    {isPublic ? <Globe size={12}/> : <Shield size={12}/>}
                    {isPublic ? '公开模型' : '私有模型'}
                 </div>
                 <div className="text-spark-accent"><Sparkles size={20}/></div>
              </div>

              {/* Avatar Section */}
              <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-spark-accent/20 blur-2xl animate-pulse" />
                  <div className="w-32 h-32 rounded-full border-2 border-white/10 p-1 relative z-10">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-spark-dark to-spark-accent flex items-center justify-center text-white text-5xl font-black">
                      {projectName ? projectName[0].toUpperCase() : '?'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight leading-tight">{projectName || '未命名音色'}</h3>
                  <p className="text-white/40 text-sm mt-2 max-w-[240px] line-clamp-2">{description || '暂无声音描述...'}</p>
                </div>
                
                <div className="w-full bg-white/5 rounded-2xl p-4 flex items-center justify-center border border-white/5">
                   <div className="flex gap-1 items-end h-8">
                      {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 0.4].map((h, i) => (
                        <div key={i} className="w-1.5 bg-spark-accent/40 rounded-full animate-pulse" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                   </div>
                   <span className="ml-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Digital Voice DNA</span>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 pt-6 mt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-white/20 uppercase tracking-widest">
                 <span>Audio Spark V2.5</span>
                 <span>ID: {Date.now().toString().slice(-6)}</span>
              </div>
            </div>
          </div>

          <GlassCard className="lg:col-span-7 flex flex-col gap-8 p-10 bg-white/[0.01] border-white/5 rounded-[3rem]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">模型详情配置</h2>
              <button onClick={() => setCreationStep(1)} className="text-white/30 hover:text-white text-sm font-bold">返回修改样本</button>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">声音名称</label>
                <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg font-bold outline-none focus:border-spark-accent transition-all placeholder:text-white/10" placeholder="例如：我的游戏解说分身" />
              </div>
              
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">描述</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none resize-none focus:border-spark-accent transition-all placeholder:text-white/10 font-light leading-relaxed" placeholder="简要描述声音的特点，如：沉稳、磁性、适合讲解..." />
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">公开此声音模型</span>
                    <span className="text-xs text-white/30 mt-1">开启后，社区其他用户也将可以使用您的声音模型进行创作。</span>
                 </div>
                 <button onClick={() => setIsPublic(!isPublic)} className={`relative w-14 h-7 rounded-full transition-all duration-300 ${isPublic ? 'bg-spark-accent' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-lg ${isPublic ? 'left-8' : 'left-1'}`} />
                 </button>
              </div>

              <button onClick={handleCreate} disabled={!projectName} className={`w-full py-5 rounded-2xl font-black text-xl mt-4 transition-all shadow-2xl ${!projectName ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-gradient-to-r from-spark-dark to-spark-accent text-white hover:scale-[1.02] active:scale-[0.98]'}`}>开始构建声音分身</button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default VoiceCloning;
