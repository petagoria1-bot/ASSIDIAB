import React, { useMemo } from 'react';
import Card from './Card';
import useTranslations from '../hooks/useTranslations';
import { usePatientStore } from '../store/patientStore';
import NurturePlantAnimation from './animations/NurturePlantAnimation';
import WaterDropIcon from './icons/WaterDropIcon';
import WalkIcon from './icons/WalkIcon';
import GlucoseDropIcon from './icons/GlucoseDropIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import SunIcon from './icons/SunIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import toast from 'react-hot-toast';

const DAILY_GOALS = {
    water_ml: 1500,
    activity_min: 30,
    glycemic_checks: 4,
    quiz: 1,
};

const TaskItem: React.FC<{ title: string; progress: string; isCompleted: boolean; onAction?: () => void; children: React.ReactNode; }> = 
({ title, progress, isCompleted, onAction, children }) => (
    <div className={`flex items-center justify-between p-2 rounded-lg transition-all ${isCompleted ? 'bg-emerald-main/10' : 'bg-slate-100/70'}`}>
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-main text-white' : 'bg-white'}`}>
                {children}
            </div>
            <div>
                <p className={`font-semibold text-sm ${isCompleted ? 'text-emerald-main' : 'text-text-main'}`}>{title}</p>
                <p className="text-xs text-text-muted">{progress}</p>
            </div>
        </div>
        {onAction && !isCompleted && (
            <button onClick={onAction} className="text-xs font-bold bg-white text-emerald-main px-2 py-1 rounded-md border border-emerald-main/50 hover:bg-emerald-main/10 transition-colors">
                +
            </button>
        )}
        {isCompleted && (
             <CheckCircleIcon className="w-6 h-6 text-emerald-main" />
        )}
    </div>
);


const ProgressCard: React.FC = () => {
  const t = useTranslations();
  const { todayProgress, mesures, logWater, logActivity } = usePatientStore();

  const dailyChecks = useMemo(() => {
    const today = new Date().toDateString();
    return mesures.filter(m => new Date(m.ts).toDateString() === today).length;
  }, [mesures]);

  if (!todayProgress) return null;

  const tasks = [
    { 
        id: 'water',
        title: t.progress_water, 
        progress: `${todayProgress.water_ml} / ${DAILY_GOALS.water_ml}ml`, 
        isCompleted: todayProgress.water_ml >= DAILY_GOALS.water_ml,
        onAction: () => { logWater(250); toast.success('+250ml !'); },
        icon: <WaterDropIcon className="w-5 h-5 text-info" />
    },
    { 
        id: 'activity',
        title: t.progress_activity,
        progress: `${todayProgress.activity_min} / ${DAILY_GOALS.activity_min}min`,
        isCompleted: todayProgress.activity_min >= DAILY_GOALS.activity_min,
        onAction: () => { logActivity(10); toast.success('+10min !'); },
        icon: <WalkIcon className="w-5 h-5 text-coral" />
    },
    { 
        id: 'checks',
        title: t.progress_checks,
        progress: `${dailyChecks} / ${DAILY_GOALS.glycemic_checks}`,
        isCompleted: dailyChecks >= DAILY_GOALS.glycemic_checks,
        icon: <GlucoseDropIcon className="w-5 h-5 text-turquoise-light" />
    },
    { 
        id: 'quiz',
        title: t.progress_quiz,
        progress: todayProgress.quiz_completed ? t.progress_completed : t.progress_pending,
        isCompleted: todayProgress.quiz_completed,
        icon: <LightbulbIcon className="w-5 h-5 text-honey-yellow" />
    },
  ];

  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const plantGrowth = completedTasks / totalTasks;

  return (
    <Card>
      <h2 className="font-display font-semibold text-xl text-text-title text-center mb-2">{t.progress_gardenTitle}</h2>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="w-28 h-28 flex-shrink-0">
          <NurturePlantAnimation progress={plantGrowth} />
        </div>

        <div className="w-full space-y-2">
            <h3 className="font-semibold text-text-muted text-sm text-center">{t.progress_dailyGoals}</h3>
            {tasks.map(task => (
                <TaskItem key={task.id} {...task}>
                    {task.icon}
                </TaskItem>
            ))}
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-200/80">
         <h3 className="font-semibold text-text-muted text-sm text-center mb-2">{t.progress_weeklyGoal}</h3>
         <div className="flex justify-around items-center bg-slate-100 p-1 rounded-pill">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                <div key={i} className="flex flex-col items-center">
                    <span className="text-xs font-bold text-text-muted">{day}</span>
                    <div className={`w-7 h-7 mt-1 rounded-full flex items-center justify-center ${i < 3 ? 'bg-white' : 'bg-slate-200'}`}>
                        {i < 2 && <SunIcon className="w-5 h-5 text-honey-yellow" />}
                    </div>
                </div>
            ))}
         </div>
      </div>
    </Card>
  );
};

export default ProgressCard;