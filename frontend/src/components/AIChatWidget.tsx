import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageCircle, Minimize2, Maximize2, X } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI expense assistant. I can help you with:\n\n• Expense queries (e.g., "How much did I spend on food?")\n• Smart suggestions (e.g., "How should we split this bill?")\n• Balance insights\n• Categorization help\n\nWhat would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: userMessage.content });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-lg transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? 'auto' : '500px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-teal-100">Expense helper</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMinimize}
                  className="p-1 hover:bg-teal-700 rounded transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1 hover:bg-teal-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col h-96"
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              message.role === 'user'
                                ? 'bg-teal-100 dark:bg-teal-900'
                                : 'bg-rose-100 dark:bg-rose-900'
                            }`}>
                              {message.role === 'user' ? (
                                <User className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              ) : (
                                <Bot className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              )}
                            </div>
                            <div className={`rounded-xl px-3 py-2 ${
                              message.role === 'user'
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                            }`}>
                              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2 justify-start"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
                          <Bot className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                          <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-slate-200 dark:border-slate-700 p-3">
                    <div className="flex gap-2">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me about your expenses..."
                        className="flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        rows={1}
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        size="sm"
                        className="px-3 py-2"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}