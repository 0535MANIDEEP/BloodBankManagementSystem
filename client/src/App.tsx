import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import AppRoutes from './router';
import { Droplet } from 'lucide-react';

function App() {
  const { checkAuth, initialized } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg animate-bounce">
            <Droplet className="h-8 w-8 fill-current" />
          </div>
          <span className="text-sm font-extrabold tracking-widest text-slate-500 uppercase">
            Loading BloodGrid...
          </span>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
