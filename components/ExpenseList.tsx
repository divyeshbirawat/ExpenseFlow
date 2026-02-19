'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, SortDesc, SortAsc, Search, Trash2 } from 'lucide-react';
import { useExpenses, Expense, Category, PaymentMethod } from '@/lib/expense-context';

interface ExpenseListProps {
  limit?: number;
  showFilters?: boolean;
}

export default function ExpenseList({ limit, showFilters = true }: ExpenseListProps) {
  const { expenses, removeExpense, settings } = useExpenses();
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = expenses
    .filter((expense) => {
      if (filterCategory !== 'All' && expense.category !== filterCategory) return false;
      if (filterMethod !== 'All' && expense.method !== filterMethod) return false;
      if (searchTerm && !expense.note.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  const displayedExpenses = limit ? filteredExpenses.slice(0, limit) : filteredExpenses;

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as Category | 'All')}
                className="px-3 py-2 rounded-xl bg-stone-50 text-sm border-none focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-stone-50 text-sm border-none focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {displayedExpenses.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between group hover:border-stone-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                  ${expense.category === 'Food' ? 'bg-orange-100 text-orange-600' :
                    expense.category === 'Transport' ? 'bg-blue-100 text-blue-600' :
                    expense.category === 'Shopping' ? 'bg-purple-100 text-purple-600' :
                    expense.category === 'Utilities' ? 'bg-yellow-100 text-yellow-600' :
                    expense.category === 'Entertainment' ? 'bg-pink-100 text-pink-600' :
                    'bg-stone-100 text-stone-600'
                  }`}
                >
                  {expense.category[0]}
                </div>
                <div>
                  <h4 className="font-medium text-stone-900">{expense.note || expense.category}</h4>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span>{expense.method}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-stone-900">
                  {settings.currency}{expense.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => removeExpense(expense.id)}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {displayedExpenses.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <p>No expenses found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
