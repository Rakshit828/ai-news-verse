import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Globe, BarChart3, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: 'AI-Powered Curation',
    description: 'Our intelligent algorithms curate the most relevant AI news from thousands of sources worldwide.',
    color: 'from-blue-600 to-blue-400',
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Real-Time Updates',
    description: 'Get instant notifications about breaking news and trending topics in the AI industry.',
    color: 'from-cyan-600 to-cyan-400',
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Personalized Feed',
    description: 'Customize your preferences and get a feed tailored specifically to your interests.',
    color: 'from-emerald-600 to-emerald-400',
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: 'Global Coverage',
    description: 'Access news from 10+ premium sources covering every corner of the AI world.',
    color: 'from-purple-600 to-purple-400',
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: 'Advanced Analytics',
    description: 'Track trends, analyze patterns, and gain deep insights into AI market movements.',
    color: 'from-amber-600 to-amber-400',
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Market Insights',
    description: 'Stay informed about AI innovations, breakthroughs, and industry transformations.',
    color: 'from-pink-600 to-pink-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

export const FeaturesSection: React.FC = () => {
  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-100">
            Powerful Features
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Everything you need to stay on top of the AI revolution
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-linear-to-r from-slate-800 to-slate-700/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
                <div className={`inline-flex p-3 rounded-lg bg-linear-to-r ${feature.color} mb-4 text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};