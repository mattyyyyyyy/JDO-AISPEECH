
import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../../components/GlassCard';
import Waveform from '../../components/Waveform';
import { Users, Clock, FileAudio, Edit2, Check, Mic, StopCircle, Play } from 'lucide-react';
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

  const [speakers, setSpeakers] = useState<SpeakerIdentity[]>([
    { id: 'spk_1', name: '说话人 1', color: 'bg-blue-500' },
    { id: 'spk_2', name: '说话人 2', color: 'bg-purple-500' }
  ]);
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => setRecordTime(prev => prev + 1), 1000);
      let segmentCounter = 0;
      const mockPhrases = [
        { spk: 'spk_1', text: "大家好，欢迎参加今天的会议。" },
        { spk: 'spk_2', text: "谢谢。我们今天要讨论什么主题？" }
      ];
      streamIntervalRef.current = window.setInterval(() => {
          if (segmentCounter < mockPhrases.length) {
             const phrase = mockPhrases[segmentCounter];
             const newSegment: SpeakerSegment = { id: `seg_${Date.now()}`, speakerId: phrase.spk, text: phrase.text, startTime: segmentCounter * 3, endTime: segmentCounter * 3 + 2.5 };
             setSegments(prev => [...prev, newSegment]);
             segmentCounter++;
          }
       }, 3000);
    } else {
       if (timerRef.current) clearInterval(timerRef.current);
       if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); if (streamIntervalRef.current) clearInterval(streamIntervalRef.current); };
  }, [isRecording]);

  const processAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
       const mockSegments: SpeakerSegment[] = [{ id: '1', speakerId: 'spk_1', text: "你好，能否解释一下声纹识别技术？", startTime: 0, endTime: 3.5 }];
       setSegments(mockSegments); setIsProcessing(false);
    }, 2000);
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500">
      <div className="w-96 flex flex-col gap-6">
         <GlassCard className="flex-col gap-6 flex h-full">
            <h2 className="text-xl font-bold text-spark-text flex items-center gap-2"><Users className="text-spark-accent" /> 声纹识别</h2>
            <div className="flex bg-spark-text/5 p-1 rounded-lg border border-spark-text/10">
               <button onClick={() => { setActiveTab('upload'); setIsRecording(false); }} className={`flex-1 py-2 rounded text-xs font-bold transition-all ${activeTab === 'upload' ? 'bg-spark-text/10 text-white' : 'text-spark-muted'}`}>上传文件</button>
               <button onClick={() => setActiveTab('record')} className={`flex-1 py-2 rounded text-xs font-bold transition-all ${activeTab === 'record' ? 'bg-spark-text/10 text-white' : 'text-spark-muted'}`}>实时录音</button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
               {activeTab === 'upload' ? <div className="w-full border-2 border-dashed border-spark-text/10 rounded-xl p-6 flex flex-col items-center justify-center bg-spark-text/5 relative hover:bg-spark-text/10 transition-colors h-64"><input type="file" onChange={e => e.target.files && setFile(e.target.files[0])} accept="audio/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><FileAudio size={24} className="text-spark-muted mb-3" /><p className="text-sm text-spark-text/70">{file ? file.name : "点击上传音频"}</p></div> : <div className="w-full h-64 flex flex-col items-center justify-center gap-6">{!isRecording ? <button onClick={() => setIsRecording(true)} className="w-20 h-20 rounded-full bg-spark-accent flex items-center justify-center text-white"><Mic size={32} /></button> : <div className="flex flex-col items-center gap-4 w-full"><div className="text-2xl font-mono font-bold text-red-500 animate-pulse">{formatTime(recordTime)}</div><div className="w-full h-16"><Waveform isAnimating={true} color="#ef4444" /></div><button onClick={() => setIsRecording(false)} className="px-6 py-2 rounded-full bg-spark-text text-spark-bg font-bold flex items-center gap-2"><StopCircle size={16} /> 停止</button></div>}</div>}
            </div>
            {activeTab === 'upload' && <button onClick={processAudio} disabled={!file || isProcessing} className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg mt-auto ${!file || isProcessing ? 'bg-spark-text/5 text-spark-muted cursor-not-allowed' : 'bg-gradient-to-r from-spark-accent to-spark-dark text-white'}`}>{isProcessing ? '正在分析...' : '开始识别'}</button>}
         </GlassCard>
      </div>
      <div className="flex-1 flex flex-col gap-6">
         <GlassCard className="flex-1 flex flex-col overflow-hidden p-0">
            <div className="h-16 flex justify-between items-center px-6 border-b border-spark-text/10 bg-spark-text/5"><h2 className="font-bold text-spark-text">转写记录</h2></div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {segments.map((seg, idx) => {
                 const speaker = speakers.find(s => s.id === seg.speakerId) || speakers[0];
                 return (
                   <div key={seg.id} className="flex gap-4 group animate-in slide-in-from-bottom-2 fade-in">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${speaker.color}`}>{speaker.name[0]}</div>
                      <div className="flex-1"><div className="flex items-center gap-3 mb-2"><span className="font-bold text-spark-text text-sm">{speaker.name}</span><span className="text-xs text-spark-muted flex items-center gap-1 font-mono"><Clock size={10} /> {seg.startTime.toFixed(1)}s</span></div><p className="text-spark-text/80 leading-relaxed font-light text-lg glass-panel p-4 rounded-xl rounded-tl-none border-none bg-spark-text/5">{seg.text}</p></div>
                   </div>
                 );
               })}
            </div>
         </GlassCard>
      </div>
    </div>
  );
};

export default Diarization;
