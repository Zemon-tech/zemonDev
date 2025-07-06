'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWorkspace } from '../../lib/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Trash2, Tag, MessageSquarePlus } from 'lucide-react';

interface NotesCollectorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export default function NotesCollector({ initialContent = '', onChange }: NotesCollectorProps) {
  const { notes, addNote, removeNote } = useWorkspace();
  const [newNote, setNewNote] = useState(initialContent);

  // Update newNote when initialContent changes
  useEffect(() => {
    if (initialContent !== undefined) {
      setNewNote(initialContent);
    }
  }, [initialContent]);

  // Notify parent component when content changes
  useEffect(() => {
    if (onChange) {
      onChange(newNote);
    }
  }, [newNote, onChange]);

  const [tags, setTags] = useState<string[]>([]);

  // Auto-tag based on content
  const autoTag = useCallback((content: string): string[] => {
    const tags: string[] = [];
    
    // Common patterns to detect tags
    const patterns = {
      requirement: /must|should|needs? to|required|mandatory/i,
      constraint: /limit|maximum|minimum|only|cannot|restricted/i,
      assumption: /assume|assuming|given|suppose|presume/i,
      question: /\?|what|how|when|why|where|who/i,
      idea: /could|maybe|perhaps|idea|suggestion/i,
      risk: /risk|issue|problem|concern|careful/i,
      'tech-choice': /using|use|with|framework|library|tool/i,
    };

    // Check content against each pattern
    Object.entries(patterns).forEach(([tag, pattern]) => {
      if (pattern.test(content)) {
        tags.push(tag);
      }
    });

    return tags;
  }, []);

  // Handle note submission
  const handleSubmit = useCallback(() => {
    if (!newNote.trim()) return;

    // Get auto-generated tags
    const autoTags = autoTag(newNote);
    
    // Combine with any manually added tags
    const finalTags = [...new Set([...tags, ...autoTags])];

    // Add the note
    addNote({
      content: newNote.trim(),
      tags: finalTags
    });

    // Reset form
    setNewNote('');
    setTags([]);
  }, [newNote, tags, addNote, autoTag]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + N to focus note input
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'n') {
        e.preventDefault();
        const noteInput = document.getElementById('note-input');
        if (noteInput) {
          noteInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-full bg-base-100 dark:bg-base-800 rounded-xl shadow border border-base-200 dark:border-base-700 overflow-hidden">
      {/* Compact header and input area */}
      <div className="border-b border-base-200 dark:border-base-700 p-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-medium text-base-content">Quick Notes</h2>
          <div className="text-xs text-base-content/60 dark:text-base-content/50 flex items-center gap-1">
            <Tag size={12} />
            <span>Auto-tagging</span>
            <span className="text-xs text-base-content/50 dark:text-base-content/40 ml-2">(⌘+⇧+N)</span>
          </div>
        </div>
        <div className="flex gap-1">
          <textarea
            id="note-input"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Take a note..."
            className="w-full p-2 border rounded text-sm min-h-[60px] max-h-[60px] focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none bg-base-50 dark:bg-base-700 text-base-content dark:text-base-content/90 border-base-200 dark:border-base-600"
          />
          <Button 
            onClick={handleSubmit} 
            size="sm" 
            className="h-auto self-stretch px-2 bg-primary/90 hover:bg-primary text-primary-content"
          >
            <MessageSquarePlus size={16} />
          </Button>
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-2 bg-base-50 dark:bg-base-800/50">
        {notes.length === 0 ? (
          <div className="text-center py-4 text-base-content/40 dark:text-base-content/30 text-xs">
            No notes yet
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="p-2 bg-base-100 dark:bg-base-700 rounded text-sm border border-base-200 dark:border-base-600 hover:border-base-300 dark:hover:border-base-500 transition-colors">
                <div className="flex justify-between items-start gap-1">
                  <p className="flex-1 text-base-content dark:text-base-content/90 text-sm">{note.content}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNote(note.id)}
                    className="h-5 w-5 text-base-content/40 hover:text-error hover:bg-error/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0 bg-primary/10 dark:bg-primary/20 text-primary text-[10px] rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-base-content/40 dark:text-base-content/30 mt-1">
                  {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 