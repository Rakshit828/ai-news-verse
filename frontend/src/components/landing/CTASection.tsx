import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';


export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-linear-to-r from-blue-600/30 to-cyan-600/30 blur-3xl rounded-3xl" />
          <div className="relative bg-slate-800/60 border border-slate-700/50 rounded-3xl p-12 text-center backdrop-blur-sm">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">
                Limited Time Offer
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-slate-100">
              Ready to Transform
              <br />
              <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Your AI News Experience?
              </span>
            </h2>

            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of AI enthusiasts and professionals who are already using AiNewsVerse to stay ahead of the curve.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg flex items-center space-x-2 transition-all hover:scale-105 shadow-lg hover:shadow-blue-600/50"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-700/50 font-semibold px-8 py-3 rounded-lg"
              >
                Contact Sales
              </Button>
            </div>

            <p className="text-sm text-slate-400 mt-6">
              ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};