import React, { useState } from 'react';
import { TravelPlan, Expense } from '../types';
import { Plus, Trash2, DollarSign, PieChart, Wallet } from 'lucide-react';

interface BudgetViewProps {
  plan: TravelPlan;
  onUpdatePlan: (updatedPlan: TravelPlan) => void;
}

const CATEGORIES = ['Food', 'Transport', 'Accommodation', 'Shopping', 'Tickets', 'Other'] as const;

const BudgetView: React.FC<BudgetViewProps> = ({ plan, onUpdatePlan }) => {
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'Food',
    currency: plan.currencyCode || 'TWD',
    amount: 0,
    description: ''
  });

  const totalSpent = (plan.expenses || []).reduce((sum, item) => sum + Number(item.amount), 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category as any,
      amount: Number(newExpense.amount),
      currency: newExpense.currency || 'TWD',
      description: newExpense.description || '',
      date: new Date().toISOString().split('T')[0]
    };

    const updatedExpenses = [...(plan.expenses || []), expense];
    onUpdatePlan({ ...plan, expenses: updatedExpenses });
    
    setNewExpense({ ...newExpense, amount: 0, description: '' });
  };

  const handleDelete = (id: string) => {
    const updatedExpenses = plan.expenses.filter(e => e.id !== id);
    onUpdatePlan({ ...plan, expenses: updatedExpenses });
  };

  // Calculate stats by category
  const stats = (plan.expenses || []).reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="pb-24 animate-fade-in bg-gray-50 min-h-full p-4 space-y-6">
      
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Total Spent</h3>
                <div className="text-4xl font-bold mt-1 flex items-baseline">
                    <span className="text-2xl mr-1">$</span>
                    {totalSpent.toLocaleString()}
                    <span className="text-sm text-emerald-100 ml-2 font-normal">{newExpense.currency}</span>
                </div>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
                <Wallet size={32} />
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
          {/* Add Expense Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                <Plus size={18} className="mr-2 text-emerald-600" /> Add Expense
            </h4>
            <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                        <input 
                            type="number" 
                            value={newExpense.amount || ''}
                            onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                        <select 
                             value={newExpense.category}
                             onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                             className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <input 
                        type="text" 
                        value={newExpense.description}
                        onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. Lunch at 7-11"
                    />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium transition-colors">
                    Add Transaction
                </button>
            </form>
          </div>

          {/* Breakdown Chart (Simple List for now) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                <PieChart size={18} className="mr-2 text-blue-600" /> Breakdown
            </h4>
            <div className="space-y-3">
                {Object.entries(stats).map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                                cat === 'Food' ? 'bg-orange-400' :
                                cat === 'Transport' ? 'bg-blue-400' :
                                cat === 'Accommodation' ? 'bg-purple-400' : 'bg-gray-400'
                            }`}></span>
                            <span>{cat}</span>
                        </div>
                        <span className="font-semibold text-gray-700">${amount.toLocaleString()}</span>
                    </div>
                ))}
                {Object.keys(stats).length === 0 && <p className="text-gray-400 text-sm">No expenses yet.</p>}
            </div>
          </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700">Transaction History</div>
        <div className="divide-y divide-gray-100">
            {(!plan.expenses || plan.expenses.length === 0) && (
                <div className="p-8 text-center text-gray-400 text-sm">No transactions recorded.</div>
            )}
            {plan.expenses?.slice().reverse().map(expense => (
                <div key={expense.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-gray-100 text-gray-600`}>
                            <DollarSign size={16} />
                        </div>
                        <div>
                            <div className="font-medium text-gray-800">{expense.description}</div>
                            <div className="text-xs text-gray-500">{expense.category} • {expense.date}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-800">-${expense.amount.toLocaleString()}</span>
                        <button onClick={() => handleDelete(expense.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetView;
