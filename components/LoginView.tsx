'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Chrome, ArrowRight, AlertCircle, Database } from 'lucide-react';
import { useExpenses } from '@/lib/expense-context';

export default function LoginView() {
  const { login, isDemoMode } = useExpenses();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for OAuth operations. Please add it to the Firebase Console.');
      } else {
        setError('Failed to sign in. Please check your configuration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 p-8 border border-stone-100">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-stone-900 mb-2">Welcome to ExpenseFlow</h1>
            <p className="text-stone-500">Track your spending with clarity</p>
          </div>

          {isDemoMode && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-700 text-sm">
              <Database size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Demo Mode Active</p>
                <p className="opacity-90 mt-1">Firebase is not configured. Data will be saved locally to your browser.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-base"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isDemoMode ? <ArrowRight size={20} /> : <Chrome size={20} />}
                <span>{isDemoMode ? 'Continue as Demo User' : 'Continue with Google'}</span>
              </>
            )}
          </button>
          
          {!isDemoMode && (
            <div className="mt-6 text-center">
               <p className="text-xs text-stone-400">
                 Secure authentication powered by Firebase
               </p>
            </div>
          )}
        </div>
        
        <p className="text-center text-xs text-stone-400 mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
