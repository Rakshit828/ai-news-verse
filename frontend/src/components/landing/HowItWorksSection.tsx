import React from 'react';
import { motion } from 'framer-motion';
import { Users, Sliders, Zap, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Sign Up',
    description: 'Create your account in seconds with a simple registration process.',
    number: '01',
  },
  {
    icon: <Sliders className="h-8 w-8" />,
    title: 'Customize',
    description: 'Choose your interests and preferences to personalize your feed.',
    number: '02',
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Stay Updated',
    description: 'Get real-time notifications about breaking news and trends.',
    number: '03',
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Analyze',
    description: 'Explore insights and trends with our advanced analytics tools.',
    number: '04',
  },
];

export const HowItWorksSection: React.FC = () => {
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
            How It Works
          </h2>
          <p className="text-lg text-slate-400">
            Get started in 4 simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 -right-4 w-8 h-0.5 bg-linear-to-r from-blue-600 to-transparent" />
              )}

              <div className="relative">
                <div className="absolute -top-3 -right-3 h-10 w-10 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/50">
                  <span className="text-sm font-bold text-blue-400">
                    {step.number}
                  </span>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="inline-flex p-3 rounded-lg bg-blue-600/20 text-blue-400 mb-4 border border-blue-500/30">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};