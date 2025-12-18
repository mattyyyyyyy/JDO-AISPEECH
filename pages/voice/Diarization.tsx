
import React, { useState, useEffect, useRef, useMemo } from 'react';
import GlassCard from '../../components/GlassCard';
import Waveform from '../../components/Waveform';
import { Users, Clock, FileAudio, Edit2, Check, Mic, StopCircle, UserCircle, Settings2, Search, X } from 'lucide-react';
import { SpeakerSegment, SpeakerIdentity } from '../../types';

const Diarization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [segments, setSegments] = useState<SpeakerSegment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const streamIntervalRef = useRef<number | null>(null);

  // All possible speaker identities (mappings for IDs to initial names/colors)
  const [speakers, setSpeakers] = useState<SpeakerIdentity[]>([
    { id: 'spk_1', name: '说话人 1', color: 'bg-blue-500' },
    { id: 'spk_2', name: '说话人 2', color: 'bg-purple-500' },
    { id: 'spk_3', name: '说话人 3', color: 'bg-emerald-500' },
    { id: 'spk_4', name: '说话人 4', color: 'bg-orange-500' },
    { id: 'spk_5', name: '说话人 5', color: 'bg-pink-500' }
  ]);

  // Derived state: only speakers that have at least one segment in the current transcript
  const activeSpeakers = useMemo(() => {
    const activeIds = new Set(segments.map(s => s.speakerId));
    return speakers.filter(s => activeIds.has(s.id));
  }, [segments, speakers]);

  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordTime(prev => prev + 1), 1000);
      let segmentCounter = 0;
      const mockPhrases = [
        { spk: 'spk_1', text: "大家好，欢迎参加今天的语音技术研讨会。" },
        { spk: 'spk_2', text: "谢谢。我们要讨论的主题是多说话人声纹识别系统。" },
        { spk: 'spk_3', text: "我是技术部的，我想问一下实时识别的延迟大概是多少？" },
        { spk: 'spk_4', text: "通常在毫秒级别，我们会利用流式推理技术。" },
        { spk: 'spk_5', text: "目前我们的模型已经支持超过10种不同的方言。" },
        { spk: 'spk_1', text: "非常好，那我们接着看下一个案例分析。" },
        { spk: 'spk_2', text: "好的，请继续。" }
      ];
      
      streamIntervalRef.current = window.setInterval(() => {
          if (segmentCounter < mockPhrases.length) {
             const phrase = mockPhrases[segmentCounter];
             const newSegment: SpeakerSegment = { 
               id: `seg_${Date.now()}`, 
               speakerId: phrase.spk, 
               text: phrase.text, 
               startTime: segmentCounter * 3.5, 
               endTime: segmentCounter * 3.5 + 3.0 
             };
             setSegments(prev => [...prev, newSegment]);
             segmentCounter++;
          }
       }, 3500);
    } else {
       if (timerRef.current) clearInterval(timerRef.current);
       if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    }
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current); 
    };
  }, [isRecording]);

  const processAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    setSegments([]); // Reset segments on new upload
    setTimeout(() => {
       const mockSegments: SpeakerSegment[] = [
         { id: '1', speakerId: 'spk_1', text: "你好，能否解释一下声纹识别技术？", startTime: 0, endTime: 3.5 },
         { id: '2', speakerId: 'spk_2', text: "声纹识别是生物识别技术的一种，通过分析语音波形来确认身份。", startTime: 4.0, endTime: 8.2 }
       ];
       setSegments(mockSegments); 
       setIsProcessing(false);
    }, 2000);
  };

  const startEditSpeaker = (id: string, name: string) => {
    setEditingSpeakerId(id);
    setTempName(name);
  };

  const saveSpeakerName = () => {
    if (editingSpeakerId && tempName.trim()) {
      setSpeakers(prev => prev.map(s => s.id === editingSpeakerId ? { ...s, name: tempName } : s));
      setEditingSpeakerId(null);
    }
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  const getSpeakerById = (id: string) => speakers.find(s => s.id === id) || speakers[0];

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500">
      {/* Left Panel: Controls */}
      <div className="w-80 flex flex-col gap-6 shrink-0">
         <GlassCard className="flex-col gap-6 flex h-full border-white/5 bg-[#0f0f11]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 px-1"><Users className="text-spark-accent" size={20} /> 声纹识别</h2>
            
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
               <button 
                 onClick={() => { setActiveTab('upload'); setIsRecording(false); }} 
                 className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'upload' ? 'bg-spark-accent text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
               >
                 上传文件
               </button>
               <button 
                 onClick={() => setActiveTab('record')} 
                 className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'record' ? 'bg-spark-accent text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
               >
                 实时录音
               </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
               {activeTab === 'upload' ? (
                 <div className="w-full border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center bg-white/[0.02] relative hover:bg-white/[0.05] hover:border-spark-accent/40 transition-all h-64 group">
                    <input 
                      type="file" 
                      onChange={e => e.target.files && setFile(e.target.files[0])} 
                      accept="audio/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <FileAudio size={40} className="text-white/20 mb-4 group-hover:text-spark-accent transition-colors" />
                    <p className="text-sm font-medium text-white/50 text-center px-4">{file ? file.name : "点击或拖拽音频文件到此处"}</p>
                 </div>
               ) : (
                 <div className="w-full h-64 flex flex-col items-center justify-center gap-8">
                    {!isRecording ? (
                      <div className="flex flex-col items-center gap-6">
                        <button 
                          onClick={() => { setSegments([]); setIsRecording(true); }} 
                          className="w-24 h-24 rounded-full bg-spark-accent flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                          <Mic size={40} />
                        </button>
                        <p className="text-sm font-bold text-white/30 uppercase tracking-widest">点击麦克风开启多说话人实时转写</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6 w-full px-4">
                        <div className="bg-red-500/10 px-6 py-2 rounded-full border border-red-500/20 flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                           <span className="text-2xl font-mono font-black text-white">{formatTime(recordTime)}</span>
                        </div>
                        <div className="w-full h-16 opacity-50"><Waveform isAnimating={true} color="#ef4444" /></div>
                        <button 
                          onClick={() => setIsRecording(false)} 
                          className="px-8 py-3 rounded-xl bg-white text-black font-black text-base flex items-center gap-3 hover:bg-white/90 active:scale-95 transition-all shadow-xl"
                        >
                          <StopCircle size={20} /> 停止录音
                        </button>
                      </div>
                    )}
                 </div>
               )}
            </div>

            {activeTab === 'upload' && (
              <button 
                onClick={processAudio} 
                disabled={!file || isProcessing} 
                className={`w-full py-4 rounded-xl font-black text-base uppercase tracking-wide transition-all shadow-xl mt-auto ${!file || isProcessing ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-spark-accent text-white hover:bg-blue-500'}`}
              >
                {isProcessing ? <div className="flex items-center justify-center gap-3"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 正在分析</div> : '开始识别'}
              </button>
            )}
         </GlassCard>
      </div>

      {/* Center Panel: Transcription View */}
      <div className="flex-1 flex flex-col gap-6">
         <GlassCard className="flex-1 flex flex-col overflow-hidden p-0 border-white/5 bg-[#0f0f11]">
            <div className="h-16 flex justify-between items-center px-8 border-b border-white/5 bg-white/[0.02]">
               <h2 className="font-black text-white text-lg tracking-tight">转写流 / Transcription Stream</h2>
               <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                  当前片段: {segments.length}
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
               {segments.length > 0 ? (
                 segments.map((seg) => {
                   const speaker = getSpeakerById(seg.speakerId);
                   return (
                     <div key={seg.id} className="flex gap-6 group animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-xl shrink-0 ${speaker.color} border border-white/20`}>
                           {speaker.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-3 mb-2">
                              <span className="font-black text-white text-base tracking-tight">{speaker.name}</span>
                              <span className="text-[10px] text-white/30 flex items-center gap-1.5 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                 <Clock size={12} className="text-spark-accent" /> {seg.startTime.toFixed(1)}s - {seg.endTime.toFixed(1)}s
                              </span>
                           </div>
                           <div className="text-white/80 leading-relaxed font-light text-xl bg-white/[0.03] p-6 rounded-[1.5rem] rounded-tl-none border border-white/5 shadow-inner">
                              {seg.text}
                           </div>
                        </div>
                     </div>
                   );
                 })
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-4">
                    <UserCircle size={64} className="opacity-20" />
                    <p className="text-xl font-bold italic">等待识别数据录入...</p>
                 </div>
               )}
            </div>
         </GlassCard>
      </div>

      {/* Right Panel: Speaker Management */}
      <div className="w-72 flex flex-col gap-6 shrink-0">
         <GlassCard className="flex-1 flex flex-col p-0 border-white/5 bg-[#0f0f11]">
            <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5 bg-white/[0.02]">
               <Settings2 size={18} className="text-spark-accent" />
               <h2 className="font-black text-white text-sm uppercase tracking-widest">说话人管理</h2>
            </div>

            <div className="p-4 border-b border-white/5">
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-white/20" />
                  <input 
                    placeholder="搜索说话人..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-spark-accent/40 placeholder:text-white/10 transition-all"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
               {activeSpeakers.length > 0 ? (
                 activeSpeakers.map((speaker) => (
                   <div 
                     key={speaker.id} 
                     className={`p-4 rounded-2xl border transition-all duration-300 ${editingSpeakerId === speaker.id ? 'bg-spark-accent/10 border-spark-accent/40 shadow-lg scale-[1.02]' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                   >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl shrink-0 ${speaker.color} border border-white/10 flex items-center justify-center text-white font-black`}>
                           {speaker.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                           {editingSpeakerId === speaker.id ? (
                             <input 
                               autoFocus
                               value={tempName}
                               onChange={(e) => setTempName(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && saveSpeakerName()}
                               className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none font-bold"
                             />
                           ) : (
                             <div className="text-sm font-black text-white truncate pr-2">{speaker.name}</div>
                           )}
                           <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
                              {segments.filter(s => s.speakerId === speaker.id).length} 个片段
                           </div>
                        </div>
                        
                        {editingSpeakerId === speaker.id ? (
                          <button 
                            onClick={saveSpeakerName}
                            className="p-2 bg-spark-accent rounded-lg text-white hover:bg-blue-500 transition-colors shadow-lg"
                          >
                             <Check size={16} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => startEditSpeaker(speaker.id, speaker.name)}
                            className="p-2 text-white/20 hover:text-spark-accent hover:bg-white/5 rounded-lg transition-all"
                          >
                             <Edit2 size={16} />
                          </button>
                        )}
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/10">
                    <Users size={32} className="mb-4 opacity-20" />
                    <p className="text-xs font-bold leading-relaxed">暂未检测到说话人<br/>开始录音或上传文件以识别</p>
                 </div>
               )}
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black text-white/30 uppercase tracking-widest">
                  <span>识别状态</span>
                  <span className={activeSpeakers.length > 0 ? "text-spark-accent" : "text-white/20"}>
                    {activeSpeakers.length > 0 ? "ACTIVE" : "WAITING"}
                  </span>
               </div>
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-spark-accent transition-all duration-1000 ${isRecording ? 'w-2/3 animate-pulse' : 'w-0'}`} />
               </div>
            </div>
         </GlassCard>
      </div>
    </div>
  );
};

export default Diarization;
