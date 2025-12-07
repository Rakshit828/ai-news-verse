import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CategoryProvider } from './context/CategoryContext.tsx';

import { Toaster } from 'sonner';
import { NotificationProvider } from './context/NotificationContext.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <CategoryProvider>
          <NotificationProvider>
            <App />
            <Toaster position="top-right" richColors />
          </NotificationProvider>
        </CategoryProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>,
);
