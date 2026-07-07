import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/shared/Avatar';
import { api } from '@/services/api';
import type { ChatMessage, User } from '@/types';

interface ChatPanelProps {
  currentUserId: string;
  recipient: Pick<User, 'id' | 'nome'>;
  headerLabel: string;
  emptyMessage: string;
}

export function ChatPanel({
  currentUserId,
  recipient,
  headerLabel,
  emptyMessage,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const chatMessages = await api.getChatConversation(
          currentUserId,
          recipient.id,
        );

        setMessages(chatMessages);
        setError('');

        await api.markChatConversationAsRead(
          currentUserId,
          recipient.id,
        );
      } catch (loadError) {
        console.error(
          'Erro ao carregar conversa:',
          loadError,
        );

        if (showLoading) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Erro ao carregar conversa.',
          );
        }
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [currentUserId, recipient.id],
  );

  useEffect(() => {
    setMessages([]);
    setMessage('');
    setError('');

    void loadMessages(true);

    const intervalId = window.setInterval(() => {
      void loadMessages(false);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    const content = message.trim();

    if (!content || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError('');

      const sentMessage = await api.sendChatMessage({
        senderId: currentUserId,
        receiverId: recipient.id,
        message: content,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        sentMessage,
      ]);

      setMessage('');
    } catch (sendError) {
      console.error(
        'Erro ao enviar mensagem:',
        sendError,
      );

      setError(
        sendError instanceof Error
          ? sendError.message
          : 'Erro ao enviar mensagem.',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-5 border-b border-white/5 flex items-center gap-4 shrink-0">
        <Avatar nome={recipient.nome} size="sm" />

        <div>
          <h3 className="font-bold">
            {recipient.nome}
          </h3>

          <p className="text-[10px] text-brand-green uppercase tracking-widest font-bold">
            {headerLabel}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 p-6 overflow-y-auto space-y-4 custom-scrollbar"
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Carregando conversa...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
            <MessageSquare className="w-12 h-12 mb-4" />

            <p className="text-sm font-bold uppercase tracking-widest">
              {emptyMessage}
            </p>
          </div>
        ) : (
          messages.map((chatMessage) => {
            const isMine =
              chatMessage.senderId === currentUserId;

            return (
              <div
                key={chatMessage.id}
                className={`flex ${
                  isMine
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div className="max-w-[80%]">
                  <div
                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? 'bg-brand-green text-black rounded-br-none'
                        : 'bg-white/5 text-white rounded-bl-none border border-white/5'
                    }`}
                  >
                    {chatMessage.message}
                  </div>

                  <p
                    className={`text-[9px] mt-2 font-bold uppercase tracking-widest text-gray-600 ${
                      isMine
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {new Date(
                      chatMessage.createdAt,
                    ).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-white/5 shrink-0"
      >
        {error && (
          <p className="text-red-400 text-xs mb-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Input
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Digite sua mensagem..."
            maxLength={4000}
            disabled={isSending}
            className="flex-1 h-12 bg-white/5 border-white/10 rounded-2xl focus:border-brand-green/50 cursor-text"
          />

          <Button
            type="submit"
            disabled={
              isSending || !message.trim()
            }
            className="w-12 h-12 bg-brand-green hover:bg-emerald-600 text-black rounded-2xl cursor-pointer shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}