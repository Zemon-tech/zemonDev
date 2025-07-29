'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Trash2, Plus, BookOpen, Sparkles, Tag, Clock, Search, Filter } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { getNotes, updateNotes } from '../../lib/crucibleApi';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface NotesCollectorProps {
  problemId: string;
  onChange?: (content: string) => void;
}

interface Note {
  id: string;
  content: string;
  tags: string[];
  timestamp: number;
  type: 'manual' | 'ai' | 'auto';
  title?: string;
}

export default function NotesCollector({ problemId, onChange }: NotesCollectorProps) {
  const { getToken } = useAuth();
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'; // Max 4 lines
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [newNote, adjustTextareaHeight]);

  // Load notes from backend
  const loadNotes = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await getNotes(problemId, () => Promise.resolve(token));
      if (response.content) {
        // Split by the separator we use when saving
        const noteContents = response.content.split('\n\n---\n\n').filter(Boolean);
        const savedNotes = noteContents.map((content, index) => ({
          id: `note-${Date.now()}-${index}`,
          content: content.trim(),
          tags: response.tags || [],
          timestamp: Date.now() - (index * 1000),
          type: 'manual' as const,
          title: content.split('\n')[0].substring(0, 50) + (content.split('\n')[0].length > 50 ? '...' : '')
        }));
        setNotes(savedNotes);
      } else {
        setNotes([]);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load notes:', err);
      setIsLoading(false);
    }
  }, [problemId, getToken]);

  // Load notes on mount and when problemId changes
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Save notes to backend
  const saveNotes = useCallback(async (updatedNotes: Note[]) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const content = updatedNotes.map(note => note.content).join('\n\n---\n\n');
      const tags = Array.from(new Set(updatedNotes.flatMap(note => note.tags)));
      
      await updateNotes(problemId, content, tags, () => Promise.resolve(token));
      
      // Don't reload notes after saving to avoid race conditions
      // The local state is already updated, so we trust it
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  }, [problemId, getToken]);

  // Handle note submission
  const handleSubmit = useCallback(() => {
    if (!newNote.trim()) return;

    const updatedNotes = [
      ...notes,
      {
        id: `note-${Date.now()}`,
        content: newNote.trim(),
        tags: [],
        timestamp: Date.now(),
        type: 'manual' as const,
        title: newNote.trim().split('\n')[0].substring(0, 50) + (newNote.trim().split('\n')[0].length > 50 ? '...' : '')
      }
    ];

    setNotes(updatedNotes);
    setNewNote('');
    saveNotes(updatedNotes);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '32px';
    }
  }, [newNote, notes, saveNotes]);

  // Handle note deletion
  const handleDelete = useCallback((noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Add AI content to notes (called from AI chat sidebar)
  const addAIContentToNotes = useCallback(async (aiContent: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      const aiNote: Note = {
        id: `ai-note-${Date.now()}`,
        content: aiContent,
        tags: ['ai-response', 'assistant'],
        timestamp: Date.now(),
        type: 'ai' as const,
        title: aiContent.split('\n')[0].substring(0, 50) + (aiContent.split('\n')[0].length > 50 ? '...' : '')
      };

      const updatedNotes = [...notes, aiNote];
      setNotes(updatedNotes);
      await saveNotes(updatedNotes);
      
      return true;
    } catch (error) {
      console.error('Error adding AI content to notes:', error);
      return false;
    }
  }, [notes, getToken, saveNotes]);

  // Expose the addAIContentToNotes method globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).addAIContentToNotes = addAIContentToNotes;
    }
  }, [addAIContentToNotes]);

  // Notify parent component when notes change
  useEffect(() => {
    if (onChange) {
      onChange(notes.map(note => note.content).join('\n\n---\n\n'));
    }
  }, [notes, onChange]);

  // Add a public method to force refresh notes
  const refreshNotes = useCallback(() => {
    loadNotes();
  }, [loadNotes]);

  // Expose the refresh method
  if (typeof window !== 'undefined') {
    (window as any).refreshNotesCollector = refreshNotes;
  }

  // Filter notes based on search and tags
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => note.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Markdown components for rendering note content
  const MarkdownComponents = {
    h1: ({ children, ...props }: any) => (
      <h1 className="text-lg font-bold text-base-content mb-2 mt-3 first:mt-0" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-base font-semibold text-base-content mb-2 mt-3" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-sm font-medium text-base-content mb-1 mt-2" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }: any) => (
      <p className="text-base-content/90 leading-relaxed mb-2 last:mb-0 text-sm" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside space-y-0.5 mb-2 text-base-content/90 text-sm" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside space-y-0.5 mb-2 text-base-content/90 text-sm" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-sm" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-3 border-primary/30 pl-3 italic text-base-content/80 bg-base-200/30 py-1 rounded-r-lg mb-2 text-sm" {...props}>
        {children}
      </blockquote>
    ),
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <div className="relative my-2">
          <div className="absolute top-1 right-2 text-xs text-base-content/50 bg-base-300/50 px-2 py-0.5 rounded">
            {match?.[1] || 'text'}
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={match?.[1] || 'text'}
            PreTag="div"
            className="rounded-lg text-xs"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-base-200/50 text-primary px-1 py-0.5 rounded text-xs font-mono" {...props}>
          {children}
        </code>
      );
    },
    strong: ({ children, ...props }: any) => (
      <strong className="font-semibold text-base-content" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic text-base-content/90" {...props}>
        {children}
      </em>
    ),
    a: ({ children, href, ...props }: any) => (
      <a href={href} className="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-2">
        <table className="min-w-full border-collapse border border-base-300 rounded-lg overflow-hidden" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-base-200/50" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody className="bg-base-100" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr className="border-b border-base-200 hover:bg-base-50/50 transition-colors" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }: any) => (
      <th className="px-3 py-2 text-left text-xs font-medium text-base-content/70 uppercase tracking-wider" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="px-3 py-2 text-xs text-base-content/90" {...props}>
        {children}
      </td>
    ),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-base-content/40">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm">Loading notes...</span>
        </div>
      </div>
    );
  }

      return (
      <div className="flex flex-col h-full notes-collector">
        {/* Beautiful Header */}
        <div className="sticky top-0 z-20 p-4 notes-header">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen className="w-4 h-4 text-primary-content" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-base-content">Notes</h2>
              <p className="text-xs text-base-content/60">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-base-200/50"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-2">
                      <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm notes-search rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

          {showFilters && (
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTags(prev => 
                    prev.includes(tag) 
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-content'
                      : 'bg-base-200/50 text-base-content/70 hover:bg-base-300/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Beautiful Input Area */}
      <div className="p-4 border-b border-base-200/50 dark:border-base-700/50 bg-gradient-to-t from-base-100 to-transparent">
        <div className="flex items-start gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Take notes here... (Press Enter to add)"
              className="w-full min-h-[32px] max-h-[120px] py-2 px-3 text-sm bg-base-200/30 dark:bg-base-800/30 border border-base-300/50 dark:border-base-600/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-base-content/40"
              style={{ height: '32px' }}
            />
          </div>
          <Button
            onClick={handleSubmit}
            size="sm"
            className="h-8 px-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-sm hover:shadow-md transition-all"
            disabled={!newNote.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea.Root className="flex-1 relative">
        <ScrollArea.Viewport className="absolute inset-0 overflow-y-auto">
          <div className="p-4 space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-base-content/30 dark:text-base-content/20 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium text-base-content/60">No notes yet</p>
                  <p className="text-xs mt-1 text-base-content/40">Start taking notes about this problem</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <div 
                    key={note.id} 
                    className={`group p-4 rounded-xl border transition-all duration-200 note-card ${
                      note.type === 'ai' 
                        ? 'ai-note' 
                        : 'bg-base-100 dark:bg-base-800/50 border-base-200/80 dark:border-base-600/50 hover:border-base-300 dark:hover:border-base-500'
                    }`}
                  >
                    {/* Note Header */}
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {note.type === 'ai' && (
                          <Sparkles className="w-4 h-4 text-primary" />
                        )}
                        <h3 className="text-sm font-medium text-base-content/90 line-clamp-1">
                          {note.title || 'Untitled Note'}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(note.id)}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 text-base-content/40 hover:text-error hover:bg-error/10 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Note Content */}
                    <div className="prose prose-xs dark:prose-invert max-w-none mb-3 note-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                      >
                        {note.content}
                      </ReactMarkdown>
                    </div>

                    {/* Note Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 text-xs rounded-md note-tag ${
                              note.type === 'ai'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-base-200/50 text-base-content/70'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-base-content/40">
                        <Clock className="w-3 h-3" />
                        <time>
                          {new Date(note.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="flex select-none touch-none p-0.5 bg-base-100 dark:bg-base-800 transition-colors duration-150 ease-out hover:bg-base-200 dark:hover:bg-base-700 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5">
          <ScrollArea.Thumb className="flex-1 bg-base-300 dark:bg-base-600 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
} 