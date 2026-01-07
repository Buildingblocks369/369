
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Bell, BellOff } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    if (notificationsEnabled) {
      const title = mode === 'work' ? 'Time for a break!' : 'Break over! Back to focus.';
      new Notification(title);
    }
    
    // Play a gentle beep
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);

    setIsActive(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      setMode('work');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') setNotificationsEnabled(true);
      });
    } else {
      setNotificationsEnabled(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div className={`rounded-2xl p-4 border transition-all ${
      mode === 'work' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-emerald-600 border-emerald-400 text-white'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80">
          {mode === 'work' ? <Zap size={14} /> : <Coffee size={14} />}
          {mode === 'work' ? 'Focus Mode' : 'Break Time'}
        </div>
        <button onClick={toggleNotifications} className="opacity-60 hover:opacity-100 transition-opacity">
          {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
        </button>
      </div>

      <div className="text-4xl font-black font-outfit text-center mb-4 tracking-tighter">
        {formatTime(timeLeft)}
      </div>

      {/* Mini Progress Bar */}
      <div className="h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{ width: `${100 - progress}%` }}
        />
      </div>

      <div className="flex justify-center gap-3">
        <button 
          onClick={toggleTimer}
          className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          {isActive ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-90 transition-transform"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};
