
import React, { useState, useEffect } from 'react';
import { Sparkles, History, LayoutDashboard, Settings, RefreshCcw, Bell } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { PlanDisplay } from './components/PlanDisplay';
import { PomodoroTimer } from './components/PomodoroTimer';
import { processBrainDump, generateDailyPlan, breakdownTask } from './geminiService';
import { DailyPlan, Task } from './types';

const App: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'history'>('plan');

  const handleProcessInput = async (text: string, images: string[], audio?: string) => {
    setIsProcessing(true);
    try {
      const extractedTasks = await processBrainDump({ text, images, audio });
      const combinedTasks = [...tasks, ...extractedTasks];
      setTasks(combinedTasks);
      
      const plan = await generateDailyPlan(combinedTasks);
      setDailyPlan(plan);
      setActiveTab('plan');
    } catch (error) {
      console.error("Workflow failed", error);
      alert("Something went wrong with the AI organizer. Please try again!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBreakdown = async (task: Task) => {
    try {
      const subtasks = await breakdownTask(task);
      if (dailyPlan) {
        const updatedItems = dailyPlan.items.map(item => {
          if (item.task.id === task.id) {
            return {
              ...item,
              task: { ...item.task, subtasks }
            };
          }
          return item;
        });
        setDailyPlan({ ...dailyPlan, items: updatedItems });
      }
    } catch (error) {
      console.error("Failed to breakdown task", error);
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    if (dailyPlan) {
      const updatedItems = dailyPlan.items.map(item => {
        if (item.task.id === taskId) {
          return {
            ...item,
            task: { ...item.task, isCompleted: !item.task.isCompleted }
          };
        }
        return item;
      });
      setDailyPlan({ ...dailyPlan, items: updatedItems });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-100 flex-shrink-0 flex flex-col z-50">
        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-bold font-outfit text-slate-800 tracking-tight">FocusFlow</h1>
          </div>
          
          <nav className="space-y-1 mb-8">
            <button 
              onClick={() => setActiveTab('plan')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'plan' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={20} />
              Daily Plan
            </button>
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all"
            >
              <RefreshCcw size={20} />
              Re-schedule
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'history' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <History size={20} />
              Past Journeys
            </button>
          </nav>

          {/* Pomodoro Timer in Sidebar */}
          <div className="mt-auto pt-4">
            <PomodoroTimer />
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-50 space-y-1 bg-white">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all">
            <Settings size={20} />
            Settings
          </button>
          <div className="flex items-center gap-3 px-4 py-4 mt-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
              <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Your ADHD Ally</p>
              <p className="text-[10px] text-slate-400">Pro Plan Active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-h-screen overflow-y-auto pb-20">
        <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-40 px-6 py-6 flex justify-between items-center border-b border-slate-200/50">
          <div>
            <h2 className="text-2xl font-bold font-outfit text-slate-900">
              {activeTab === 'plan' ? "Today's Roadmap" : "Past Journeys"}
            </h2>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-10">
          {activeTab === 'plan' ? (
            <>
              <InputSection onProcess={handleProcessInput} isProcessing={isProcessing} />
              
              {!dailyPlan && !isProcessing && (
                <div className="py-20 flex flex-col items-center text-center space-y-4 opacity-60">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-300">
                    <Sparkles size={48} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 font-outfit">Nothing scheduled yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">
                      Use text, images, or voice to tell me what's on your mind. I'll take it from there.
                    </p>
                  </div>
                </div>
              )}

              {dailyPlan && (
                <PlanDisplay 
                  plan={dailyPlan} 
                  onBreakdown={handleBreakdown} 
                  onToggleComplete={toggleTaskComplete}
                />
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <History size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">History features are coming soon!</p>
              <p className="text-sm">We're focusing on making your today great first.</p>
            </div>
          )}
        </div>
      </main>

      {/* Quick Access Mobile Toggle (Floating Action) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button 
          onClick={() => setActiveTab('plan')}
          className="w-14 h-14 bg-indigo-600 rounded-full text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
        >
          <Sparkles size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;
