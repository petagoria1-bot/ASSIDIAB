import React from 'react';
import { Page } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';

const History: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const t = useTranslations();
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-white">{t.history_title}</h1>
      <p className="text-white/80 mt-4">Cette page est en cours de construction.</p>
    </div>
  );
};

export default History;
