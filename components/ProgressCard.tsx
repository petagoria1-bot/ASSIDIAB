import React, { useMemo } from 'react';
import Card from './Card.tsx';
import useTranslations from '../hooks/useTranslations.ts';
import { usePatientStore } from '../store/patientStore.ts';
import NurturePlantAnimation from './animations/NurturePlantAnimation.tsx';
import WaterDropIcon from './icons/WaterDropIcon.tsx';
import WalkIcon from './icons/WalkIcon.tsx';
import GlucoseDropIcon from './icons/GlucoseDropIcon.tsx';
import LightbulbIcon from './icons/LightbulbIcon.tsx';
import CheckCircleIcon from './icons/CheckCircleIcon.tsx';
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
                    {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : children}
                </div>
                <div>
                    <p className={`font-semibold text-sm ${isCompleted ? 'text-emerald-main' : 'text-text-main'}`}>{title}</p>
                    <p className="text-xs text-text-muted">{progress}</p>
                </div>
            </div>
            {onAction && !isCompleted && (
                <button
                    onClick={onAction}
                    className="text-lg font-bold bg-white text-emerald-main px-3 py-0 leading-none rounded-md border border-emerald-main/50 hover:bg-emerald-main/10 transition-colors"
                    aria-label={`Ajouter ${title}`}
                >
                    +
                </button>
            )}
        </div>
    );

const ProgressCard: React.FC = () => {
    const { todayProgress, logWater, logActivity, mesures } = usePatientStore();
    const t = useTranslations();

    const todayMeasuresCount = useMemo(() => {
        const today = new Date().toDateString();
        return mesures.filter(m => new Date(m.ts).toDateString() === today).length;
    }, [mesures]);

    if (!todayProgress) {
        return (
            <Card>
                <div className="h-48 flex items-center justify-center text-text-muted">
                    {t.common_loading}
                </div>
            </Card>
        );
    }

    const progressValues = {
        water: todayProgress.water_ml,
        activity: todayProgress.activity_min,
        checks: todayMeasuresCount,
        quiz: todayProgress.quiz_completed ? 1 : 0,
    };

    const overallProgress = useMemo(() => {
        const waterProgress = Math.min(1, progressValues.water / DAILY_GOALS.water_ml);
        const activityProgress = Math.min(1, progressValues.activity / DAILY_GOALS.activity_min);
        const checksProgress = Math.min(1, progressValues.checks / DAILY_GOALS.glycemic_checks);
        const quizProgress = Math.min(1, progressValues.quiz / DAILY_GOALS.quiz);
        return (waterProgress + activityProgress + checksProgress + quizProgress) / 4;
    }, [progressValues]);

    const handleLogWater = () => {
        logWater(250); // Log 250ml at a time
        toast.success('+250ml ' + t.progress_water);
    };

    const handleLogActivity = () => {
        logActivity(10); // Log 10 mins at a time
        toast.success('+10min ' + t.progress_activity);
    };

    return (
        <Card>
            <h2 className="font-display font-semibold text-xl text-text-title mb-3">{t.progress_gardenTitle}</h2>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 flex items-center justify-center">
                    <NurturePlantAnimation progress={overallProgress} />
                </div>
                <div className="col-span-2 space-y-2">
                    <TaskItem
                        title={t.progress_water}
                        progress={`${progressValues.water} / ${DAILY_GOALS.water_ml}ml`}
                        isCompleted={progressValues.water >= DAILY_GOALS.water_ml}
                        onAction={handleLogWater}
                    >
                        <WaterDropIcon className="w-5 h-5 text-info" />
                    </TaskItem>
                    <TaskItem
                        title={t.progress_activity}
                        progress={`${progressValues.activity} / ${DAILY_GOALS.activity_min}min`}
                        isCompleted={progressValues.activity >= DAILY_GOALS.activity_min}
                        onAction={handleLogActivity}
                    >
                        <WalkIcon className="w-5 h-5 text-emerald-main" />
                    </TaskItem>
                    <TaskItem
                        title={t.progress_checks}
                        progress={`${progressValues.checks} / ${DAILY_GOALS.glycemic_checks}`}
                        isCompleted={progressValues.checks >= DAILY_GOALS.glycemic_checks}
                    >
                        <GlucoseDropIcon className="w-6 h-6 text-turquoise-light" />
                    </TaskItem>
                    <TaskItem
                        title={t.progress_quiz}
                        progress={progressValues.quiz >= DAILY_GOALS.quiz ? t.progress_completed : t.progress_pending}
                        isCompleted={progressValues.quiz >= DAILY_GOALS.quiz}
                    >
                        <LightbulbIcon className="w-5 h-5 text-warning" />
                    </TaskItem>
                </div>
            </div>
        </Card>
    );
};

export default ProgressCard;
