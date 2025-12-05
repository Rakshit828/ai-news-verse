import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
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

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            y: [0, 100, 0],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl"
          animate={{
            y: [0, -100, 0],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded-full">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              Welcome to AI News Verse
            </span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight"
        >
          <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Stay Ahead in AI
          </span>
          <br />
          <span className="text-slate-100">with Personalized Insights</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Get curated, AI-powered news from the world's top sources. Real-time
          updates, intelligent filtering, and insights tailored just for you.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg flex items-center space-x-2 transition-all hover:scale-105 shadow-lg hover:shadow-blue-600/50"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-700/50 hover:text-slate-100 font-semibold px-8 py-3 rounded-lg transition-all"
          >
            Watch Demo
          </Button>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400"
        >
          {[
            '✓ Real-time Updates',
            '✓ AI-Powered Curation',
            '✓ Personalized Feed',
          ].map((feature) => (
            <div
              key={feature}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/30 rounded-full border border-slate-700/50"
            >
              {feature}
            </div>
          ))}
        </motion.div>

        {/* Hero Image / Dashboard Preview */}
        <motion.div
          variants={itemVariants}
          className="mt-16"
          whileHover={{ y: -10 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-cyan-600/20 blur-2xl rounded-2xl" />
            <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-1 backdrop-blur-sm shadow-2xl">
              <div className="bg-slate-900/80 rounded-xl p-8 border border-slate-700/30">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="h-32 bg-linear-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700/50"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 3,
                        delay: i * 0.3,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 bg-linear-to-r from-blue-600 to-cyan-600 rounded-full flex-1"
                      animate={{ scaleX: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
