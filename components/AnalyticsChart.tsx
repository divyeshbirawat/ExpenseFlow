'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense } from '@/lib/expense-context';

interface AnalyticsChartProps {
  expenses: Expense[];
  currency: string;
}

const COLORS = ['#f97316', '#3b82f6', '#a855f7', '#eab308', '#ec4899', '#22c55e', '#6366f1', '#64748b'];

export default function AnalyticsChart({ expenses, currency }: AnalyticsChartProps) {
  const data = useMemo(() => {
    const categoryMap = new Map<string, number>();
    expenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm h-[300px] flex items-center justify-center text-stone-400">
        No data to display
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm h-[300px]">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number | undefined) => [`${currency}${(value || 0).toLocaleString()}`, 'Amount']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ fontSize: '12px', color: '#57534e' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
