import { Zap } from "lucide-react";

export const NavBar: React.FC = () => {
  // Mock user data for demonstration
  const mockUser = {
    name: "AI Enthusiast",
    avatarUrl: "https://placehold.co/40x40/0E7490/FFFFFF?text=AE", // Placeholder for avatar
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-slate-950/80 backdrop-blur-md border-b border-sky-600/30 shadow-2xl px-6 py-3">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* Left Side: Logo/Heading */}
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-sky-400" />
          <h1 className="text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-sky-500">
            AiNewsVerse
          </h1>
        </div>

        {/* Right Side: User Profile/Avatar */}
        {/* Added group for hover effects on the entire profile area */}
        <div className="flex items-center space-x-3 p-1 rounded-full hover:bg-slate-800/50 transition-colors cursor-pointer group">
          {/* User Name and Title (Hidden on small screens) */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-100 group-hover:text-sky-300 transition-colors">
              {mockUser.name}
            </p>
            <p className="text-xs text-slate-400 group-hover:text-sky-400 transition-colors">
              Premium Access
            </p>
          </div>

          {/* User Avatar */}
          <img
            src={mockUser.avatarUrl}
            alt="User Avatar"
            className="h-10 w-10 rounded-full border-2 border-sky-500 object-cover shadow-lg group-hover:ring-2 ring-sky-300 transition-all duration-300"
          />
        </div>
      </div>
    </header>
  );
};
