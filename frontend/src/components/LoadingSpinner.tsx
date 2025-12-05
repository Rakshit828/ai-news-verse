import { Loader2 } from "lucide-react";

// Reusable Loading Spinner Component
export const LoadingSpinner = ({ 
  size = "default", 
  className = "" 
}: { 
  size?: "sm" | "default" | "lg"; 
  className?: string;
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-8 w-8"
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
    />
  );
};

// Full-screen overlay loader (optional, for page-level loading)
export const FullScreenLoader = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" className="text-blue-600" />
        <p className="text-slate-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Demo Component showing usage
const Demo = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Spinner Sizes:</h3>
        <div className="flex items-center gap-4">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="default" />
          <LoadingSpinner size="lg" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Button with Loading:</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
          <LoadingSpinner size="sm" className="text-white" />
          Signing in...
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Full Screen Loader:</h3>
        <p className="text-sm text-slate-600">Uncomment the component below to see the full-screen loader</p>
        <FullScreenLoader message="Authenticating..." />
      </div>
    </div>
  );
};

export default Demo;