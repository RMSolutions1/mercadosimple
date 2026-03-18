'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, MessageCircle, Package } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Conversation, Message } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    searchParams.get('conversationId')
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      const returnUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.pathname + window.location.search) : '/chat';
      router.push('/auth/login?returnUrl=' + returnUrl);
      return;
    }
    fetchConversations();
  }, [isAuthenticated]);

  // Iniciar conversación desde parámetro sellerId en la URL
  useEffect(() => {
    const sellerId = searchParams.get('sellerId');
    const productId = searchParams.get('productId');
    if (!sellerId || !isAuthenticated) return;

    const startConversation = async () => {
      try {
        const { data } = await api.post('/chat/conversations', {
          sellerId,
          ...(productId && { productId }),
        });
        setSelectedConvId(data.id);
        await fetchConversations();
      } catch {
        toast.error('No se pudo iniciar la conversación');
      }
    };

    startConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => fetchMessages(selectedConvId), 5000);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data);
      if (!selectedConvId && data.length > 0) {
        setSelectedConvId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const { data } = await api.get(`/chat/conversations/${convId}/messages`);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId) return;
    setSendingMessage(true);
    try {
      await api.post(`/chat/conversations/${selectedConvId}/messages`, { content: newMessage.trim() });
      setNewMessage('');
      await fetchMessages(selectedConvId);
    } catch (error) {
      toast.error('Error al enviar mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const getOtherUser = (conv: Conversation) => user?.id === conv.buyer?.id ? conv.seller : conv.buyer;

  if (!isAuthenticated) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[600px] flex">
      {/* Conversations list */}
      <div className="w-72 border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-700">Conversaciones</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded" />)}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No hay conversaciones</p>
              <p className="text-xs text-gray-400 mt-1">Contáctate con un vendedor desde la página de un producto</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedConvId === conv.id ? 'bg-blue-50 border-l-2 border-l-ms-blue' : ''}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-ms-blue text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{otherUser?.name || 'Usuario'}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-ms-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-bold">{conv.unreadCount}</span>
                        )}
                      </div>
                      {conv.product && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                          <Package className="w-3 h-3" /> {conv.product.title}
                        </p>
                      )}
                      {conv.lastMessageAt && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeDate(conv.lastMessageAt)}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-ms-blue text-white flex items-center justify-center text-sm font-bold">
                  {getOtherUser(selectedConv)?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{getOtherUser(selectedConv)?.name}</p>
                  {selectedConv.product && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Package className="w-3 h-3" /><span className="truncate max-w-48">{selectedConv.product.title}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center"><MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-500">Iniciá la conversación</p></div>
                </div>
              ) : (
                messages.map((message) => {
                  const isMine = message.sender?.id === user?.id;
                  return (
                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl shadow-sm ${isMine ? 'bg-ms-blue text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'}`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(message.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribí un mensaje..." className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ms-blue" />
                <button type="submit" disabled={!newMessage.trim() || sendingMessage} className="bg-ms-blue text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center"><MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" /><p className="text-gray-500">Seleccioná una conversación</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mensajes</h1>
      <Suspense fallback={
        <div className="bg-white rounded-xl border border-gray-200 h-[600px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-ms-blue border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ChatContent />
      </Suspense>
    </div>
  );
}
