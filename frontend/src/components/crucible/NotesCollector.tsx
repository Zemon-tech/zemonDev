'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Trash2, Plus } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { getNotes, updateNotes } from '../../lib/crucibleApi';

interface NotesCollectorProps {
  problemId: string;
  onChange?: (content: string) => void;
}

export default function NotesCollector({ problemId, onChange }: NotesCollectorProps) {
  const { getToken } = useAuth();
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<Array<{ id: string; content: string; tags: string[]; timestamp: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px'; // Max 3 lines (32px per line)
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
        const savedNotes = response.content.split('\n').filter(Boolean).map((content, index) => ({
          id: `note-${Date.now()}-${index}`,
          content,
          tags: response.tags || [],
          timestamp: Date.now() - (index * 1000)
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
  const saveNotes = useCallback(async (updatedNotes: typeof notes) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const content = updatedNotes.map(note => note.content).join('\n');
      const tags = Array.from(new Set(updatedNotes.flatMap(note => note.tags)));
      
      await updateNotes(problemId, content, tags, () => Promise.resolve(token));
      
      // Reload notes after saving to ensure consistency
      await loadNotes();
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  }, [problemId, getToken, loadNotes]);

  // Handle note submission
  const handleSubmit = useCallback(() => {
    if (!newNote.trim()) return;

    const updatedNotes = [
      ...notes,
      {
        id: `note-${Date.now()}`,
        content: newNote.trim(),
        tags: [],
        timestamp: Date.now()
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

  // Notify parent component when notes change
  useEffect(() => {
    if (onChange) {
      onChange(notes.map(note => note.content).join('\n'));
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-base-content/40">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 p-3 bg-base-100 border-b border-base-200 dark:border-base-700 shadow-sm">
        <div className="flex items-start gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Take notes here... (Press Enter to add)"
              className="w-full min-h-[32px] max-h-[96px] py-1.5 px-3 text-sm bg-transparent border border-base-200 dark:border-base-700 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              style={{ height: '32px' }}
            />
          </div>
          <Button
            onClick={handleSubmit}
            size="sm"
            className="h-8 px-3 bg-primary hover:bg-primary/90"
            disabled={!newNote.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-base-50/50 dark:bg-base-800/30">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-base-content/30 dark:text-base-content/20">
              <svg className="w-12 h-12 mx-auto mb-2 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium">No notes yet</p>
              <p className="text-xs mt-1">Start taking notes about this problem</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="group p-3 bg-base-100 dark:bg-base-700/50 rounded-lg border border-base-200/80 dark:border-base-600/50 hover:border-base-300 dark:hover:border-base-500 transition-all"
              >
                <div className="flex justify-between items-start gap-3">
                  <p className="flex-1 text-base-content dark:text-base-content/90 text-sm leading-relaxed">{note.content}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(note.id)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 text-base-content/40 hover:text-error hover:bg-error/10 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary text-[10px] rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <time className="text-[10px] text-base-content/40 dark:text-base-content/30">
                    {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 