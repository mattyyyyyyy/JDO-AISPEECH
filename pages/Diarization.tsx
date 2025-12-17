import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../components/GlassCard';
import Waveform from '../components/Waveform';
import { Upload, Users, Play, Clock, FileAudio, Edit2, Check, Mic, StopCircle } from 'lucide-react';
import { analyzeConversation, arrayBufferToBase64 } from '../services/geminiService';
import { SpeakerSegment, SpeakerIdentity } from '../types';

const Diarization: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [segments, setSegments] = useState<SpeakerSegment[]>([]);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const streamIntervalRef = useRef<number | null>(null);

  // Speaker Identities State
  const [speakers, setSpeakers] = useState<SpeakerIdentity[]>([
    { id: 'spk_1', name: '说话人 1', color: 'bg-blue-500' },
    { id: 'spk_2', name: '说话人 2', color: 'bg-purple-500' }
  ]);
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // Streaming Simulation
  useEffect(() => {
    if (isRecording) {
       let segmentCounter = 0;
       const mockPhrases = [
         { spk: 'spk_1', text: "大家好，欢迎参加今天的会议。" },
         { spk: 'spk_2', text: "谢谢。我们今天要讨论什么主题？" },
         { spk: 'spk_1', text: "主要是关于下一季度的产品规划。" },
         { spk: 'spk_2', text: "好的，我已经准备好相关数据了。" },
         { spk: 'spk_1', text: "太好了，让我们开始吧。" }
       ];
       
       streamIntervalRef.current = window.setInterval(() => {
          if (segmentCounter < mockPhrases.length) {
             const phrase = mockPhrases[segmentCounter];
             const now = segmentCounter * 3; // Approx time spacing
             
             const newSegment: SpeakerSegment = {
                id: `seg_${Date.now()}`,
                speakerId: phrase.spk,
                text: phrase.text,
                startTime: now,
                endTime: now + 2.5
             };
             
             setSegments(prev => [...prev, newSegment]);
             segmentCounter++;
          }
       }, 3000); // Add a new segment every 3 seconds
    } else {
       if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    }

    return () => { if (streamIntervalRef.current) clearInterval(streamIntervalRef.current); };
  }, [isRecording]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startRecording = () => {
    setRecordTime(0);
    setSegments([]); // Clear previous recording segments
    setIsRecording(true);
    setFile(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate creating a file from recording
    const mockFile = new File(["audio content"], "meeting_recording.wav", { type: "audio/wav" });
    setFile(mockFile);
  };

  const processAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    // Simulate processing for uploaded file
    setTimeout(() => {
       const mockSegments: SpeakerSegment[] = [
          { id: '1', speakerId: 'spk_1', text: "你好，能否解释一下声纹识别技术？", startTime: 0, endTime: 3.5 },
          { id: '2', speakerId: 'spk_2', text: "当然。它通过分析独特的音频特征来识别对话中的不同说话人。", startTime: 3.8, endTime: 8.0 },
          { id: '3', speakerId: 'spk_1', text: "听起来很神奇。它的准确率如何？", startTime: 8.5, endTime: 11.0 },
       ];
       setSegments(mockSegments);
       setIsProcessing(false);
    }, 2000);
  };

  const startEditing = (speaker: SpeakerIdentity) => {
    setEditingSpeakerId(speaker.id);
    setTempName(speaker.name);
  };

  const saveSpeakerName = () => {
    if (editingSpeakerId && tempName.trim()) {
      setSpeakers(prev => prev.map(s => s.id === editingSpeakerId ? { ...s, name: tempName } : s));
      setEditingSpeakerId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500">
      
      {/* Left: Input */}
      <div className="w-96 flex flex-col gap-6">
         <GlassCard className="flex-col gap-6 flex h-full">
            <h2 className="text-xl font-bold text-spark-text flex items-center gap-2">
              <Users className="text-spark-accent" /> 声纹识别
            </h2>
            
            {/* Tabs */}
            <div className="flex bg-spark-text/5 p-1 rounded-lg border border-spark-text/10">
               <button 
                 onClick={() => { setActiveTab('upload'); setIsRecording(false); }}
                 className={`flex-1 py-2 rounded text-xs font-bold transition-all ${activeTab === 'upload' ? 'bg-spark-text/10 text-white shadow-sm' : 'text-spark-muted hover:text-white'}`}
               >
                 上传文件
               </button>
               <button 
                 onClick={() => { setActiveTab('record'); }}
                 className={`flex-1 py-2 rounded text-xs font-bold transition-all ${activeTab === 'record' ? 'bg-spark-text/10 text-white shadow-sm' : 'text-spark-muted hover:text-white'}`}
               >
                 实时录音
               </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
               {activeTab === 'upload' ? (
                  <div className="w-full border-2 border-dashed border-spark-text/10 rounded-xl p-6 flex flex-col items-center justify-center bg-spark-text/5 relative hover:bg-spark-text/10 transition-colors h-64">
                    <input type="file" onChange={handleFileChange} accept="audio/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-12 h-12 rounded-full bg-spark-text/5 flex items-center justify-center mb-3">
                       <FileAudio size={24} className="text-spark-muted" />
                    </div>
                    <p className="text-sm text-spark-text/70 text-center px-4 truncate w-full">{file ? file.name : "点击上传或拖拽音频"}</p>
                    <p className="text-xs text-spark-muted/50 mt-2">支持 MP3, WAV, M4A</p>
                  </div>
               ) : (
                  <div className="w-full h-64 flex flex-col items-center justify-center gap-6">
                     {!isRecording ? (
                        <button 
                          onClick={startRecording}
                          className="w-20 h-20 rounded-full bg-spark-accent flex items-center justify-center text-white hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                        >
                           <Mic size={32} />
                        </button>
                     ) : (
                        <div className="flex flex-col items-center gap-4 w-full">
                           <div className="text-2xl font-mono font-bold text-red-500 animate-pulse">
                              {formatTime(recordTime)}
                           </div>
                           <div className="w-full h-16">
                              <Waveform isAnimating={true} color="#ef4444" />
                           </div>
                           <button 
                             onClick={stopRecording}
                             className="px-6 py-2 rounded-full bg-spark-text text-spark-bg font-bold flex items-center gap-2"
                           >
                              <StopCircle size={16} /> 停止录音
                           </button>
                        </div>
                     )}
                     {file && !isRecording && (
                        <div className="text-xs text-green-400 flex items-center gap-1">
                           <Check size={12} /> 录音已保存
                        </div>
                     )}
                  </div>
               )}
            </div>

            {activeTab === 'upload' && (
              <button 
                onClick={processAudio}
                disabled={!file || isProcessing}
                className={`
                  w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg mt-auto
                  ${!file || isProcessing
                    ? 'bg-spark-text/5 text-spark-muted cursor-not-allowed' 
                    : 'bg-gradient-to-r from-spark-accent to-spark-dark text-white hover:shadow-purple-500/25'}
                `}
              >
                {isProcessing ? '正在分析声纹...' : '开始识别与分离'}
              </button>
            )}
            {activeTab === 'record' && (
              <div className="mt-auto text-center text-xs text-spark-muted">
                 {isRecording ? "实时转写中..." : "点击麦克风开始录音"}
              </div>
            )}
         </GlassCard>
      </div>

      {/* Center: Transcript */}
      <div className="flex-1 flex flex-col gap-6">
         <GlassCard className="flex-1 flex flex-col overflow-hidden p-0">
            <div className="h-16 flex justify-between items-center px-6 border-b border-spark-text/10 bg-spark-text/5">
              <h2 className="font-bold text-spark-text">转写记录</h2>
              <div className="text-xs text-spark-muted font-mono">{activeTab === 'record' && isRecording ? '实时流式' : '00:11.0 总时长'}</div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
               {!segments.length && !isProcessing && !isRecording && (
                 <div className="h-full flex flex-col items-center justify-center text-spark-text/20">
                   <Users size={64} className="mb-4 opacity-50" />
                   <p>上传或录制音频以识别说话人</p>
                 </div>
               )}
               
               {isProcessing && (
                  <div className="space-y-6">
                     {[1,2,3].map(i => (
                        <div key={i} className="animate-pulse flex gap-4">
                           <div className="w-12 h-12 rounded-full bg-spark-text/10"></div>
                           <div className="flex-1 space-y-3 pt-2">
                              <div className="h-4 bg-spark-text/10 rounded w-32"></div>
                              <div className="h-16 bg-spark-text/5 rounded-xl w-full"></div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {segments.map((seg, idx) => {
                 const speaker = speakers.find(s => s.id === seg.speakerId) || speakers[0];
                 return (
                   <div key={seg.id} className="flex gap-4 group animate-in slide-in-from-bottom-2 fade-in">
                      <div className="flex flex-col items-center gap-1 pt-1">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${speaker.color}`}>
                           {speaker.name[0]}
                         </div>
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                           <span className="font-bold text-spark-text text-sm">{speaker.name}</span>
                           <span className="text-xs text-spark-muted flex items-center gap-1 font-mono"><Clock size={10} /> {seg.startTime.toFixed(1)}s</span>
                         </div>
                         <div className="relative group/text">
                            <p className="text-spark-text/80 leading-relaxed font-light text-lg glass-panel p-4 rounded-xl rounded-tl-none border-none bg-spark-text/5 hover:bg-spark-text/10 transition-colors">
                              {seg.text}
                              {idx === segments.length - 1 && isRecording && (
                                <span className="inline-block w-2 h-4 bg-spark-accent ml-2 animate-pulse align-middle" />
                              )}
                            </p>
                            <button className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-spark-bg/40 text-spark-muted hover:text-spark-text opacity-0 group-hover/text:opacity-100 transition-opacity">
                               <Play size={12} fill="currentColor" />
                            </button>
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>
         </GlassCard>
      </div>

      {/* Right: Speaker Manager */}
      {(segments.length > 0 || isRecording) && (
         <div className="w-72">
            <GlassCard className="h-full flex flex-col p-0">
               <div className="p-4 border-b border-spark-text/10 text-xs font-bold text-spark-muted uppercase tracking-widest">
                  检测到的说话人
               </div>
               <div className="p-4 space-y-3">
                  {speakers.map(speaker => (
                     <div key={speaker.id} className="flex items-center gap-3 p-3 rounded-xl bg-spark-text/5 border border-spark-text/5 hover:border-spark-text/20 transition-all">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${speaker.color}`}>
                           {speaker.name[0]}
                        </div>
                        
                        {editingSpeakerId === speaker.id ? (
                           <div className="flex-1 flex gap-2">
                              <input 
                                autoFocus
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="w-full bg-spark-bg text-spark-text text-xs p-1 rounded border border-spark-accent outline-none"
                              />
                              <button onClick={saveSpeakerName} className="text-spark-accent"><Check size={14} /></button>
                           </div>
                        ) : (
                           <>
                              <span className="text-spark-text text-sm font-medium flex-1 truncate">{speaker.name}</span>
                              <button onClick={() => startEditing(speaker)} className="text-spark-muted hover:text-spark-text transition-colors">
                                 <Edit2 size={12} />
                              </button>
                           </>
                        )}
                     </div>
                  ))}
               </div>
               <div className="mt-auto p-4 text-xs text-spark-muted text-center">
                  重命名说话人会自动更新所有转写片段。
               </div>
            </GlassCard>
         </div>
      )}
    </div>
  );
};

export default Diarization;