import React, { useState, useEffect, useRef } from 'react';
import GlassCard from '../components/GlassCard';
import Waveform from '../components/Waveform';
import { Mic, Square, RotateCcw, History, FileText, Clock, ChevronRight } from 'lucide-react';

const ASR: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<{time: string, text: string}[]>([]);
  const MAX_DURATION = 180; // 3 minutes

  // Mock streaming effect
  useEffect(() => {
    let streamInterval: any;
    let timerInterval: any;

    if (isRecording) {
      timerInterval = window.setInterval(() => {
        setDuration(prev => {
          if (prev >= MAX_DURATION) {
            handleStop();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);

      const phrases = ["欢迎使用 Audio Spark。", "正在识别您的声音。", "今天天气不错。", "深度学习模型正在处理这段音频。"];
      let index = 0;
      streamInterval = setInterval(() => {
        setTranscription(prev => prev + phrases[index % phrases.length]);
        index++;
      }, 800);
    } 

    return () => {
      clearInterval(timerInterval);
      clearInterval(streamInterval);
    };
  }, [isRecording]);

  const handleStart = () => {
    if (transcription) {
      // Save to history before clearing
      setHistory(prev => [{ time: new Date().toLocaleTimeString(), text: transcription }, ...prev]);
    }
    setTranscription('');
    setDuration(0);
    setIsRecording(true);
  };

  const handleStop = () => {
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Left Control Panel */}
      <div className="w-[400px] flex flex-col gap-6">
        <GlassCard className="flex-1 flex flex-col items-center justify-center relative border-t border-spark-text/20 bg-gradient-to-b from-spark-text/5 to-spark-bg/40">
           
           {isRecording && (
             <div className="absolute top-10 left-0 right-0 flex justify-center">
                <div className="bg-spark-text/5 backdrop-blur-md px-4 py-2 rounded-full border border-spark-text/10 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   <span className="font-mono text-xl font-bold text-spark-text">{formatTime(duration)}</span>
                   <span className="text-spark-muted text-xs font-mono">/ 03:00</span>
                </div>
             </div>
           )}

           <div className="relative group">
             {/* Breathing rings */}
             {isRecording && (
               <>
                 <div className="absolute inset-0 rounded-full bg-spark-accent/20 animate-ping" />
                 <div className="absolute inset-[-20px] rounded-full bg-spark-accent/10 animate-pulse" />
               </>
             )}
             
             <button 
                onClick={isRecording ? handleStop : handleStart}
                className={`
                  relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl
                  ${isRecording 
                    ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-[0_0_50px_rgba(239,68,68,0.4)] scale-110' 
                    : 'bg-gradient-to-br from-spark-accent to-spark-dark shadow-[0_0_50px_rgba(33,74,150,0.3)] hover:scale-105'}
                `}
              >
                {isRecording ? <Square size={40} fill="white" className="text-white" /> : <Mic size={48} className="text-white" />}
              </button>
           </div>
           
           <h2 className="text-2xl font-bold text-spark-text mt-8 mb-2">
             {isRecording ? '正在聆听...' : '开始识别'}
           </h2>
           <p className="text-spark-muted text-center px-8 leading-relaxed">
             {isRecording ? '请清晰说话，我正在实时转写您的声音。' : '点击麦克风开始。最长支持 3 分钟。'}
           </p>

           {isRecording && (
              <div className="w-full h-16 mt-8 px-4">
                 <Waveform isAnimating={true} color="#214a96" />
              </div>
           )}
           
           {!isRecording && transcription && (
              <button onClick={handleStart} className="mt-8 flex items-center gap-2 px-6 py-2 rounded-full bg-spark-text/5 hover:bg-spark-text/10 transition-colors text-spark-text/60 hover:text-spark-text border border-spark-text/10">
                <RotateCcw size={16} /> 新对话
              </button>
           )}
        </GlassCard>
      </div>

      {/* Right Content Panel */}
      <GlassCard className="flex-1 relative flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <div className="h-16 border-b border-spark-text/10 flex items-center justify-between px-6 bg-spark-text/5">
             <div className="flex items-center gap-3">
               <FileText className="text-spark-accent" size={20} />
               <span className="font-bold text-spark-text">实时转写</span>
             </div>
             <button 
               onClick={() => setShowHistory(!showHistory)}
               className={`p-2 rounded-lg transition-all flex items-center gap-2 ${showHistory ? 'bg-spark-accent/20 text-spark-accent' : 'text-spark-muted hover:text-spark-text hover:bg-spark-text/5'}`}
             >
               <History size={18} />
               <span className="text-sm">历史记录</span>
             </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
             {/* Text Area */}
             <div className="flex-1 p-8 overflow-y-auto">
                {transcription ? (
                  <p className="text-xl text-spark-text/90 leading-loose font-light whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2">
                    {transcription}
                    <span className="inline-block w-2 h-5 bg-spark-accent ml-1 animate-pulse align-middle"></span>
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-spark-muted/50">
                     <Mic size={64} className="mb-4 opacity-50" />
                     <p className="text-lg">等待语音输入...</p>
                  </div>
                )}
             </div>

             {/* History Drawer */}
             <div className={`
                w-80 border-l border-spark-text/10 bg-spark-bg/90 backdrop-blur-xl transition-all duration-300 flex flex-col
                ${showHistory ? 'mr-0' : '-mr-80'}
             `}>
                <div className="p-4 text-xs font-bold text-spark-muted uppercase tracking-widest border-b border-spark-text/5">
                  最近会话
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                   {history.length === 0 && <div className="text-spark-muted text-sm text-center py-4">暂无历史记录</div>}
                   {history.map((item, i) => (
                     <div key={i} className="group p-4 rounded-xl bg-spark-text/5 hover:bg-spark-text/10 border border-spark-text/5 hover:border-spark-text/20 transition-all cursor-pointer">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-spark-accent text-xs font-mono">{item.time}</span>
                           <ChevronRight size={14} className="text-spark-text/20 group-hover:text-spark-text" />
                        </div>
                        <p className="text-spark-text/60 text-sm line-clamp-3 leading-relaxed">{item.text}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
      </GlassCard>
    </div>
  );
};

export default ASR;