import { useState } from "react";
import { motion } from "framer-motion";
import type { NewsItem } from "../types/news.types";
import { Card, CardContent, CardDescription, CardFooter, CardTitle, CardHeader } from "./ui/card";
import { CornerDownRight, Lightbulb, Zap, X } from "lucide-react";
import { Button } from "./ui/button";


export const NewsCard: React.FC<{
  item: NewsItem;
  onRemove: (id: number) => void;
}> = ({ item, onRemove }) => {
  const [isSummarized, setIsSummarized] = useState(false);
  const summary =
    "Summary: This model demonstrates unusually high emotional intelligence and marks a step forward in natural human–AI emotional interaction.";

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      transition: { duration: 0.25 },
    },
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="w-full relative" // Added relative for internal absolute elements if needed
    >
        
      <Card
        className="w-full mx-auto flex flex-col justify-between p-6 rounded-xl shadow-xl transition-all duration-300 h-full
                   bg-slate-800 border border-blue-800/50 hover:border-blue-700/80 relative overflow-hidden 
                   hover:scale-[1.01] hover:shadow-blue-900/70"
      >
        {/* Subtle accent glow on top edge */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-sky-400/50 to-transparent opacity-75"></div>
        
        <CardHeader className="p-0 mb-4">
            
          <CardTitle className="text-xl font-bold hover:text-sky-400 transition-colors leading-snug text-white mb-2">
            
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
                {item.title}
            </a>
            
          </CardTitle>
            
          <CardDescription className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center">
            
            <CornerDownRight size={12} className="inline mr-1 min-w-3" />
            
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate block"
            >
                {item.url.replace(/^https?:\/\//, "").split("/")[0]}
            </a>
            
          </CardDescription>
          
        </CardHeader>
        
        <CardContent className="p-0 text-sm text-slate-300 leading-relaxed mb-4 grow">
            
          {isSummarized ? (
            <div className="border-l-4 border-sky-500 pl-3 py-2 mt-1 bg-sky-900/30 rounded-r-md italic text-sky-200 shadow-inner">
              <Lightbulb size={16} className="inline mr-2 min-w-4" />
                {summary}
            </div>
          ) : (
            item.description
          )}
          
        </CardContent>
        
        <CardFooter className="flex justify-between items-center mt-auto p-0 pt-4 border-t border-slate-700/50">
            
          <Button
            size="sm"
            variant={isSummarized ? "secondary" : "default"}
            onClick={() => setIsSummarized(!isSummarized)}
            // Added w-36 for fixed width
            className={`transition-all duration-200 text-sm w-36
              ${
              isSummarized
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "bg-sky-600 text-white hover:bg-sky-500"
            }
            `}
          >
            <Zap size={16} className="mr-2" />
            {isSummarized ? "Hide Details" : "Summarize"}
          </Button>
            
          <Button
            size="sm"
            variant="ghost"
            // Added w-36 for fixed width
            className="text-red-400 hover:bg-red-900/30 transition-colors w-36"
            onClick={onRemove.bind(null, item.id)}
          >
            <X size={16} className="mr-1" /> Remove
          </Button>
          
        </CardFooter>
        
      </Card>
      
    </motion.div>
  );
};