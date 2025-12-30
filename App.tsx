import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import PlanView from './components/PlanView';
import Sidebar from './components/Sidebar';
import { sendMessageStream, resetChat } from './services/geminiService';
import { Message, Tab, TravelPlan } from './types';
import { MessageSquare, Map, Menu, Plus, Wallet } from 'lucide-react';

// Toast Component
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg z-[100] text-sm font-medium animate-fade-in flex items-center">
        {message}
    </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  
  // Plans State
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  
  // UI State
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // Mock User

  // --- Persistence ---
  useEffect(() => {
    const savedPlans = localStorage.getItem('travelgenie_plans');
    const savedMessages = localStorage.getItem('travelgenie_messages');
    
    if (savedPlans) {
        try {
            const parsedPlans = JSON.parse(savedPlans);
            setPlans(parsedPlans);
            if (parsedPlans.length > 0) setActivePlanId(parsedPlans[0].id);
        } catch(e) { console.error(e); }
    }

    if (savedMessages) {
        try { setMessages(JSON.parse(savedMessages)); } catch(e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('travelgenie_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('travelgenie_messages', JSON.stringify(messages));
  }, [messages]);

  // --- Handlers ---
  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  const handleLogin = () => {
      // Mock Login
      setUser({ name: "Demo User", email: "demo@example.com" });
      showToast("Signed in as Demo User");
  };

  const activePlan = plans.find(p => p.id === activePlanId) || null;
  const currentMessages = activePlanId ? (messages[activePlanId] || []) : [];

  const handleCreatePlan = () => {
    const newId = Date.now().toString();
    const newPlan: TravelPlan = {
        id: newId,
        createdAt: Date.now(),
        title: "New Trip",
        destinations: [],
        dates: "",
        summary: "Start chatting to plan your trip!",
        transportOptions: [],
        accommodations: [],
        days: [],
        tips: [],
        expenses: []
    };
    
    setPlans(prev => [newPlan, ...prev]);
    setMessages(prev => ({ ...prev, [newId]: [] }));
    setActivePlanId(newId);
    setActiveTab('chat');
    resetChat();
  };

  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this plan?")) {
        const newPlans = plans.filter(p => p.id !== id);
        setPlans(newPlans);
        const newMessages = { ...messages };
        delete newMessages[id];
        setMessages(newMessages);

        if (activePlanId === id) {
            setActivePlanId(newPlans.length > 0 ? newPlans[0].id : null);
        }
        showToast("Plan deleted");
    }
  };

  const handleImportPlan = (plan: TravelPlan) => {
      setPlans(prev => [plan, ...prev]);
      setActivePlanId(plan.id);
      showToast("Plan imported successfully!");
  };

  const handleExportPlan = (plan: TravelPlan) => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${plan.title.replace(/\s+/g, '_')}_plan.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      showToast("Plan exported!");
  };

  const handleUpdatePlan = (updatedPlan: TravelPlan) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  const handleSendMessage = async (text: string) => {
    let currentId = activePlanId;
    if (!currentId) {
        const newId = Date.now().toString();
        // Duplicate Create logic for safety
        const newPlan: TravelPlan = { id: newId, createdAt: Date.now(), title: "New Trip", destinations: [], dates: "", summary: "Draft", transportOptions: [], accommodations: [], days: [], tips: [], expenses: [] };
        setPlans(prev => [newPlan, ...prev]);
        setActivePlanId(newId);
        currentId = newId;
    }

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => ({ ...prev, [currentId!]: [...(prev[currentId!] || []), userMsg] }));
    setIsLoading(true);

    setMessages(prev => ({ ...prev, [currentId!]: [...(prev[currentId!] || []), { role: 'model', text: '', isStreaming: true }] }));

    try {
        let accumulatedText = "";
        await sendMessageStream(
            text, 
            (chunk) => {
                accumulatedText += chunk;
                setMessages(prev => {
                    const planMessages = [...(prev[currentId!] || [])];
                    const lastIdx = planMessages.length - 1;
                    if (lastIdx >= 0) planMessages[lastIdx] = { ...planMessages[lastIdx], text: accumulatedText };
                    return { ...prev, [currentId!]: planMessages };
                });
            },
            (planJson) => {
                try {
                    const parsedData = JSON.parse(planJson);
                    setPlans(currentPlans => currentPlans.map(p => {
                        if (p.id === currentId) {
                            return { ...p, ...parsedData, id: p.id, expenses: p.expenses || [] };
                        }
                        return p;
                    }));
                    showToast("Itinerary updated!");
                } catch (e) { console.error("Parse Error", e); }
            }
        );
        setMessages(prev => {
            const planMessages = [...(prev[currentId!] || [])];
            planMessages[planMessages.length - 1].isStreaming = false;
            return { ...prev, [currentId!]: planMessages };
        });
    } catch (error) {
        console.error(error);
        showToast("Error generating response");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      <Sidebar 
        plans={plans}
        activePlanId={activePlanId}
        onSelectPlan={(id) => { setActivePlanId(id); resetChat(); setIsSidebarOpen(false); }}
        onCreatePlan={handleCreatePlan}
        onDeletePlan={handleDeletePlan}
        onImportPlan={handleImportPlan}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogin={handleLogin}
      />

      <div className="flex-1 flex flex-col h-full relative w-full max-w-full">
        {/* Mobile Top Bar */}
        <header className="flex items-center justify-between p-3 bg-white border-b border-gray-100 z-10 h-[56px] shadow-sm md:hidden">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-700 active:bg-gray-100 rounded-lg">
                <Menu size={24} />
            </button>
            <div className="font-bold text-gray-800">
                {activePlan ? (activePlan.title.length > 20 ? activePlan.title.substring(0, 18) + '...' : activePlan.title) : 'TravelGenie'}
            </div>
            <div className="w-10"></div> {/* Spacer for center alignment */}
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-4 border-b bg-white z-10">
             <div className="flex items-center gap-2">
                <button onClick={() => setIsSidebarOpen(true)} className={`p-2 hover:bg-gray-100 rounded-lg ${isSidebarOpen ? 'opacity-0 pointer-events-none' : ''}`}>
                    <Menu size={20}/>
                </button>
                <span className="font-bold text-lg text-gray-800">
                    {activePlan ? activePlan.title : 'Select a Trip'}
                </span>
             </div>
             <div className="flex bg-gray-100 p-1 rounded-lg">
                {(['chat', 'plan'] as const).map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        {tab === 'chat' ? <MessageSquare size={16}/> : <Map size={16}/>}
                        <span className="capitalize">{tab}</span>
                    </button>
                ))}
             </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative bg-[#F4F7FB]">
            {/* Conditional Rendering for Desktop (Tabs) & Mobile (Bottom Nav switching) */}
            
            {/* Chat View */}
            <div className={`absolute inset-0 transition-opacity duration-200 flex flex-col ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                 {activePlanId ? (
                     <ChatInterface messages={currentMessages} isLoading={isLoading} onSendMessage={handleSendMessage} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
                         <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Map size={40} className="text-primary opacity-80" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Start your journey</h2>
                        <p className="max-w-xs mb-6">Create a new trip plan to start chatting with your AI travel assistant.</p>
                        <button onClick={handleCreatePlan} className="bg-primary text-white px-6 py-3 rounded-xl font-medium shadow-md hover:bg-blue-700 transition-colors flex items-center">
                            <Plus size={18} className="mr-2"/> Create New Trip
                        </button>
                    </div>
                )}
            </div>

            {/* Plan View */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'plan' || activeTab === 'budget' ? 'opacity-100 z-10 overflow-y-auto scrollbar-hide' : 'opacity-0 z-0 pointer-events-none'}`}>
                <PlanView plan={activePlan} onUpdatePlan={handleUpdatePlan} onExportPlan={handleExportPlan} />
            </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden bg-white border-t border-gray-200 h-[60px] pb-safe-bottom flex justify-around items-center z-30">
            <button 
                onClick={() => setActiveTab('chat')}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'chat' ? 'text-primary' : 'text-gray-400'}`}
            >
                <MessageSquare size={20} className={activeTab === 'chat' ? 'fill-current' : ''} />
                <span className="text-[10px] font-medium">Chat</span>
            </button>
            <button 
                onClick={() => setActiveTab('plan')}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'plan' ? 'text-primary' : 'text-gray-400'}`}
            >
                <Map size={20} className={activeTab === 'plan' ? 'fill-current' : ''} />
                <span className="text-[10px] font-medium">Itinerary</span>
            </button>
        </div>
      </div>
    </div>
  );
}