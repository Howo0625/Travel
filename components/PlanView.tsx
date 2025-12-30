import React, { useState } from 'react';
import { TravelPlan, DayPlan, Activity } from '../types';
import BudgetView from './BudgetView';
import { MapPin, Calendar, Train, Hotel, Info, ExternalLink, Clock, Navigation, Edit2, Check, X, Wallet, Share2, Download, List } from 'lucide-react';

interface PlanViewProps {
  plan: TravelPlan | null;
  onUpdatePlan: (plan: TravelPlan) => void;
  onExportPlan: (plan: TravelPlan) => void;
}

type ViewMode = 'itinerary' | 'budget';

const PlanView: React.FC<PlanViewProps> = ({ plan, onUpdatePlan, onExportPlan }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('itinerary');
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editedDayData, setEditedDayData] = useState<DayPlan | null>(null);

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-gray-50">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <MapPin size={40} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Plan Selected</h3>
        <p className="text-sm text-gray-500 max-w-xs">Select a trip from the menu or start chatting with TravelGenie to create one!</p>
      </div>
    );
  }

  const startEditing = (day: DayPlan) => {
    setEditingDay(day.day);
    setEditedDayData(JSON.parse(JSON.stringify(day)));
  };

  const cancelEditing = () => {
    setEditingDay(null);
    setEditedDayData(null);
  };

  const saveDay = () => {
    if (editedDayData) {
        const updatedDays = plan.days.map(d => d.day === editedDayData.day ? editedDayData : d);
        onUpdatePlan({ ...plan, days: updatedDays });
    }
    setEditingDay(null);
    setEditedDayData(null);
  };

  const updateActivity = (index: number, field: keyof Activity, value: string) => {
    if (!editedDayData) return;
    const newActivities = [...editedDayData.activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setEditedDayData({ ...editedDayData, activities: newActivities });
  };

  return (
    <div className="bg-gray-50 min-h-full flex flex-col">
      {/* Header Area */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="p-4 flex justify-between items-start">
            <div className="flex-1 mr-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">{plan.title}</h2>
                <div className="flex flex-wrap gap-y-1 items-center text-xs md:text-sm text-gray-500 mt-1">
                    <span className="flex items-center mr-3"><Calendar size={12} className="mr-1" /> {plan.dates}</span>
                    <span className="flex items-center"><MapPin size={12} className="mr-1" /> {plan.destinations.join(', ')}</span>
                </div>
            </div>
            <button 
                onClick={() => onExportPlan(plan)}
                className="p-2 text-primary bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                title="Share / Export Plan"
            >
                <Share2 size={20} />
            </button>
        </div>
        
        {/* Toggle Tabs */}
        <div className="flex mx-4 mb-2 bg-gray-100 p-1 rounded-lg">
             <button 
                onClick={() => setViewMode('itinerary')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'itinerary' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <List size={16}/> Itinerary
            </button>
            <button 
                onClick={() => setViewMode('budget')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'budget' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                 <Wallet size={16}/> Budget
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {viewMode === 'budget' ? (
            <BudgetView plan={plan} onUpdatePlan={onUpdatePlan} />
        ) : (
            <div className="p-4 space-y-6 animate-fade-in">
                
                 {/* Summary */}
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-900 leading-relaxed">
                    {plan.summary}
                 </div>

                {/* Transport Options */}
                {plan.transportOptions && plan.transportOptions.length > 0 && (
                <div>
                     <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Transport</h3>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="p-3 flex gap-3 overflow-x-auto scrollbar-hide">
                            {plan.transportOptions.map((opt, idx) => (
                                <div key={idx} className={`min-w-[240px] border rounded-lg p-3 flex-shrink-0 relative ${opt.isRecommended ? 'border-primary bg-blue-50/10' : 'border-gray-200'}`}>
                                    {opt.isRecommended && (
                                        <span className="absolute top-0 right-0 bg-primary text-white text-[10px] px-2 py-0.5 rounded-bl-lg rounded-tr-lg font-bold">Recommended</span>
                                    )}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-gray-800">{opt.type}</div>
                                        <div className="font-bold text-primary">{opt.cost}</div>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2 flex items-center">
                                        <Clock size={10} className="mr-1"/> {opt.duration}
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-3">{opt.details}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}

                {/* Accommodations */}
                {plan.accommodations && plan.accommodations.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Stays</h3>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-1">
                        <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {plan.accommodations.map((acc, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800 text-sm">{acc.name}</h4>
                                        <span className="text-purple-600 font-bold text-sm">{acc.pricePerNight}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2 mt-1">{acc.type} • ⭐ {acc.rating}</div>
                                    <p className="text-xs text-gray-700 italic">"{acc.reason}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                )}

                {/* Daily Itinerary */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider ml-1">Schedule</h3>
                    
                    {plan.days.map((day, idx) => {
                        const isEditing = editingDay === day.day;
                        const displayDay = isEditing ? editedDayData! : day;

                        return (
                            <div key={idx} className={`bg-white rounded-xl shadow-sm overflow-hidden border transition-all ${isEditing ? 'border-primary ring-1 ring-primary' : 'border-gray-100'}`}>
                                <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center sticky top-0">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800">Day {day.day}</span>
                                        <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">{day.city}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <button onClick={saveDay} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700 shadow-sm">
                                                    <Check size={14} /> Save
                                                </button>
                                                <button onClick={cancelEditing} className="flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-50 shadow-sm">
                                                    <X size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => startEditing(day)} className="text-gray-400 hover:text-primary p-2 bg-white rounded-full border border-gray-100 shadow-sm">
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-4 relative">
                                    {!isEditing && <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>}
                                    
                                    <div className="space-y-6">
                                        {displayDay.activities.map((act, aIdx) => (
                                            <div key={aIdx} className={`relative ${!isEditing ? 'pl-8' : ''}`}>
                                                {!isEditing && (
                                                    <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                                                        act.type === 'food' ? 'bg-orange-400' :
                                                        act.type === 'transport' ? 'bg-blue-400' :
                                                        act.type === 'rest' ? 'bg-green-400' : 'bg-primary'
                                                    }`}></div>
                                                )}
                                                
                                                {isEditing ? (
                                                    <div className="bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-200">
                                                        <div className="flex gap-2">
                                                            <input 
                                                                value={act.time} 
                                                                onChange={(e) => updateActivity(aIdx, 'time', e.target.value)}
                                                                className="w-20 p-2 text-sm border rounded bg-white"
                                                                placeholder="Time"
                                                            />
                                                            <input 
                                                                value={act.placeName}
                                                                onChange={(e) => updateActivity(aIdx, 'placeName', e.target.value)}
                                                                className="flex-1 p-2 text-sm border rounded font-semibold bg-white"
                                                                placeholder="Activity Name"
                                                            />
                                                        </div>
                                                        <textarea 
                                                            value={act.description}
                                                            onChange={(e) => updateActivity(aIdx, 'description', e.target.value)}
                                                            className="w-full p-2 text-sm border rounded h-20 bg-white"
                                                            placeholder="Description"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="group">
                                                        <div className="flex items-baseline justify-between">
                                                            <h4 className="font-bold text-gray-800 text-sm group-hover:text-primary transition-colors">{act.placeName}</h4>
                                                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{act.time}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{act.description}</p>
                                                        
                                                        {/* Links */}
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {act.googleMapsLink && (
                                                                <a href={act.googleMapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100">
                                                                    <Navigation size={10} className="mr-1" /> Map
                                                                </a>
                                                            )}
                                                            {act.ticketLink && (
                                                                <a href={act.ticketLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-[10px] font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full hover:bg-orange-100">
                                                                    <ExternalLink size={10} className="mr-1" /> Tickets
                                                                </a>
                                                            )}
                                                        </div>

                                                        {act.transportToNext && (
                                                            <div className="mt-3 inline-flex items-center text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                                <Clock size={10} className="mr-1" />
                                                                Travel: {act.transportToNext}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PlanView;