import React from 'react';
import { useTranslations } from '../contexts/LanguageContext';

const LoadingSpinner: React.FC = () => {
  const { t } = useTranslations();
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 rounded-full animate-pulse bg-blue-600"></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-blue-600 delay-200"></div>
      <div className="w-4 h-4 rounded-full animate-pulse bg-blue-600 delay-400"></div>
      <span className="text-gray-700 dark:text-gray-300">{t.submitButtonLoading}</span>
    </div>
  );
};

export default LoadingSpinner;