import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../components/GlassCard';
import Waveform from '../components/Waveform';
import { UploadCloud, Mic, Play, Trash2, ArrowRight, CheckCircle2, Square, StopCircle, Clock, FileAudio } from 'lucide-react';
import { RANDOM_READING_TEXTS, MOCK_VOICES } from '../constants';
import { CloneProject, Voice } from '../types';

const VoiceCloning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [creationStep, setCreationStep] = useState<1 | 2>(1); // 1: Input, 2: Create Form
  const [file, setFile] = useState<File | null>(null);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [readingText, setReadingText] = useState(RANDOM_READING_TEXTS[0]);
  
  // Form State
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Timers
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordTime(prev => {
          if (prev >= 180) {
            stopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startRecording = () => {
    setRecordTime(0);
    setIsRecording(true);
    // Pick random text
    setReadingText(RANDOM_READING_TEXTS[Math.floor(Math.random() * RANDOM_READING_TEXTS.length)]);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate creating a file from recording
    const mockFile = new File(["audio content"], "recorded_voice_sample.wav", { type: "audio/wav" });
    setFile(mockFile);
  };

  const handleCreate = () => {
     // Create new voice object to simulate backend creation
     const newVoice: Voice = {
       id: `custom_${Date.now()}`,
       name: projectName,
       gender: 'Male', // Defaulting for demo purposes
       language: 'Chinese',
       tags: ['Custom', 'Cloned'],
       category: 'Character',
       avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${projectName}`,
       isCustom: true,
       previewUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"
     };
     
     // Add to mock data
     MOCK_VOICES.push(newVoice);

     alert("声音模型创建成功！");
     setCreationStep(1);
     setFile(null);
     setProjectName('');
     setDescription('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* Step 1: Input Audio */}
      {creationStep === 1 && (
        <>
          <div className="text-center space-y-2 mb-4">
             <h1 className="text-3xl font-bold text-spark-text">克隆您的声音</h1>
             <p className="text-spark-muted">几分钟内创建您的数字声音分身。</p>
          </div>

          <GlassCard className="p-10 flex flex-col items-center gap-8 min-h-[500px]">
             {/* Tabs */}
             <div className="bg-spark-text/5 p-1 rounded-xl flex border border-spark-text/10 w-96">
                <button 
                  onClick={() => { setActiveTab('upload'); setIsRecording(false); setFile(null); }}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'bg-spark-text/10 text-spark-text shadow-sm' : 'text-spark-muted hover:text-spark-text'}`}
                >
                  <UploadCloud size={18} /> 上传音频
                </button>
                <button 
                   onClick={() => { setActiveTab('record'); setFile(null); }}
                   className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'record' ? 'bg-spark-text/10 text-spark-text shadow-sm' : 'text-spark-muted hover:text-spark-text'}`}
                >
                   <Mic size={18} /> 录制音频
                </button>
             </div>

             {/* Content Area */}
             <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center">
                
                {activeTab === 'upload' && !file && (
                   <div className="w-full h-80 border-2 border-dashed border-spark-text/10 rounded-3xl flex flex-col items-center justify-center bg-spark-text/[0.02] hover:bg-spark-text/[0.05] transition-all relative group cursor-pointer">
                      <input type="file" accept=".wav,.mp3,.flac,.m4a" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="w-20 h-20 rounded-full bg-spark-text/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                         <UploadCloud size={40} className="text-spark-accent" />
                      </div>
                      <h3 className="text-xl font-bold text-spark-text mb-2">上传或拖拽音频</h3>
                      <p className="text-spark-muted text-sm mb-8">WAV, MP3, FLAC, M4A • 最大 32MB</p>
                      <button className="px-6 py-2 rounded-lg bg-spark-text/10 text-spark-text text-sm font-medium border border-spark-text/10 group-hover:bg-spark-accent group-hover:border-spark-accent transition-colors">选择文件</button>
                   </div>
                )}

                {activeTab === 'record' && !file && (
                   <div className="w-full flex flex-col items-center gap-8">
                      {!isRecording ? (
                         <div className="text-center space-y-8 flex flex-col items-center">
                             <div className="bg-spark-text/5 p-8 rounded-2xl border border-spark-text/10 max-w-lg w-full">
                                <p className="text-spark-text/80 text-lg font-light leading-relaxed italic">"{readingText}"</p>
                                <div className="mt-4 text-xs text-spark-muted uppercase tracking-widest text-center">请朗读这段文本</div>
                             </div>
                             <div className="flex justify-center w-full">
                                <button 
                                  onClick={startRecording}
                                  className="w-24 h-24 rounded-full bg-spark-accent hover:bg-blue-500 shadow-[0_0_30px_rgba(82,178,205,0.5)] flex items-center justify-center text-white transition-all hover:scale-110"
                                >
                                    <Mic size={40} />
                                </button>
                             </div>
                         </div>
                      ) : (
                         <div className="flex flex-col items-center gap-8 w-full">
                            <div className="flex items-center gap-3 text-red-500 bg-red-500/10 px-6 py-2 rounded-full border border-red-500/20">
                               <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                               <span className="font-mono text-2xl font-bold">{formatTime(recordTime)}</span>
                               <span className="text-spark-muted text-sm">/ 03:00</span>
                            </div>
                            <div className="w-full h-32">
                               <Waveform isAnimating={true} color="#ef4444" />
                            </div>
                            <div className="bg-spark-text/5 p-6 rounded-2xl border border-spark-text/10 w-full">
                                <p className="text-spark-text text-xl text-center leading-relaxed">{readingText}</p>
                            </div>
                            <button 
                               onClick={stopRecording}
                               className="px-10 py-4 rounded-full bg-spark-text text-spark-bg font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                               <StopCircle size={24} /> 停止录音
                            </button>
                         </div>
                      )}
                   </div>
                )}

                {/* File Success State */}
                {file && (
                   <div className="w-full max-w-lg bg-spark-text/5 border border-spark-text/10 rounded-2xl p-6 animate-in zoom-in-95">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                            <CheckCircle2 size={32} />
                         </div>
                         <div>
                            <h3 className="text-lg font-bold text-spark-text">音频就绪</h3>
                            <p className="text-sm text-spark-text/50">{file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                         </div>
                         <button onClick={() => setFile(null)} className="ml-auto p-2 hover:bg-spark-text/10 rounded-lg text-spark-text/40 hover:text-red-400">
                            <Trash2 size={20} />
                         </button>
                      </div>
                      
                      <div className="flex gap-3">
                         <button className="flex-1 py-3 rounded-xl bg-spark-text/10 hover:bg-spark-text/20 text-spark-text font-medium flex items-center justify-center gap-2">
                            <Play size={18} /> 预览
                         </button>
                         <button 
                           onClick={() => setCreationStep(2)}
                           className="flex-[2] py-3 rounded-xl bg-spark-accent hover:bg-blue-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25 transition-all"
                         >
                            创建声音 <ArrowRight size={18} />
                         </button>
                      </div>
                   </div>
                )}

             </div>
          </GlassCard>
        </>
      )}

      {/* Step 2: Configure & Save */}
      {creationStep === 2 && (
        <div className="flex gap-8">
           {/* Preview Card */}
           <div className="w-1/3">
              <h3 className="text-sm font-bold text-spark-muted uppercase tracking-widest mb-4">预览卡片</h3>
              <GlassCard className="relative overflow-hidden group">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spark-dark to-spark-accent flex items-center justify-center text-white text-2xl font-bold">
                        {projectName ? projectName[0].toUpperCase() : 'V'}
                     </div>
                     <div>
                        <div className="text-spark-text font-bold text-lg">{projectName || '声音名称'}</div>
                        <div className="text-xs text-spark-muted mt-1 flex gap-2">
                           <span className="bg-spark-text/10 px-2 py-0.5 rounded text-[10px]">克隆版</span>
                           {isPublic ? <span className="text-green-400">公开</span> : <span className="text-spark-muted/50">私有</span>}
                        </div>
                     </div>
                  </div>
                  <p className="text-sm text-spark-text/60 line-clamp-2 mb-6">
                    {description || '未提供描述。'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-spark-muted">
                     <Clock size={12} /> 刚刚创建
                  </div>
              </GlassCard>
           </div>

           {/* Form */}
           <GlassCard className="flex-1 flex flex-col gap-6">
              <div className="flex items-center gap-2 mb-2">
                 <button onClick={() => setCreationStep(1)} className="text-spark-muted hover:text-spark-text text-sm">取消</button>
                 <div className="h-4 w-px bg-spark-text/20 mx-2"></div>
                 <h2 className="text-xl font-bold text-spark-text">声音详情</h2>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-spark-muted uppercase tracking-widest mb-2">声音名称</label>
                    <input 
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full bg-spark-bg border border-spark-text/10 rounded-xl p-4 text-spark-text focus:border-spark-accent outline-none transition-colors" 
                      placeholder="例如：我的旁白声音" 
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-spark-muted uppercase tracking-widest mb-2">描述</label>
                    <textarea 
                       value={description}
                       onChange={(e) => setDescription(e.target.value)}
                       className="w-full h-32 bg-spark-bg border border-spark-text/10 rounded-xl p-4 text-spark-text focus:border-spark-accent outline-none resize-none transition-colors" 
                       placeholder="描述该声音的特点..." 
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-spark-muted uppercase tracking-widest mb-2">可见性</label>
                    <div className="flex gap-4">
                       <button 
                         onClick={() => setIsPublic(false)}
                         className={`flex-1 p-4 rounded-xl border flex items-center gap-3 transition-all ${!isPublic ? 'bg-spark-accent/10 border-spark-accent' : 'bg-spark-text/5 border-spark-text/10 opacity-50'}`}
                       >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!isPublic ? 'border-spark-accent' : 'border-spark-text/30'}`}>
                             {!isPublic && <div className="w-2 h-2 rounded-full bg-spark-accent" />}
                          </div>
                          <div className="text-left">
                             <div className="text-spark-text font-bold text-sm">私有</div>
                             <div className="text-xs text-spark-muted">仅您可见</div>
                          </div>
                       </button>
                       <button 
                         onClick={() => setIsPublic(true)}
                         className={`flex-1 p-4 rounded-xl border flex items-center gap-3 transition-all ${isPublic ? 'bg-spark-accent/10 border-spark-accent' : 'bg-spark-text/5 border-spark-text/10 opacity-50'}`}
                       >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isPublic ? 'border-spark-accent' : 'border-spark-text/30'}`}>
                             {isPublic && <div className="w-2 h-2 rounded-full bg-spark-accent" />}
                          </div>
                          <div className="text-left">
                             <div className="text-spark-text font-bold text-sm">公开库</div>
                             <div className="text-xs text-spark-muted">社区可见</div>
                          </div>
                       </button>
                    </div>
                 </div>

                 <button 
                   onClick={handleCreate}
                   disabled={!projectName}
                   className={`
                     w-full py-4 rounded-xl font-bold text-lg mt-4 transition-all
                     ${!projectName ? 'bg-spark-text/5 text-spark-muted' : 'bg-gradient-to-r from-spark-dark to-spark-accent text-white shadow-lg hover:shadow-blue-500/25'}
                   `}
                 >
                    完成模型构建
                 </button>
              </div>
           </GlassCard>
        </div>
      )}

    </div>
  );
};

export default VoiceCloning;