import React, { useRef } from 'react';
import { TravelPlan } from '../types';
import { Map, Plus, Trash2, ChevronLeft, MapPin, Upload, LogIn } from 'lucide-react';

interface SidebarProps {
  plans: TravelPlan[];
  activePlanId: string | null;
  onSelectPlan: (id: string) => void;
  onCreatePlan: () => void;
  onDeletePlan: (id: string, e: React.MouseEvent) => void;
  onImportPlan: (plan: TravelPlan) => void;
  isOpen: boolean;
  onClose: () => void;
  user: any; // Mock user
  onLogin: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  plans, activePlanId, onSelectPlan, onCreatePlan, onDeletePlan, onImportPlan, isOpen, onClose, user, onLogin
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const importedPlan = JSON.parse(content) as TravelPlan;
                
                // Validate basic structure
                if (!importedPlan.id || !importedPlan.title) {
                    alert("Invalid plan file.");
                    return;
                }
                
                // Assign new ID to avoid conflicts, or keep if purely syncing? 
                // Let's keep original ID for "collaboration" simulation, but usually best to regen ID on import if it's a copy.
                // For this use case (Sharing), let's regen ID to treat as a new copy for the recipient.
                const newPlan = { ...importedPlan, id: Date.now().toString(), title: importedPlan.title + " (Imported)" };
                
                onImportPlan(newPlan);
                onClose();
            } catch (error) {
                alert("Failed to parse the plan file.");
                console.error(error);
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={onClose}
        />
      )}

      <div className={`
        fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-72 md:flex-shrink-0 flex flex-col
      `}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
             <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
                <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center">
                    <Map size={18} />
                </div>
                <span>TravelGenie</span>
             </div>
             <button onClick={onClose} className="md:hidden text-gray-500">
                <ChevronLeft />
             </button>
        </div>

        {/* User Profile (Mock) */}
        <div className="px-5 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 border border-gray-100">
                {user ? (
                    <>
                        <img src="https://ui-avatars.com/api/?name=User&background=0F62FE&color=fff" className="w-10 h-10 rounded-full" alt="User"/>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-bold text-gray-800">Traveler</div>
                            <div className="text-xs text-green-600 flex items-center">● Online</div>
                        </div>
                    </>
                ) : (
                    <button onClick={onLogin} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                        <LogIn size={16} /> Sign in with Google
                    </button>
                )}
            </div>
        </div>

        {/* Actions */}
        <div className="px-5 grid grid-cols-2 gap-2 mb-4">
            <button 
                onClick={() => { onCreatePlan(); onClose(); }}
                className="flex items-center justify-center gap-2 bg-primary text-white py-2.5 px-3 rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium"
            >
                <Plus size={16} /> New Trip
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
            >
                <Upload size={16} /> Import
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".json"
            />
        </div>

        <div className="px-5 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">My Itineraries</div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
            {plans.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10 p-4 border border-dashed rounded-xl mx-2">
                    No trips saved yet.
                </div>
            )}
            {plans.map(plan => (
                <div 
                    key={plan.id}
                    onClick={() => { onSelectPlan(plan.id); onClose(); }}
                    className={`
                        group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border
                        ${activePlanId === plan.id 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'bg-white border-transparent hover:bg-gray-100 text-gray-700'}
                    `}
                >
                    <div className="flex items-center overflow-hidden gap-3">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activePlanId === plan.id ? 'bg-blue-100 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                            <MapPin size={18} />
                         </div>
                        <div className="truncate min-w-0">
                            <div className={`font-semibold text-sm truncate ${activePlanId === plan.id ? 'text-primary' : 'text-gray-800'}`}>
                                {plan.title || 'Untitled Trip'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{plan.dates || 'No dates set'}</div>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => onDeletePlan(plan.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                        title="Delete Plan"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t text-[10px] text-gray-400 text-center">
            v2.0 • Data saved locally
        </div>
      </div>
    </>
  );
};

export default Sidebar;