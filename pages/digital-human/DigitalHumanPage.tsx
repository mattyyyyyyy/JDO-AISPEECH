
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Construction, Sparkles, Cpu } from 'lucide-react';

const DigitalHumanPage: React.FC = () => {
  const { lang } = useLanguage();
  
  return (
    <div className="w-full h-full animate-in fade-in duration-700 bg-spark-bg overflow-hidden relative flex items-center justify-center">
      {/* Immersive Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-spark-accent/5 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-spark-dark/5 blur-[150px] animate-pulse-slow" />
          <div className="absolute inset-0 bg-dot-pattern opacity-10" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center p-12 max-w-2xl">
        <div className="relative mb-10 group">
           {/* Decorative Rings */}
           <div className="absolute inset-0 rounded-full bg-spark-accent/20 blur-2xl group-hover:bg-spark-accent/30 transition-all duration-500" />
           <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1c] to-[#0f0f11] border border-white/10 flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-105 duration-500">
              <Cpu size={56} className="text-spark-accent drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              
              {/* Floating Sparkles */}
              <div className="absolute -top-2 -right-2">
                <Sparkles size={24} className="text-yellow-400 animate-pulse" />
              </div>
           </div>
        </div>

        <h1 className="text-5xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
           {lang === 'CN' ? '数字人交互' : 'Digital Human'}
           <span className="block text-2xl mt-2 font-medium bg-gradient-to-r from-spark-accent to-indigo-400 bg-clip-text text-transparent">
             {lang === 'CN' ? '即将开启' : 'Coming Soon'}
           </span>
        </h1>

        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-spark-accent to-transparent mb-8" />

        <p className="text-white/40 text-lg font-light leading-relaxed mb-10">
           {lang === 'CN' 
             ? '我们正在利用最前沿的 AI 技术驱动虚拟形象，为您打造极具沉浸感的数字人实时对话体验。' 
             : 'We are leveraging cutting-edge AI technology to drive virtual avatars, creating a highly immersive real-time dialogue experience for you.'}
        </p>
        
        {/* Progress/Status Indicator */}
        <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
           <div className="flex gap-1.5">
             {[1, 2, 3].map(i => (
               <div key={i} className="w-1.5 h-1.5 rounded-full bg-spark-accent animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
             ))}
           </div>
           <span className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">
             {lang === 'CN' ? '正在进行深度模型训练' : 'Training Deep Neural Models'}
           </span>
        </div>
      </div>
    </div>
  );
};

export default DigitalHumanPage;
