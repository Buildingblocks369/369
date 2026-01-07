
import React from 'react';
import { Clock, CheckCircle2, Zap, Target, Coffee, AlertCircle } from 'lucide-react';
import { DailyPlan, EnergyLevel, Priority, Task } from '../types';

interface PlanDisplayProps {
  plan: DailyPlan;
  onBreakdown: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

const EnergyBadge = ({ level }: { level: EnergyLevel }) => {
  const colors = {
    [EnergyLevel.LOW]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [EnergyLevel.MEDIUM]: 'bg-amber-50 text-amber-600 border-amber-100',
    [EnergyLevel.HIGH]: 'bg-rose-50 text-rose-600 border-rose-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[level]}`}>
      {level} Energy
    </span>
  );
};

const PriorityBadge = ({ level }: { level: Priority }) => {
  const colors = {
    [Priority.LOW]: 'bg-slate-50 text-slate-600 border-slate-100',
    [Priority.MEDIUM]: 'bg-orange-50 text-orange-600 border-orange-100',
    [Priority.HIGH]: 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase flex items-center gap-1 ${colors[level]}`}>
      {level === Priority.HIGH && <AlertCircle size={10} />}
      {level} Priority
    </span>
  );
};

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onBreakdown, onToggleComplete }) => {
  if (!plan || plan.items.length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Daily Goal Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
        <div className="flex items-center gap-3 mb-2 opacity-80 uppercase tracking-widest text-[10px] font-bold">
          <Target size={14} />
          Your Main Focus for Today
        </div>
        <h3 className="text-2xl font-bold font-outfit leading-tight">
          {plan.focusGoal}
        </h3>
      </div>

      <div className="relative space-y-4">
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100 hidden sm:block"></div>
        
        {plan.items.map((item, idx) => {
          const isBreak = item.task.title.toLowerCase().includes('break');
          const isHighPriority = item.task.priority === Priority.HIGH;
          
          return (
            <div key={idx} className="relative group flex flex-col sm:flex-row gap-4 items-start">
              {/* Time */}
              <div className="flex items-center gap-3 sm:w-24 shrink-0 sm:pt-4">
                <div className={`w-12 h-12 rounded-full border shadow-sm flex items-center justify-center z-10 ${
                  isHighPriority ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-400'
                }`}>
                  <Clock size={16} />
                </div>
                <div className="sm:hidden font-bold text-slate-800">{item.startTime}</div>
              </div>
              
              <div className={`hidden sm:block absolute left-[1.375rem] top-[3rem] w-3 h-3 rounded-full border-2 z-20 ${
                isHighPriority ? 'bg-red-500 border-white' : 'bg-white border-indigo-500'
              }`}></div>

              {/* Task Card */}
              <div className={`flex-1 w-full bg-white rounded-2xl p-5 border transition-all ${
                item.task.isCompleted 
                ? 'opacity-60 grayscale bg-slate-50' 
                : isHighPriority 
                  ? 'shadow-lg border-red-100 ring-2 ring-red-500/5' 
                  : 'shadow-sm hover:shadow-md border-slate-100'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`hidden sm:block text-xs font-bold px-2 py-1 rounded ${
                    isHighPriority ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-500'
                  }`}>
                    {item.startTime} - {item.endTime}
                  </span>
                  <div className="flex items-center gap-2">
                    {isBreak ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                        Rest Period
                      </span>
                    ) : (
                      <>
                        <PriorityBadge level={item.task.priority} />
                        <EnergyBadge level={item.task.energyRequired} />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => onToggleComplete(item.task.id)}
                    className={`mt-1 transition-colors ${item.task.isCompleted ? 'text-emerald-500' : isHighPriority ? 'text-red-300 hover:text-red-500' : 'text-slate-300 hover:text-indigo-400'}`}
                  >
                    <CheckCircle2 size={24} strokeWidth={item.task.isCompleted ? 3 : 2} />
                  </button>
                  
                  <div className="flex-1">
                    <h4 className={`text-lg font-bold font-outfit ${item.task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.task.title}
                    </h4>
                    {item.task.description && (
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.task.description}</p>
                    )}
                    
                    {item.task.subtasks && item.task.subtasks.length > 0 && (
                      <div className="mt-3 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mini-Steps</div>
                        {item.task.subtasks.map((step, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <div className={`w-1.5 h-1.5 rounded-full ${isHighPriority ? 'bg-red-400' : 'bg-indigo-400'}`}></div>
                            {step}
                          </div>
                        ))}
                      </div>
                    )}

                    {!item.task.isCompleted && !isBreak && !item.task.subtasks && (
                      <button 
                        onClick={() => onBreakdown(item.task)}
                        className={`mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                          isHighPriority ? 'text-red-600 hover:text-red-800' : 'text-indigo-600 hover:text-indigo-800'
                        }`}
                      >
                        <Zap size={14} />
                        Break it down for me
                      </button>
                    )}
                  </div>

                  {isBreak && <Coffee className="text-blue-300 shrink-0" size={28} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
