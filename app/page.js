"use client"
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  'https://fkkcrphcophmolhkvjnz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZra2NycGhjb3BobW9saGt2am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MTMwODMsImV4cCI6MjA4NjM4OTA4M30.Bhl89g_ZwlGyj3Eg5mkJZar8ftRh5UdWxDQwH1BiQCQ'
);

// Map of custom animated emojis (Discord style)
const EMOJI_MAP = {
  ":fire:": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueHByZ3BqZzR3eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o72FfM5HJydzaMZOo/giphy.gif",
  ":hype:": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueHByZ3BqZzR3eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lTjJp9V8S6Z0Zq/giphy.gif",
  ":sad:": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueHByZ3BqZzR3eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/26fpzgfJ0Yh13tWdq/giphy.gif",
};

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);

  // Load existing messages and subscribe to new ones
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(50);
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase.channel('realtime_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const role = username === "Optimus" ? "owner" : (username === "Futbol+" ? "mod" : "user");

    await supabase.from('messages').insert([
      { username, content: inputValue, role }
    ]);
    setInputValue("");
  };

  const renderContent = (text) => {
    return text.split(" ").map((word, i) => {
      if (EMOJI_MAP[word]) {
        return <img key={i} src={EMOJI_MAP[word]} alt="emoji" className="inline-block w-6 h-6 mx-1 align-middle" />;
      }
      return word + " ";
    });
  };

  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-white p-6">
        <div className="w-full max-w-sm bg-[#1a1a1a] p-8 rounded-xl border border-gray-800 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome to PPVChat</h2>
          <input 
            className="w-full p-3 bg-black border border-gray-700 rounded mb-4 focus:border-blue-500 outline-none"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button 
            onClick={() => username && setIsJoined(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition"
          >
            Start Chatting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-900 bg-[#0a0a0a] flex justify-between items-center">
        <span className="font-bold text-lg">chat</span>
        <span className="text-green-500 text-xs flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> connected
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col">
            <div className="flex items-center gap-2">
              {msg.username === "Optimus" && (
                <span className="bg-[#5865F2] text-[10px] px-1.5 py-0.5 rounded font-bold text-white flex items-center gap-1">
                  🔧 SYSTEM
                </span>
              )}
              {msg.username === "Futbol+" && (
                <span className="bg-blue-500 text-[10px] px-1.5 py-0.5 rounded font-bold text-white">
                  🛡️ MOD
                </span>
              )}
              <span className={`text-[14px] font-bold ${
                msg.username === "Optimus" ? "optimus-sparkle" : 
                msg.username === "Futbol+" ? "futbol-sparkle" : "text-pink-500"
              }`}>
                {msg.username}:
              </span>
              <span className="text-[14px] leading-relaxed">
                {renderContent(msg.content)}
              </span>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#0a0a0a]">
        <div className="relative flex items-center bg-[#1a1a1a] rounded-lg border border-gray-800 p-1">
          <input 
            className="flex-1 bg-transparent p-3 text-sm outline-none"
            placeholder="Send a message (use :fire: :sad:)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="p-2 text-blue-500 hover:text-blue-400">
            <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
}
