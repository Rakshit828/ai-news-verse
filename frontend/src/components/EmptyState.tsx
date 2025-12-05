import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, Sliders, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export type EmptyStateType = 'no-categories' | 'no-news' | 'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  onRetry?: () => void;
}

const emptyStateConfig = {
  'no-categories': {
    icon: Sliders,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-600/10 border-amber-600/30',
    title: 'Categories Not Set',
    description:
      "You haven't selected any categories yet. Choose your interests to get personalized AI news tailored just for you.",
    buttonText: 'Set Up Categories',
    buttonAction: 'navigate',
    showRetry: false,
  },
  'no-news': {
    icon: Inbox,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-600/10 border-blue-600/30',
    title: 'No News for Today',
    description:
      "There's no news available for your selected categories right now. Check back later or customize your preferences to get different content.",
    buttonText: 'Customize Categories',
    buttonAction: 'navigate',
    showRetry: true,
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-600/10 border-red-600/30',
    title: 'Unable to Load News',
    description:
      'Something went wrong while fetching your news. Please try again or adjust your category preferences.',
    buttonText: 'Retry',
    buttonAction: 'retry',
    showRetry: false,
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-news',
  onRetry,
}) => {
  const navigate = useNavigate();
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  const handleButtonClick = () => {
    if (config.buttonAction === 'navigate') {
      navigate('/categories');
    } else if (config.buttonAction === 'retry' && onRetry) {
      onRetry();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-20 px-6"
    >
      <div className="flex justify-center mb-6">
        <div className={`p-4 ${config.iconBg} rounded-full border`}>
          <Icon className={`h-12 w-12 ${config.iconColor}`} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-100 mb-2">
        {config.title}
      </h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
        {config.description}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          onClick={handleButtonClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg inline-flex items-center space-x-2 transition-all"
        >
          <span>{config.buttonText}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>

        {config.showRetry && (
          <Button
            variant="outline"
            onClick={() => navigate('/categories')}
            className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600 px-6 py-2 rounded-lg transition-all"
          >
            View Categories
          </Button>
        )}
      </div>
    </motion.div>
  );
};