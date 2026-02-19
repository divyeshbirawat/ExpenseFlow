'use client';

import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetCardProps {
  totalSpent: number;
  budgetLimit: number;
  currency: string;
}

export default function BudgetCard({ totalSpent, budgetLimit, currency }: BudgetCardProps) {
  const percentage = Math.min((totalSpent / budgetLimit) * 100, 100);
  const isOverBudget = totalSpent > budgetLimit;
  const isNearLimit = percentage > 85;

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-stone-500 font-medium">Monthly Budget</p>
          <h3 className="text-2xl font-bold text-stone-900 mt-1">
            {currency}{totalSpent.toLocaleString()} <span className="text-stone-400 text-lg font-normal">/ {currency}{budgetLimit.toLocaleString()}</span>
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-100 text-red-600' : isNearLimit ? 'bg-yellow-100 text-yellow-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {isOverBudget ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
        </div>
      </div>

      <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute top-0 left-0 h-full rounded-full ${
            isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-emerald-500'
          }`}
        />
      </div>

      <div className="mt-3 flex justify-between text-xs font-medium">
        <span className={isOverBudget ? 'text-red-600' : 'text-stone-500'}>
          {percentage.toFixed(1)}% Used
        </span>
        <span className="text-stone-400">
          {currency}{(budgetLimit - totalSpent).toLocaleString()} Remaining
        </span>
      </div>
    </div>
  );
}
