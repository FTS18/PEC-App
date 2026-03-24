import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Initialize accent color from localStorage on page load
const initAccentColor = () => {
  const accent = localStorage.getItem('accent-color') || 'sapphire';
  const root = document.documentElement;
  root.classList.remove('accent-obsidian', 'accent-emerald', 'accent-sapphire', 'accent-amethyst', 'accent-coral');
  root.classList.add(`accent-${accent}`);
  root.removeAttribute('style');
};

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initAccentColor();
  }, []);

  return (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </ThemeProvider>
  );
};

export default App;
