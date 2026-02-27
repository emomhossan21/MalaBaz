import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, X, ArrowLeft, MessageSquare } from 'lucide-react';

export default function UserSupport({ user }: { user: any }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  useEffect(() => {
    if (activeTicket) {
      fetchMessages(activeTicket.id);
      const interval = setInterval(() => fetchMessages(activeTicket.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTickets = async () => {
    const res = await fetch(`/api/support/tickets/${user.id}`);
    if (res.ok) setTickets(await res.json());
  };

  const fetchMessages = async (ticketId: number) => {
    const res = await fetch(`/api/support/tickets/${ticketId}/messages`);
    if (res.ok) setMessages(await res.json());
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, subject: newSubject, message: newMessage, image_url: image })
    });

    if (res.ok) {
      const data = await res.json();
      setNewSubject('');
      setNewMessage('');
      setImage(null);
      setIsCreating(false);
      fetchTickets();
      setActiveTicket({ id: data.ticket_id, subject: newSubject, status: 'open' });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;

    const res = await fetch(`/api/support/tickets/${activeTicket.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_type: 'user', sender_id: user.id, message: newMessage, image_url: image })
    });

    if (res.ok) {
      setNewMessage('');
      setImage(null);
      fetchMessages(activeTicket.id);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-4xl font-black mb-4 dark:text-white">Returns & Exchanges</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Please log in to contact support regarding returns or exchanges.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 h-[calc(100vh-100px)] flex flex-col">
      <h1 className="text-3xl font-black mb-6 dark:text-white">Returns & Exchanges Support</h1>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden flex shadow-sm">
        
        {/* Sidebar - Ticket List */}
        <div className={`w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col ${activeTicket || isCreating ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => { setIsCreating(true); setActiveTicket(null); }}
              className="w-full bg-[#b8860b] text-white py-3 rounded-xl font-bold hover:bg-[#9a700a] transition-colors"
            >
              New Support Request
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {tickets.length === 0 ? (
              <p className="text-center text-slate-500 mt-8 text-sm">No support tickets yet.</p>
            ) : (
              tickets.map(ticket => (
                <button 
                  key={ticket.id}
                  onClick={() => { setActiveTicket(ticket); setIsCreating(false); }}
                  className={`w-full text-left p-4 rounded-xl transition-colors ${activeTicket?.id === ticket.id ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold dark:text-white truncate pr-2">{ticket.subject}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(ticket.updated_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${!activeTicket && !isCreating ? 'hidden md:flex items-center justify-center bg-slate-50 dark:bg-slate-900/50' : 'flex'}`}>
          
          {!activeTicket && !isCreating ? (
            <div className="text-center text-slate-400">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a ticket or create a new one</p>
            </div>
          ) : isCreating ? (
            <div className="flex-1 flex flex-col p-6">
              <div className="flex items-center gap-4 mb-6 md:hidden">
                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <ArrowLeft size={20} className="dark:text-white" />
                </button>
                <h2 className="text-xl font-bold dark:text-white">New Request</h2>
              </div>
              <h2 className="text-2xl font-bold mb-6 dark:text-white hidden md:block">Create New Support Request</h2>
              
              <form onSubmit={handleCreateTicket} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject (e.g., Return Order #123)</label>
                  <input 
                    required
                    type="text" 
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message Details</label>
                  <textarea 
                    required
                    rows={5}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white dark:text-white resize-none"
                  ></textarea>
                </div>
                
                {image && (
                  <div className="relative inline-block">
                    <img src={image} alt="Upload preview" className="h-32 rounded-lg border border-slate-200" />
                    <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                  <label className="cursor-pointer p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <ImageIcon size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <button type="submit" className="flex-1 bg-[#b8860b] text-white py-3 rounded-xl font-bold hover:bg-[#9a700a] transition-colors">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <button onClick={() => setActiveTicket(null)} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <ArrowLeft size={20} className="dark:text-white" />
                </button>
                <div>
                  <h3 className="font-bold dark:text-white">{activeTicket.subject}</h3>
                  <p className="text-xs text-slate-500">Status: {activeTicket.status}</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-4 ${msg.sender_type === 'user' ? 'bg-[#b8860b] text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 dark:text-white rounded-tl-sm shadow-sm'}`}>
                      {msg.image_url && (
                        <img src={msg.image_url} alt="Attachment" className="max-w-full rounded-lg mb-2" />
                      )}
                      <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                      <p className={`text-[10px] mt-2 text-right ${msg.sender_type === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              {activeTicket.status === 'open' ? (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                  {image && (
                    <div className="relative inline-block mb-4">
                      <img src={image} alt="Upload preview" className="h-20 rounded-lg border border-slate-200" />
                      <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <label className="cursor-pointer p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                      <ImageIcon size={24} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <textarea 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white dark:text-white resize-none max-h-32 min-h-[50px]"
                      rows={1}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim() && !image}
                      className="p-3 bg-[#b8860b] text-white rounded-xl hover:bg-[#9a700a] transition-colors disabled:opacity-50"
                    >
                      <Send size={24} />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 text-center text-slate-500 text-sm">
                  This ticket has been closed.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
