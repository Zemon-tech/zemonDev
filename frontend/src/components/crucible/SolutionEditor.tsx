import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { BubbleMenu } from '@tiptap/react';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useWorkspace } from '../../lib/WorkspaceContext';

interface SolutionEditorProps {
  value: string;
  onChange: (content: string) => void;
}

// CSS styles for the editor
const editorStyles = `
  .editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.5rem;
    border-bottom: 1px solid var(--border-color, #e2e8f0);
    background-color: var(--bg-color, #ffffff);
    position: sticky;
    top: 0;
    z-index: 10;
    width: 100%;
  }
  
  .dark .editor-toolbar {
    background-color: var(--bg-dark, #1a1a1a);
    border-bottom: 1px solid var(--border-dark, #2d2d2d);
  }
  
  .toolbar-group {
    display: flex;
    gap: 0.25rem;
    margin-right: 0.5rem;
    align-items: center;
  }
  
  .toolbar-separator {
    width: 1px;
    height: 1.5rem;
    background-color: var(--border-color, #e2e8f0);
    margin: 0 0.25rem;
  }
  
  .dark .toolbar-separator {
    background-color: var(--border-dark, #2d2d2d);
  }
  
  .toolbar-button {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: transparent;
    border: none;
    color: var(--text-color, #333);
    font-size: 0.75rem;
    transition: background-color 0.2s;
  }

  /* Task list styles */
  .ProseMirror ul[data-type="taskList"] {
    list-style: none;
    padding: 0;
  }

  .ProseMirror ul[data-type="taskList"] li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }

  .ProseMirror ul[data-type="taskList"] li > label {
    margin-right: 0.5rem;
    user-select: none;
    cursor: pointer;
  }

  .ProseMirror ul[data-type="taskList"] li > div {
    flex: 1;
    margin-top: 0.125rem;
  }

  .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
    cursor: pointer;
    margin: 0.25rem 0 0 0;
  }

  /* Heading styles */
  .ProseMirror h1 {
    font-size: 2em;
    font-weight: 700;
    margin: 1em 0 0.5em;
    color: var(--heading-color, #111);
    border-bottom: 2px solid var(--border-color, #e2e8f0);
    padding-bottom: 0.25em;
  }

  .ProseMirror h2 {
    font-size: 1.5em;
    font-weight: 600;
    margin: 1em 0 0.5em;
    color: var(--heading-color, #111);
    border-bottom: 1px solid var(--border-color, #e2e8f0);
    padding-bottom: 0.25em;
  }

  .ProseMirror h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin: 1em 0 0.5em;
    color: var(--heading-color, #111);
  }

  .dark .ProseMirror h1,
  .dark .ProseMirror h2,
  .dark .ProseMirror h3 {
    color: var(--heading-color-dark, #f1f5f9);
    border-color: var(--border-dark, #2d2d2d);
  }

  /* Table styles */
  .ProseMirror table {
    border-collapse: collapse;
    margin: 1rem 0;
    width: 100%;
    text-align: left;
    color: var(--text-color, #333);
    background-color: var(--bg-color, #ffffff);
    border: 1px solid var(--border-color, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .dark .ProseMirror table {
    color: var(--text-color-dark, #f1f5f9);
    background-color: var(--bg-dark, #1a1a1a);
    border-color: var(--border-dark, #2d2d2d);
  }

  .ProseMirror th {
    background-color: var(--bg-accent, #f8fafc);
    font-weight: 600;
    padding: 0.75rem 1rem;
    border-bottom: 2px solid var(--border-color, #e2e8f0);
  }

  .dark .ProseMirror th {
    background-color: var(--bg-accent-dark, #2d2d2d);
    border-color: var(--border-dark, #404040);
  }

  .ProseMirror td {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color, #e2e8f0);
  }

  .dark .ProseMirror td {
    border-color: var(--border-dark, #2d2d2d);
  }

  .ProseMirror tr:nth-child(even) {
    background-color: var(--bg-alt, #f8fafc);
  }

  .dark .ProseMirror tr:nth-child(even) {
    background-color: var(--bg-alt-dark, #1e1e1e);
  }

  /* Mermaid diagram styles */
  .mermaid-diagram-wrapper {
    background-color: var(--bg-color, #ffffff);
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color, #e2e8f0);
    margin: 1rem 0;
    overflow-x: auto;
  }

  .dark .mermaid-diagram-wrapper {
    background-color: var(--bg-dark, #1a1a1a);
    border-color: var(--border-dark, #2d2d2d);
  }

  .mermaid-diagram-wrapper .error {
    color: var(--error-color, #ef4444);
    padding: 1rem;
    border-radius: 0.25rem;
    background-color: var(--error-bg, #fee2e2);
    border: 1px solid var(--error-border, #fca5a5);
    white-space: pre-wrap;
    font-family: monospace;
  }

  .dark .mermaid-diagram-wrapper .error {
    color: var(--error-color-dark, #fca5a5);
    background-color: var(--error-bg-dark, #450a0a);
    border-color: var(--error-border-dark, #7f1d1d);
  }
  
  /* Flowchart styles */
  .flowchart-wrapper {
    background-color: var(--bg-color, #ffffff);
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color, #e2e8f0);
    margin: 1rem 0;
    overflow-x: auto;
  }

  .dark .flowchart-wrapper {
    background-color: var(--bg-dark, #1a1a1a);
    border-color: var(--border-dark, #2d2d2d);
  }

  .flowchart-wrapper .mermaid {
    display: flex;
    justify-content: center;
    min-height: 200px;
  }

  .flowchart-wrapper .flowchart-error {
    color: var(--error-color, #ef4444);
    padding: 1rem;
    border-radius: 0.25rem;
    background-color: var(--error-bg, #fee2e2);
    border: 1px solid var(--error-border, #fca5a5);
    margin: 0.5rem;
  }

  .flowchart-wrapper .flowchart-error pre {
    margin: 0.5rem 0;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 0.25rem;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .dark .flowchart-wrapper .flowchart-error {
    color: var(--error-color-dark, #fca5a5);
    background-color: var(--error-bg-dark, #450a0a);
    border-color: var(--error-border-dark, #7f1d1d);
  }

  .dark .flowchart-wrapper .flowchart-error pre {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .toolbar-button:hover {
    background-color: var(--hover-bg, rgba(0, 0, 0, 0.05));
  }
  
  .dark .toolbar-button:hover {
    background-color: var(--hover-bg-dark, rgba(255, 255, 255, 0.1));
  }
  
  .toolbar-button.is-active {
    background-color: var(--active-bg, rgba(79, 70, 229, 0.1));
    color: var(--active-color, #4f46e5);
  }
  
  .dark .toolbar-button.is-active {
    background-color: var(--active-bg-dark, rgba(139, 92, 246, 0.2));
    color: var(--active-color-dark, #8b5cf6);
  }
`;

// Simple code editor component
const SolutionEditor: React.FC<SolutionEditorProps> = ({ value, onChange }) => {
  const { currentMode } = useWorkspace();

  // Memoize the placeholder text based on the current mode
  const placeholderText = useMemo(() => {
    switch (currentMode) {
      case 'understand':
        return 'Start by understanding the problem...';
      case 'brainstorm':
        return 'Brainstorm your approach here...';
      case 'draft':
        return 'Draft your solution here...';
      case 'review':
        return 'Review your solution here...';
      default:
        return 'Write your solution here...';
    }
  }, [currentMode]);

  const [bubbleMenuVisible, setBubbleMenuVisible] = useState(false);
  const [initialContent] = useState(value || '');

  // Add editor styles to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = editorStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure the extensions that need custom settings
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: {
          HTMLAttributes: { class: 'list-disc ml-6' }
        },
        orderedList: {
          HTMLAttributes: { class: 'list-decimal ml-6' }
        },
        blockquote: {
          HTMLAttributes: { class: 'border-l-4 border-primary/30 pl-4 italic' }
        },
        codeBlock: {
          HTMLAttributes: { 
            class: 'bg-base-300 text-base-content p-4 rounded my-2 font-mono overflow-x-auto',
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholderText,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: 'max-w-full h-auto my-2 rounded' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ 
        types: ['heading', 'paragraph'], 
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:text-primary-focus underline decoration-primary/30 underline-offset-2',
        },
      }),
      Typography,
      Underline,
      Highlight,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: initialContent,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-base w-full min-h-[300px] focus:outline-none font-sans bg-base-100 rounded-xl shadow-sm border border-base-200 dark:border-base-700 px-4 py-3 transition-all duration-300 text-base-content',
        style: 'font-size: 1rem; line-height: 1.7;',
      },
    },
    onSelectionUpdate({ editor }) {
      setBubbleMenuVisible(editor.isActive('text') && editor.state.selection.content().size > 0);
    },
  }, [initialContent]);
  
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          editor?.chain().focus().setImage({ src }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  const handleTableInsert = useCallback(() => {
    editor?.chain().focus().insertTable({
      rows: 3,
      cols: 3,
      withHeaderRow: true
    }).run();
  }, [editor]);

  const handleMermaidInsert = useCallback(() => {
    const defaultFlowchart = `flowchart TD
    Start[Start] --> Init[Initialize Data]
    Init --> Condition{Check Condition}
    Condition -->|Yes| Process[Process Data]
    Condition -->|No| End[End]
    Process --> End`;
    
    editor?.chain().focus().insertContent({
      type: 'mermaid',
      attrs: { content: defaultFlowchart }
    }).run();
  }, [editor]);

  if (!editor) return <div>Loading editor…</div>;

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 overflow-hidden">
      {bubbleMenuVisible && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top' }}
          className="bg-base-100 dark:bg-base-700 shadow-md rounded-lg p-1.5 flex gap-1 border border-base-200 dark:border-base-600"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md hover:bg-base-200 dark:hover:bg-base-600 transition-colors ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : 'text-base-content'}`}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md hover:bg-base-200 dark:hover:bg-base-600 transition-colors ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'text-base-content'}`}
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-md hover:bg-base-200 dark:hover:bg-base-600 transition-colors ${editor.isActive('strike') ? 'bg-primary/10 text-primary' : 'text-base-content'}`}
          >
            <s>S</s>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-md hover:bg-base-200 dark:hover:bg-base-600 transition-colors ${editor.isActive('code') ? 'bg-primary/10 text-primary' : 'text-base-content'}`}
          >
            <code>Code</code>
          </button>
          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleLink({ href: prompt('Enter URL') || '' })
                .run()
            }
            className={`p-1.5 rounded-md hover:bg-base-200 dark:hover:bg-base-600 transition-colors ${editor.isActive('link') ? 'bg-primary/10 text-primary' : 'text-base-content'}`}
          >
            Link
          </button>
        </BubbleMenu>
      )}
      
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
            title="Heading 3"
          >
            H3
          </button>
        </div>
        
        <div className="toolbar-separator"></div>
        
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`}
            title="Bold"
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`}
            title="Italic"
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`toolbar-button ${editor.isActive('underline') ? 'is-active' : ''}`}
            title="Underline"
          >
            Underline
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`toolbar-button ${editor.isActive('highlight') ? 'is-active' : ''}`}
            title="Highlight"
          >
            Highlight
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`toolbar-button ${editor.isActive('superscript') ? 'is-active' : ''}`}
            title="Superscript"
          >
            Superscript
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`toolbar-button ${editor.isActive('subscript') ? 'is-active' : ''}`}
            title="Subscript"
          >
            Subscript
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`toolbar-button ${editor.isActive('strike') ? 'is-active' : ''}`}
            title="Strike"
          >
            Strike
          </button>
        </div>
        
        <div className="toolbar-separator"></div>
        
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            title="Bullet List"
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            title="Numbered List"
          >
            1. List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`toolbar-button ${editor.isActive('taskList') ? 'is-active' : ''}`}
            title="Task List"
          >
            ☑ Tasks
          </button>
        </div>
        
        <div className="toolbar-separator"></div>
        
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`toolbar-button ${editor.isActive('blockquote') ? 'is-active' : ''}`}
            title="Quote"
          >
            Quote
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`toolbar-button ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
            title="Code Block"
          >
            Code
          </button>
          <button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className={`toolbar-button ${editor.isActive('table') ? 'is-active' : ''}`}
            title="Insert Table"
          >
            Table
          </button>
        </div>
        
        <div className="toolbar-separator"></div>
        
        <div className="toolbar-group">
          <button 
            onClick={handleMermaidInsert}
            className="toolbar-button"
            title="Insert Flowchart"
          >
            Flowchart
          </button>
          <button
            onClick={handleTableInsert}
            className="toolbar-button"
            title="Insert Table"
          >
            Table
          </button>
          <button
            onClick={handleImageUpload} 
            className="toolbar-button"
            title="Insert Image"
          >
            Image
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="toolbar-button"
            title="Horizontal Rule"
          >
            Divider
          </button>
        </div>
        
        <div className="toolbar-separator"></div>
        
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`toolbar-button ${editor.isActive('textAlign', { align: 'left' }) ? 'is-active' : ''}`}
            title="Align Left"
          >
            Left
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`toolbar-button ${editor.isActive('textAlign', { align: 'center' }) ? 'is-active' : ''}`}
            title="Align Center"
          >
            Center
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`toolbar-button ${editor.isActive('textAlign', { align: 'right' }) ? 'is-active' : ''}`}
            title="Align Right"
          >
            Right
          </button>
        </div>
        
        <div className="toolbar-separator"></div>
        
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="toolbar-button"
            title="Undo"
            disabled={!editor.can().undo()}
          >
            Undo
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="toolbar-button"
            title="Redo"
            disabled={!editor.can().redo()}
          >
            Redo
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(SolutionEditor);


