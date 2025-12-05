import React, { useState } from "react";
import { Button } from "../components/ui/button";
import type { NewsItem } from "../types/news.types";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "../components/ui/scroll-area";
import { Menu, Zap } from "lucide-react";
import { NewsCard } from "../components/NewsCard";

const initialNewsItems: NewsItem[] = [
  {
    id: 1,
    title: "New LLM Achieves Near-Human Empathy Scores",
    url: "https://example.com/llm-empathy ",
    description:
      "Researchers unveil a groundbreaking Large Language Model (LLM) that demonstrates unprecedented emotional intelligence in conversational tests. This marks a significant milestone in natural human-AI interaction capabilities.",
  },
  {
    id: 2,
    title: "AI-Powered Drug Discovery Reduces Trial Time by 40%",
    url: "https://example.com/ai-drugs ",
    description:
      "A pharmaceutical giant reports a massive reduction in the initial phases of drug development using a novel deep learning platform for molecule generation, accelerating life-saving innovations.",
  },
  {
    id: 3,
    title: "Regulators Propose Global Framework for AI Safety",
    url: "https://example.com/ai-regulation ",
    description:
      "Major world economies are collaborating to establish unified standards and testing procedures to mitigate systemic risks posed by advanced AI systems, ensuring ethical deployment.",
  },
  {
    id: 4,
    title: "The Rise of Generative AI in Code Automation",
    url: "https://example.com/generative-code ",
    description:
      "Code-generating AI assistants are moving beyond suggestions, now writing up to 70% of production-ready code in specific software domains, boosting developer productivity.",
  },
  {
    id: 5,
    title: "Quantum Computing Boosts Neural Network Training",
    url: "https://example.com/quantum-ai ",
    description:
      "A new hybrid quantum-classical computing approach slashes training time for massive neural networks, promising faster development cycles and deeper learning models.",
  },
  {
    id: 6,
    title: "Ethical AI Audits Mandatory for Public Sector Use",
    url: "https://example.com/ethical-audit ",
    description:
      "New governmental policies enforce mandatory, independent ethical audits for all AI systems deployed in public services starting next quarter to maintain public trust.",
  },
];

// --- Main Dashboard Component (Final Dark Blue Theme) ---
export const AINewsDashboard: React.FC = () => {
  const [news, setNews] = useState(initialNewsItems);
  const removeItem = (id: number) =>
    setNews((prev) => prev.filter((i) => i.id !== id));

  return (
    /* --------------  DARK-BLUE THEME -------------- */
    <div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 text-slate-100 flex flex-col items-center">
                  {/* sticky header – slightly transparent blue-black */}     {" "}
      <header className="sticky top-0 z-10 w-full bg-slate-950/80 backdrop-blur-md border-b border-sky-600/30 shadow-lg px-6 py-4">
               {" "}
        <div className="flex justify-between items-center max-w-6xl mx-auto">
                   {" "}
          <div className="flex items-center space-x-2">
                        <Zap className="h-6 w-6 text-sky-400 animate-pulse" /> 
                     {" "}
            <h1 className="text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-sky-500">
                            AiNewsVerse            {" "}
            </h1>
                     {" "}
          </div>
                   {" "}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-300 hover:text-white"
          >
                        <Menu className="h-5 w-5" />         {" "}
          </Button>
                 {" "}
        </div>
             {" "}
      </header>
            {/* scrollable feed – subtle blue tint to separate from bg */}     {" "}
      <ScrollArea className="w-full max-w-6xl p-6 grow">
               {" "}
        <div className="mb-6 text-xl font-semibold text-sky-300/90 border-b border-sky-600/20 pb-2">
                    Live AI Breakthroughs Feed        {" "}
        </div>
                       {" "}
        <AnimatePresence initial={false}>
                   {" "}
          {news.length > 0 ? (
            <div className="grid gap-8 auto-rows-min sm:grid-cols-2 lg:grid-cols-3">
                           {" "}
              {news.map((item) => (
                <NewsCard key={item.id} item={item} onRemove={removeItem} />
              ))}
                         {" "}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sky-400 mt-12 p-10 border border-dashed border-sky-800/40 rounded-lg max-w-lg mx-auto bg-slate-900/50"
            >
                            <p className="text-3xl mb-4">✨</p>             {" "}
              <p className="text-xl font-medium mb-2">All Clear!</p>           
               {" "}
              <p className="text-slate-400">
                You've successfully reviewed the latest AI news.
              </p>
                         {" "}
            </motion.div>
          )}
                 {" "}
        </AnimatePresence>
             {" "}
      </ScrollArea>
         {" "}
    </div>
  );
};
