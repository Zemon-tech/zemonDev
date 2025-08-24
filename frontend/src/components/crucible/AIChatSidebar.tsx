import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Copy, BookmarkPlus, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { updateNotes } from '../../lib/crucibleApi';
import { useToast } from '../ui/toast';
import { useWorkspace } from '../../lib/WorkspaceContext';
import ShinyText from '../blocks/TextAnimations/ShinyText/ShinyText';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
  messages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  solutionContent?: string;
}

// Enhanced Markdown Components - Compact Design with Proper Indentation and Table Scrolling
const MarkdownComponents = {
  h1: ({ children, ...props }: any) => (
    <h1 className="text-lg font-bold text-base-content mb-1 mt-2 first:mt-0 border-b border-base-300/50 pb-1" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-base font-semibold text-base-content mb-1 mt-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-sm font-medium text-base-content mb-0.5 mt-1.5" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: any) => (
    <p className="text-sm text-base-content/90 leading-relaxed mb-1 last:mb-0" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc space-y-0.5 mb-1 text-sm text-base-content/90 ml-5" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal space-y-0.5 mb-1 text-sm text-base-content/90 ml-5" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="text-sm text-base-content/90 leading-relaxed" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-3 border-primary/30 pl-2.5 italic text-sm text-base-content/80 bg-base-200/30 py-1 rounded-r-md mb-1" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: any) => (
    <div 
      className="my-1.5 w-full overflow-x-auto border border-base-300 dark:border-base-600 rounded-md shadow-sm relative"
      tabIndex={0}
      role="region"
      aria-label="Scrollable table content"
    >
      <table className="w-full border-collapse bg-base-100 dark:bg-base-700 text-xs min-w-full" {...props}>
        {children}
      </table>
      {/* Scroll indicator */}
      <div className="absolute top-2 right-2 bg-base-100 dark:bg-base-800 px-2 py-1 rounded text-xs text-base-content/60 border border-base-300 dark:border-base-600 pointer-events-none z-20 opacity-75">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          Scroll
        </span>
      </div>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody className="divide-y divide-base-200 dark:divide-base-600" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-base-50 dark:hover:bg-base-600/50 transition-colors duration-150" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-2 py-1.5 text-left text-xs font-semibold text-base-content/90 border-b border-base-200 dark:border-base-600 whitespace-nowrap" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-2 py-1.5 text-xs text-base-content/80 whitespace-nowrap" {...props}>
      {children}
    </td>
  ),
  code: ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <div className="my-1 w-full">
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          className="rounded-md border border-base-300 text-xs"
          customStyle={{
            fontSize: '0.75rem',
            lineHeight: '1.4',
            padding: '0.75rem'
          }}
          {...props}
        >
          {String(children || '').replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-base-200 text-base-content px-1.5 py-0.5 rounded text-xs font-mono border border-base-300" {...props}>
        {children}
      </code>
    );
  },
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold text-base-content text-sm" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic text-base-content/90 text-sm" {...props}>
      {children}
    </em>
  ),
  a: ({ children, href, ...props }: any) => (
    <a 
      href={href} 
      className="text-primary hover:text-primary-focus underline decoration-primary/30 underline-offset-2 transition-colors text-sm" 
      target="_blank" 
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
};

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({ 
  onClose,
  problemId,
  messages: initialMessages = [],
  solutionContent
}) => {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const { chatSidebarWidth, setChatSidebarWidth } = useWorkspace();
  const [messagesState, setMessages] = useState<Message[]>(
    initialMessages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9)
    }))
  );
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Add custom styles for better markdown formatting and table scrolling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced table scrolling with proper styling */
      .ai-chat-message .overflow-x-auto {
        position: relative;
        border-radius: 0.375rem;
        background: hsl(var(--b1));
        margin: 0.5rem 0;
        max-width: 100%;
        overflow: hidden;
      }
      
      /* Smooth scrolling for tables */
      .ai-chat-message .overflow-x-auto {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
      }
      
      /* Custom scrollbar for table containers */
      .ai-chat-message .overflow-x-auto::-webkit-scrollbar {
        height: 8px;
      }
      
      .ai-chat-message .overflow-x-auto::-webkit-scrollbar-track {
        background: hsl(var(--b2));
        border-radius: 4px;
        margin: 0 0.25rem;
      }
      
      .ai-chat-message .overflow-x-auto::-webkit-scrollbar-thumb {
        background: hsl(var(--p) / 0.6);
        border-radius: 4px;
        border: 1px solid hsl(var(--b2));
      }
      
      .ai-chat-message .overflow-x-auto::-webkit-scrollbar-thumb:hover {
        background: hsl(var(--p) / 0.8);
      }
      
      /* Firefox scrollbar */
      .ai-chat-message .overflow-x-auto {
        scrollbar-width: thin;
        scrollbar-color: hsl(var(--p) / 0.6) hsl(var(--b2));
      }
      
      /* Improve list indentation for nested items */
      .ai-chat-message .markdown-content ul ul {
        list-style-type: circle;
        margin-left: 1.5rem;
      }
      
      .ai-chat-message .markdown-content ul ul ul {
        list-style-type: square;
        margin-left: 1.5rem;
      }
      
      .ai-chat-message .markdown-content ol ol {
        list-style-type: lower-alpha;
        margin-left: 1.5rem;
      }
      
      .ai-chat-message .markdown-content ol ol ol {
        list-style-type: lower-roman;
        margin-left: 1.5rem;
      }
      
      /* Ensure proper table cell sizing */
      .ai-chat-message .markdown-content table {
        table-layout: auto;
        width: auto;
        min-width: 100%;
      }
      
      .ai-chat-message .markdown-content th,
      .ai-chat-message .markdown-content td {
        min-width: 120px;
        padding: 0.5rem 0.75rem;
      }
      
      /* Responsive table improvements */
      @media (max-width: 768px) {
        .ai-chat-message .markdown-content table {
          min-width: 400px;
        }
        
        .ai-chat-message .markdown-content th,
        .ai-chat-message .markdown-content td {
          min-width: 80px;
          padding: 0.5rem 0.75rem;
        }
      }
      
      /* Small screen table adjustments */
      @media (max-width: 480px) {
        .ai-chat-message .markdown-content table {
          min-width: 300px;
        }
        
        .ai-chat-message .markdown-content th,
        .ai-chat-message .markdown-content td {
          min-width: 60px;
          padding: 0.375rem 0.5rem;
          font-size: 0.75rem;
        }
      }
      
      /* Fix message spacing and prevent overflow */
      .ai-chat-message {
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
      }
      
      .ai-chat-message-user {
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
      }
      
      /* Ensure proper message container sizing */
      .chat-bubble {
        max-width: 100%;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      /* Scroll indicator positioning */
      .ai-chat-message .overflow-x-auto .absolute {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        z-index: 20;
      }
      
      /* Enhanced scroll indicator animation */
      .ai-chat-message .overflow-x-auto .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      
      /* Table hover effects for better UX */
      .ai-chat-message .markdown-content tbody tr:hover {
        background-color: hsl(var(--b2) / 0.5);
        transition: background-color 0.15s ease-in-out;
      }
      
      /* Ensure table headers are sticky for better readability */
      .ai-chat-message .markdown-content thead th {
        position: sticky;
        top: 0;
        background: hsl(var(--b1));
        z-index: 10;
        border-bottom: 2px solid hsl(var(--b3));
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initialize chat session
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('🔧 Initializing chat for problem:', problemId);
        const token = await getToken();
        if (!token) {
          console.log('❌ No token available');
          return;
        }

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://zemondev.onrender.com';
        console.log('🌐 Using backend URL:', backendUrl);
        const response = await fetch(`${backendUrl}/api/crucible/${problemId}/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title: 'New Chat' })
        });

        const data = await response.json();
        console.log('📡 Chat initialization response:', data);
        if (data.success) {
          setCurrentChatId(data.data._id);
          console.log('✅ Chat initialized with ID:', data.data._id);
        } else {
          console.log('❌ Chat initialization failed:', data);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    if (!currentChatId) {
      initializeChat();
    }
  }, [problemId, getToken, currentChatId]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

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
        setChatSidebarWidth(newWidth);
      }
    }
  }, [isResizing, setChatSidebarWidth]);

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
      // Use the new addAIContentToNotes function from NotesCollector
      if (typeof window !== 'undefined' && (window as any).addAIContentToNotes) {
        const success = await (window as any).addAIContentToNotes(content);
        
        if (success) {
          toast({
            title: "Success",
            description: "AI response added to notes",
          });
        } else {
          throw new Error('Failed to add to notes');
        }
      } else {
        // Fallback to old method if NotesCollector is not available
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
      }
    } catch (error) {
      console.error('Error adding to notes:', error);
      toast({
        title: "Error",
        description: "Failed to add content to notes",
        variant: "error",
      });
    }
  }, [problemId, getToken, toast]);

  const handleRetryPrompt = async (content: string) => {
    setInputMessage(content);
    await handleSendMessage(content);
  };

  const handleSendMessage = async (messageContent?: string) => {
    const contentToSend = messageContent || inputMessage.trim();
    if (!contentToSend || !currentChatId) {
      console.log('❌ Cannot send message:', { contentToSend, currentChatId });
      return;
    }
    
    console.log('🚀 Sending message:', { contentToSend, currentChatId, problemId });

    const newMessage: Message = {
      role: 'user',
      content: contentToSend,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9)
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    const startTime = Date.now();

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create streaming message placeholder
      const streamingMessageId = Math.random().toString(36).substr(2, 9);
      const streamingMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        id: streamingMessageId,
        isStreaming: true
      };
      
      setMessages(prev => [...prev, streamingMessage]);
      setStreamingMessageId(streamingMessageId);

      console.log('Starting streaming request...');
      
      // Use enhanced endpoint if web search is enabled, otherwise use regular streaming endpoint
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://zemondev.onrender.com';
      const endpoint = `${backendUrl}/api/crucible/${problemId}/chats/${currentChatId}/messages/stream`;
      
      // Prepare request body based on endpoint
      const requestBody = {
            content: contentToSend,
            solutionDraftContent: solutionContent
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      console.log(`Streaming response started in ${Date.now() - startTime}ms`);
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let lastUpdateTime = Date.now();
      let totalChunks = 0;
      let totalCharacters = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log(`Stream completed. Total: ${totalChunks} chunks, ${totalCharacters} characters in ${Date.now() - startTime}ms`);
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(6);
              if (!jsonData.trim()) continue; // Skip empty lines
              
              const data = JSON.parse(jsonData);
              
              if (data.type === 'chunk' && data.content) {
                const now = Date.now();
                totalChunks++;
                totalCharacters += data.content.length;
                const wordCount = data.wordCount || data.content.trim().split(/\s+/).length;
                console.log(`Received chunk #${totalChunks} in ${now - lastUpdateTime}ms: ${wordCount} words`);
                lastUpdateTime = now;
                
                // Update message immediately for real-time feel
                setMessages(prev => prev.map(msg => 
                  msg.id === streamingMessageId 
                    ? { ...msg, content: msg.content + data.content }
                    : msg
                ));
                
                // Immediate scroll for real-time feel
                messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
              } else if (data.type === 'complete') {
                const totalTime = Date.now() - startTime;
                const throughput = totalCharacters / (totalTime / 1000);
                console.log(`Stream completed successfully in ${totalTime}ms`);
                console.log(`Performance: ${totalChunks} chunks, ${totalCharacters} chars, ${throughput.toFixed(2)} chars/sec`);
                
                if (data.metrics) {
                  console.log('Server metrics:', data.metrics);
                }
                
                setMessages(prev => prev.map(msg => 
                  msg.id === streamingMessageId 
                    ? { ...msg, isStreaming: false }
                    : msg
                ));
                setStreamingMessageId(null);
                break;
              } else if (data.type === 'error') {
                console.error('Stream error:', data.message);
                setMessages(prev => prev.filter(msg => msg.id !== streamingMessageId));
                toast({
                  title: "Error",
                  description: data.message || "An error occurred during streaming",
                  variant: "error",
                });
                break;
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error, 'Line:', line);
              // Continue processing other lines instead of breaking
            }
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove streaming message on error
      if (streamingMessageId) {
        setMessages(prev => prev.filter(msg => msg.id !== streamingMessageId));
        setStreamingMessageId(null);
      }
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('⌨️ Enter key pressed');
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
    }
  };

  const MessageActions = ({ message }: { message: Message }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleCopyMessage(message.content)}
        className="btn btn-ghost btn-xs p-1.5 rounded-lg hover:bg-base-200/50 transition-colors tooltip tooltip-top"
        data-tip="Copy message"
      >
        <Copy className="w-3 h-3" />
      </button>
      {message.role === 'assistant' && !message.isStreaming && (
        <>
          <button
            onClick={() => handleAddToNotes(message.content)}
            className="btn btn-ghost btn-xs p-1.5 rounded-lg hover:bg-base-200/50 transition-colors tooltip tooltip-top"
            data-tip="Add to notes"
          >
            <BookmarkPlus className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleRetryPrompt(message.content)}
            className="btn btn-ghost btn-xs p-1.5 rounded-lg hover:bg-base-200/50 transition-colors tooltip tooltip-top"
            data-tip="Retry prompt"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );

  const handleSendClick = () => {
    console.log('🖱️ Send button clicked');
    console.log('📝 Input message:', inputMessage);
    console.log('🔑 Current chat ID:', currentChatId);
    handleSendMessage();
  };

  return (
    <aside 
      className="h-full bg-gradient-to-br from-base-100 to-base-50 dark:from-base-800 dark:to-base-900 border-l border-base-200 dark:border-base-700 shadow-xl flex flex-col overflow-hidden relative backdrop-blur-sm chat-sidebar"
      style={{ 
        width: `${chatSidebarWidth}px`,
        minWidth: '280px',
        maxWidth: '50vw',
        transition: isResizing ? 'none' : 'width 0.1s ease-out'
      }}
    >
      {/* Resize handle */}
      <div 
        className="absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-primary/20 z-10 transition-colors"
        onMouseDown={startResizing}
      />

      {/* Compact Top bar */}
      <div className="h-10 min-h-[2.5rem] px-4 border-b border-base-200 dark:border-base-700 flex items-center justify-between shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Sparkles className="h-3 w-3 text-primary-content" />
          </div>
          <div>
            <h3 className="font-medium text-sm text-base-content">AI Assistant</h3>
            <div className="flex items-center gap-1 group relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium cursor-help">Intelligent Web Search</span>
              
              {/* Info Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-base-800 text-base-content text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                <div className="text-center">
                  <div className="font-semibold mb-1">🌐 Intelligent Web Search</div>
                  <div className="text-xs text-base-content/80">
                    AI automatically uses web search for:
                    <br />• Current events & news
                    <br />• Latest developments
                    <br />• Recent research
                    <br />• Factual queries
                  </div>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-base-800"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-sm p-1.5 h-6 w-6 rounded-lg hover:bg-base-200/50 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Chat messages */}
      <ScrollArea.Root className="flex-1 relative">
        <ScrollArea.Viewport className="absolute inset-0 overflow-y-auto chat-scrollbar">
          <div className="p-4 space-y-1">
            {messagesState.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`${message.role === 'user' ? 'max-w-[85%] order-2' : 'w-full order-1'}`}>
                  {/* Message Header */}
                  <div className={`text-xs text-base-content/50 mb-0 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  
                  {/* Message Content */}
                  {message.role === 'user' ? (
                    <div className="chat chat-end">
                      <div className="chat-bubble chat-bubble-sm bg-primary text-primary-content shadow-lg ai-chat-message-user">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-xs dark:prose-invert w-full markdown-content ai-chat-message pl-0">
                      {message.isStreaming ? (
                        <div>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={MarkdownComponents}
                          >
                            {message.content}
                          </ReactMarkdown>
                          <DynamicTypingIndicator />
                        </div>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={MarkdownComponents}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  )}
                  
                  {/* Message Actions */}
                  <div className={`flex items-center gap-1 mt-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <MessageActions message={message} />
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && !streamingMessageId && (
              <div className="flex justify-start">
                <div className="w-full">
                  <div className="text-xs text-base-content/50 mb-0.5">AI Assistant</div>
                  <div className="prose prose-sm dark:prose-invert w-full markdown-content">
                    <DynamicTypingIndicator />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="flex select-none touch-none p-0.5 bg-base-100 dark:bg-base-800 transition-colors duration-150 ease-out hover:bg-base-200 dark:hover:bg-base-700 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5">
          <ScrollArea.Thumb className="flex-1 bg-base-300 dark:bg-base-600 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

            {/* Beautiful Compact Input area */}
      <div className="p-3 border-t border-base-200 dark:border-base-700 shrink-0 bg-gradient-to-t from-base-100 to-transparent">
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything - AI automatically uses web search when needed..."
            className="textarea textarea-bordered w-full resize-none min-h-[45px] max-h-20 rounded-xl border border-base-300 focus:border-primary focus:outline-none transition-all duration-200 bg-base-50 dark:bg-base-800 text-base-content placeholder:text-base-content/40 pr-14 chat-input"
            disabled={isLoading}
            style={{ 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(8px)'
            }}
          />
          
          {/* Beautiful action buttons */}
          <div className="absolute right-1 bottom-1 flex items-center gap-1">
            <button
              onClick={handleFileClick}
              className="btn btn-ghost btn-xs p-1 rounded-lg hover:bg-base-200/60 transition-all duration-200 hover:scale-105"
              disabled={isLoading}
            >
              <Paperclip className="w-3 h-3" />
            </button>
            <button
              onClick={handleSendClick}
              className="btn btn-primary btn-xs p-1 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 hover:scale-105"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css"
          />
        </div>
      </div>
    </aside>
  );
};

// Dynamic Typing Indicator Component
const DynamicTypingIndicator: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const phrases = [
    "AI is thinking...",
    "Fetching the output...",
    "Taking a moment...",
    "Crunching the data...",
    "Generating insights..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 2000); // Change phrase every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-base-content/80 justify-start w-full typing-indicator">
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <ShinyText 
        text={phrases[currentIndex]} 
        speed={3}
        className="text-sm"
      />
    </div>
  );
};

export default AIChatSidebar; 