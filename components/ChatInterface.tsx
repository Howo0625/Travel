import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage }) => {
  const [input, setInput] = React.useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]); // Scroll on loading state change too

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const cleanText = (text: string) => {
    return text.replace(/```json_plan[\s\S]*?```/, '').trim();
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F7FB]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        {messages.length === 0 && (
            <div className="mt-8 text-center text-gray-500 animate-fade-in">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Bot size={32} />
                </div>
                <h3 className="font-semibold text-lg text-gray-800">Hi! I'm TravelGenie.</h3>
                <p className="text-sm px-8 mt-2 max-w-xs mx-auto">I can plan detailed itineraries, find transport, and suggest hotels.</p>
                <div className="mt-8 grid grid-cols-1 gap-3 px-4 max-w-sm mx-auto">
                    <button onClick={() => onSendMessage("Plan a 5 day trip to Kyoto.")} className="text-sm bg-white border border-gray-200 p-3 rounded-xl hover:bg-blue-50 hover:border-blue-200 text-left shadow-sm transition-all">
                        🇯🇵 "Plan a 5 day trip to Kyoto"
                    </button>
                    <button onClick={() => onSendMessage("Best transport Prague to CK Town?")} className="text-sm bg-white border border-gray-200 p-3 rounded-xl hover:bg-blue-50 hover:border-blue-200 text-left shadow-sm transition-all">
                        🚌 "Best transport Prague to CK?"
                    </button>
                </div>
            </div>
        )}

        {messages.map((msg, idx) => {
           const isUser = msg.role === 'user';
           return (
            <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${isUser ? 'bg-primary text-white' : 'bg-white border text-primary'}`}>
                  {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  {isUser ? (
                    msg.text
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown 
                        components={{
                            a: ({node, ...props}) => <a {...props} target="_blank" className="text-blue-500 underline font-medium" rel="noreferrer" />,
                            ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 my-2" />,
                            ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 my-2" />,
                            strong: ({node, ...props}) => <strong {...props} className="font-semibold" />
                        }}
                      >
                        {cleanText(msg.text)}
                      </ReactMarkdown>
                      {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse"></span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Input Area - Adjusted for Bottom Nav */}
      <div className="bg-white p-3 border-t border-gray-200 w-full z-20 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center max-w-3xl mx-auto w-full">
          <input
            type="text"
            className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 border-0 rounded-full py-3 px-5 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`p-3 rounded-full flex-shrink-0 transition-all transform active:scale-95 ${
                isLoading || !input.trim() 
                ? 'bg-gray-100 text-gray-400' 
                : 'bg-primary text-white shadow-md hover:bg-blue-700'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;