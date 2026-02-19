'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useExpenses } from '@/lib/expense-context';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings, resetData } = useExpenses();
  const [budgetLimit, setBudgetLimit] = useState(settings.budgetLimit.toString());
  const [currency, setCurrency] = useState(settings.currency);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      budgetLimit: Number(budgetLimit),
      currency,
      whatsappNumber,
    });
    onClose();
  };

  const handleReset = () => {
    resetData();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-900">Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <X size={20} className="text-stone-500" />
            </button>
          </div>

          {!showConfirmReset ? (
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Monthly Budget Limit</label>
                <input
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="input-field"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field"
                  placeholder="₹"
                  maxLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">WhatsApp Number (Optional)</label>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="input-field"
                  placeholder="+91 98765 43210"
                />
                <p className="text-xs text-stone-400 mt-1">Used for sharing reports directly.</p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-stone-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={16} /> Reset All Data
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors font-medium flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Are you sure?</h3>
              <p className="text-stone-500 text-sm">
                This will permanently delete all your expenses and settings. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                >
                  Yes, Delete Everything
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
