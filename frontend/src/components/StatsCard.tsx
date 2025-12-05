import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'cyan' | 'emerald' | 'amber';
}

const colorClasses = {
  blue: 'bg-blue-600/10 border-blue-600/30 text-blue-400',
  cyan: 'bg-cyan-600/10 border-cyan-600/30 text-cyan-400',
  emerald: 'bg-emerald-600/10 border-emerald-600/30 text-emerald-400',
  amber: 'bg-amber-600/10 border-amber-600/30 text-amber-400',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  color,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-4 border rounded-lg ${colorClasses[color]} transition-all`}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-slate-700/50 rounded-lg">{icon}</div>
        <div>
          <p className="text-xs text-slate-400 font-medium">{label}</p>
          <p className="text-xl font-bold text-slate-100">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};