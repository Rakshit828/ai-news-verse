import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const benefits = [
  'Save hours on research and reading',
  'Never miss important AI breakthroughs',
  'Understand market trends faster',
  'Make informed decisions based on insights',
  'Get breaking news alerts instantly',
  'Access curated content from experts',
];

export const BenefitsSection: React.FC = () => {
  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-slate-100">
              Why Choose AiNewsVerse?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              We've engineered the perfect platform to keep you informed about the rapidly evolving world of artificial intelligence. With our advanced filtering and AI-powered recommendations, you'll always be ahead of the curve.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600/20 border border-blue-500/50">
                      <Check className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                  <span className="text-slate-300">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-cyan-600/20 blur-3xl rounded-3xl" />
            <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-sm">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/50"
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                  >
                    <div className="h-3 bg-blue-600/40 rounded w-3/4 mb-3" />
                    <div className="h-2 bg-slate-600/40 rounded w-full mb-2" />
                    <div className="h-2 bg-slate-600/40 rounded w-5/6" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};