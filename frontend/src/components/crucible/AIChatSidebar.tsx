import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Copy, BookmarkPlus, RotateCcw } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { updateNotes } from '../../lib/crucibleApi';
import { useToast } from '../ui/toast';
import { Button } from '../ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({ 
  isOpen,
  onClose,
  problemId,
  messages,
}) => {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [messagesState, setMessages] = useState<Message[]>(messages.map((m) => ({
    role: m.role,
    content: m.content,
    timestamp: new Date(),
    id: Math.random().toString(36).substr(2, 9)
  })));
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize chat session
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(`/api/crucible/${problemId}/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title: 'New Chat' })
        });

        const data = await response.json();
        if (data.success) {
          setCurrentChatId(data.data._id);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    if (!currentChatId) {
      initializeChat();
    }
  }, [problemId, getToken, currentChatId]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const maxWidth = window.innerWidth / 2;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 280 && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesState]);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      description: 'Message copied to clipboard',
      variant: 'success'
    });
  };

  const handleAddToNotes = useCallback(async (content: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      await updateNotes(problemId, content, [], () => Promise.resolve(token));
      
      // Refresh the NotesCollector
      if (typeof window !== 'undefined' && (window as any).refreshNotesCollector) {
        (window as any).refreshNotesCollector();
      }
      
      toast({
        title: "Success",
        description: "Content added to notes",
      });
    } catch (error) {
      console.error('Error adding to notes:', error);
      toast({
        title: "Error",
        description: "Failed to add content to notes",
        variant: "destructive",
      });
    }
  }, [problemId, getToken, toast]);

  const handleRetryPrompt = async (content: string) => {
    setInputMessage(content);
    await handleSendMessage(content);
  };

  const handleSendMessage = async (messageContent?: string) => {
    const contentToSend = messageContent || inputMessage.trim();
    if (!contentToSend || !currentChatId) return;

    const newMessage: Message = {
      role: 'user',
      content: contentToSend,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9)
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/crucible/${problemId}/chats/${currentChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: contentToSend })
      });

      const data = await response.json();
      
      if (data.success) {
        const aiResponse: Message = {
          role: 'assistant',
          content: data.data.messages[data.data.messages.length - 1].content,
          timestamp: new Date(),
          id: Math.random().toString(36).substr(2, 9)
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    const file = e.target.files?.[0];
    if (file) {
      // Implement file handling logic
      console.log('File selected:', file);
    }
  };

  const MessageActions = ({ message }: { message: Message }) => (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => handleCopyMessage(message.content)}
        className="btn btn-ghost btn-xs tooltip tooltip-top"
        data-tip="Copy message"
      >
        <Copy className="w-3 h-3" />
      </button>
      {message.role === 'assistant' && (
        <>
          <button
            onClick={() => handleAddToNotes(message.content)}
            className="btn btn-ghost btn-xs tooltip tooltip-top"
            data-tip="Add to notes"
          >
            <BookmarkPlus className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleRetryPrompt(message.content)}
            className="btn btn-ghost btn-xs tooltip tooltip-top"
            data-tip="Retry prompt"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );

  const handleSendClick = () => {
    handleSendMessage();
  };

  return (
    <aside 
      className="h-full bg-base-100 dark:bg-base-800 border-l border-base-200 dark:border-base-700 flex flex-col overflow-hidden relative"
      style={{ 
        width: `${width}px`,
        minWidth: '280px',
        maxWidth: '50vw',
        transition: isResizing ? 'none' : 'width 0.1s ease-out'
      }}
    >
      {/* Resize handle */}
      <div 
        className="absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-primary/20 z-10"
        onMouseDown={startResizing}
      />

      {/* Top bar */}
      <div className="h-12 min-h-[3rem] px-4 border-b border-base-200 dark:border-base-700 flex items-center justify-between shrink-0">
        <h3 className="font-medium text-sm">AI Assistant</h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm p-0 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Chat messages */}
      <ScrollArea.Root className="flex-1 relative">
        <ScrollArea.Viewport className="absolute inset-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            {messagesState.map((message) => (
              <div
                key={message.id}
                className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'} group`}
              >
                <div className="chat-header opacity-50 text-xs mb-1">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className={`chat-bubble ${message.role === 'assistant' ? 'chat-bubble-primary' : ''}`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ inline, className, children, ...props }: CodeBlockProps) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children || '').replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <div className="chat-footer opacity-50 text-xs mt-1">
                  <MessageActions message={message} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat chat-start">
                <div className="chat-header opacity-50 text-xs mb-1">
                  AI Assistant
                </div>
                <div className="chat-bubble chat-bubble-primary">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar 
          className="flex select-none touch-none p-0.5 bg-base-200/50 transition-colors duration-150 ease-out hover:bg-base-300/50 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2" 
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-base-300 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      
      {/* Input area */}
      <div className="h-12 min-h-[3rem] p-2 border-t border-base-200 dark:border-base-700 bg-base-100 shrink-0">
        <div className="flex items-center gap-2 h-full">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            className="input input-bordered input-sm flex-1"
            disabled={!currentChatId}
          />
          <button
            onClick={handleFileClick}
            className="btn btn-ghost btn-square btn-sm"
            disabled={!currentChatId}
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            onClick={handleSendClick}
            disabled={!inputMessage.trim() || isLoading || !currentChatId}
            className="btn btn-primary btn-square btn-sm"
          >
            <Send className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </aside>
  );
};

export default AIChatSidebar; 