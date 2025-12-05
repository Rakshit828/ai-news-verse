import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  {
    number: '10K+',
    label: 'Active Users',
  },
  {
    number: '50K+',
    label: 'Articles Curated',
  },
  {
    number: '10+',
    label: 'News Sources',
  },
  {
    number: '99.9%',
    label: 'Uptime',
  },
];

const CounterAnimation: React.FC<{ target: string }> = ({ target }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {target}
    </motion.div>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 to-cyan-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 text-center backdrop-blur-sm">
                <motion.div
                  className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <CounterAnimation target={stat.number} />
                </motion.div>
                <p className="text-slate-400 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};