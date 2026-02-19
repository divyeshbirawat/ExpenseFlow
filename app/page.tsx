'use client';

import { useExpenses } from '@/lib/expense-context';
import LoginView from '@/components/LoginView';
import DashboardView from '@/components/DashboardView';

export default function HomePage() {
  const { user, isLoading } = useExpenses();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return <DashboardView />;
}
