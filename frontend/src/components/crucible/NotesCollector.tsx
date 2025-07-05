'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWorkspace } from '../../lib/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Trash2, Tag, Plus } from 'lucide-react';

export default function NotesCollector() {
  const { notes, addNote, removeNote } = useWorkspace();
  const [newNote, setNewNote] = useState('');
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
    <div className="flex flex-col h-full">
      <div className="bg-white rounded-xl shadow border border-base-200 px-6 py-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Quick Notes</h2>
        <p className="text-sm text-gray-500 mb-4">
          Capture your thoughts as you work through the problem. Notes are auto-tagged based on content.
        </p>
        <div className="flex flex-col gap-2">
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
            placeholder="Take a note... (Cmd/Ctrl + Shift + N)"
            className="w-full p-3 border rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Tag size={14} />
              <span>Auto-tagging enabled</span>
            </div>
            <Button onClick={handleSubmit} className="gap-1">
              <Plus size={16} />
              Add Note
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-md font-medium mb-2 text-gray-700">Your Notes</h3>
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <p>No notes yet. Add your first note above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-4 bg-white rounded-lg shadow-sm border border-base-200 hover:shadow transition-shadow">
                <div className="flex justify-between items-start gap-2">
                  <p className="flex-1 text-gray-800">{note.content}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNote(note.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(note.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 