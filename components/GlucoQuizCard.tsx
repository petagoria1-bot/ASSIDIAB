import React, { useState, useEffect } from 'react';
import Card from './Card.tsx';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import type { QuizQuestion } from '../data/quizData.ts';
import LightbulbIcon from './icons/LightbulbIcon.tsx';
import { usePatientStore } from '../store/patientStore.ts';


const GlucoQuizCard: React.FC = () => {
    const t = useTranslations();
    const { quizData, quiz_title, quiz_nextQuestion } = t;
    const { logQuizCompleted } = usePatientStore();

    const [question, setQuestion] = useState<QuizQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const selectNewQuestion = () => {
        const randomIndex = Math.floor(Math.random() * quizData.length);
        setQuestion(quizData[randomIndex]);
        setSelectedAnswer(null);
        setIsAnswered(false);
    };

    useEffect(() => {
        selectNewQuestion();
    }, [quizData]); // Rerun if language changes

    const handleAnswerClick = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
        setIsAnswered(true);
        logQuizCompleted();
    };

    if (!question) return null;

    return (
        <Card>
            <div className="flex items-center text-text-title mb-3">
                <LightbulbIcon className="w-7 h-7" />
                <h2 className="font-display font-semibold text-xl ms-2">{quiz_title}</h2>
            </div>
            <p className="font-semibold text-text-main mb-4">{question.question}</p>
            
            <div className="space-y-2">
                {question.options.map((option, index) => {
                    const isCorrect = index === question.correctAnswerIndex;
                    const isSelected = selectedAnswer === index;
                    let buttonClass = 'w-full text-start p-3 rounded-button border text-sm font-semibold transition-all duration-200 disabled:cursor-default';

                    if (isAnswered) {
                        if (isCorrect) {
                            buttonClass += ' bg-jade text-white border-jade';
                        } else if (isSelected) {
                            buttonClass += ' bg-danger text-white border-danger';
                        } else {
                            buttonClass += ' bg-slate-100 border-slate-200 text-text-muted';
                        }
                    } else {
                        buttonClass += ' bg-white border-slate-300 hover:bg-slate-50';
                    }

                    return (
                        <button key={index} onClick={() => handleAnswerClick(index)} className={buttonClass} disabled={isAnswered}>
                            {option}
                        </button>
                    );
                })}
            </div>
            
            {isAnswered && (
                <div className="mt-4 p-3 bg-mint/50 rounded-lg animate-fade-in">
                    <p className="text-sm text-text-main">{question.explanation}</p>
                    <button onClick={selectNewQuestion} className="w-full mt-3 bg-jade text-white text-sm font-bold py-2 rounded-button hover:bg-opacity-90 transition-colors">
                        {quiz_nextQuestion}
                    </button>
                </div>
            )}
        </Card>
    );
};

export default GlucoQuizCard;