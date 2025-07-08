import React, { useMemo, useState, useEffect } from 'react';
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
  /* Modern toolbar styles */
  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: var(--bg-color, #ffffff);
    border-bottom: 1px solid var(--border-color, #e2e8f0);
    position: sticky;
    top: 0;
    z-index: 10;
    width: 100%;
  }

  .dark .editor-toolbar {
    background-color: var(--bg-dark, #1e1e1e);
    border-color: var(--border-dark, #2d2d2d);
  }

  /* Toolbar button groups */
  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  /* Separator style */
  .toolbar-separator {
    width: 1px;
    height: 1.25rem;
    background-color: var(--border-color, #e2e8f0);
    margin: 0 0.25rem;
  }

  .dark .toolbar-separator {
    background-color: var(--border-dark, #2d2d2d);
  }

  /* Modern button style */
  .toolbar-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    min-width: 2rem;
    padding: 0 0.5rem;
    border-radius: 0.375rem;
    border: none;
    background: transparent;
    color: var(--text-color, #1a1a1a);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dark .toolbar-button {
    color: var(--text-color-dark, rgba(255, 255, 255, 0.8));
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

  /* Popover styles */
  .toolbar-popover {
    position: relative;
  }

  .toolbar-popover-content {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background-color: var(--bg-color, #ffffff);
    border: 1px solid var(--border-color, #e2e8f0);
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 20;
    min-width: 12rem;
  }

  .dark .toolbar-popover-content {
    background-color: var(--bg-dark, #1e1e1e);
    border-color: var(--border-dark, #2d2d2d);
  }

  .toolbar-popover-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    color: var(--text-color, #1a1a1a);
    transition: all 0.2s ease;
  }

  .dark .toolbar-popover-item {
    color: var(--text-color-dark, rgba(255, 255, 255, 0.8));
  }

  .toolbar-popover-item:hover {
    background-color: var(--hover-bg, rgba(0, 0, 0, 0.05));
  }

  .dark .toolbar-popover-item:hover {
    background-color: var(--hover-bg-dark, rgba(255, 255, 255, 0.1));
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

  /* Enhanced Table styles */
  .ProseMirror table {
    border-collapse: separate;
    border-spacing: 0;
    margin: 2rem 0;
    width: 100%;
    border: 1px solid var(--border-color, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background-color: var(--bg-color, #ffffff);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  }

  .dark .ProseMirror table {
    background-color: var(--bg-dark, #1e1e1e);
    border-color: var(--border-dark, #2d2d2d);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  }

  .ProseMirror th {
    background-color: var(--bg-accent, #f8fafc);
    font-weight: 600;
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--heading-color, #1a1a1a);
    border-bottom: 2px solid var(--border-color, #e2e8f0);
    position: relative;
  }

  .dark .ProseMirror th {
    background-color: var(--bg-accent-dark, #2d2d2d);
    color: var(--heading-color-dark, #f1f5f9);
    border-color: var(--border-dark, #404040);
  }

  .ProseMirror td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-color, #e2e8f0);
    border-right: 1px solid var(--border-color, #e2e8f0);
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--text-color, #374151);
    transition: background-color 0.2s ease;
  }

  .dark .ProseMirror td {
    border-color: var(--border-dark, #2d2d2d);
    color: var(--text-color-dark, #e5e7eb);
  }

  .ProseMirror tr:last-child td {
    border-bottom: none;
  }

  .ProseMirror td:last-child {
    border-right: none;
  }

  /* Hover effects */
  .ProseMirror tr:hover td {
    background-color: var(--hover-bg, rgba(0, 0, 0, 0.02));
  }

  .dark .ProseMirror tr:hover td {
    background-color: var(--hover-bg-dark, rgba(255, 255, 255, 0.05));
  }

  /* Zebra striping */
  .ProseMirror tr:nth-child(even) {
    background-color: var(--bg-alt, #f9fafb);
  }

  .dark .ProseMirror tr:nth-child(even) {
    background-color: var(--bg-alt-dark, #1a1a1a);
  }

  /* Selected cell styles */
  .ProseMirror .selectedCell {
    background-color: var(--selected-bg, rgba(79, 70, 229, 0.1)) !important;
    position: relative;
  }

  .dark .ProseMirror .selectedCell {
    background-color: var(--selected-bg-dark, rgba(139, 92, 246, 0.2)) !important;
  }

  /* Table wrapper for better mobile handling */
  .table-wrapper {
    overflow-x: auto;
    max-width: 100%;
    margin: 2rem 0;
    border-radius: 0.5rem;
  }

  /* Table resize handle styles */
  .ProseMirror .column-resize-handle {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: var(--active-color, #4f46e5);
    cursor: col-resize;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .dark .ProseMirror .column-resize-handle {
    background-color: var(--active-color-dark, #8b5cf6);
  }

  .ProseMirror th:hover .column-resize-handle,
  .ProseMirror .column-resize-handle.active {
    opacity: 1;
  }

  /* Table toolbar styles */
  .table-toolbar {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: var(--bg-color, #ffffff);
    border: 1px solid var(--border-color, #e2e8f0);
    border-radius: 0.375rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: absolute;
    z-index: 50;
    margin-top: -2.5rem;
  }

  .dark .table-toolbar {
    background-color: var(--bg-dark, #1e1e1e);
    border-color: var(--border-dark, #2d2d2d);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .table-toolbar button {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: var(--text-color, #374151);
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dark .table-toolbar button {
    color: var(--text-color-dark, #e5e7eb);
  }

  .table-toolbar button:hover {
    background-color: var(--hover-bg, rgba(0, 0, 0, 0.05));
  }

  .dark .table-toolbar button:hover {
    background-color: var(--hover-bg-dark, rgba(255, 255, 255, 0.1));
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
  
  /* Content container styles */
  .editor-content-container {
    max-width: 46rem;
    margin: 0 auto;
    padding: 0 4rem;
  }

  /* Clean editor styles */
  .ProseMirror {
    padding: 4rem 0;
    min-height: calc(100vh - 120px);
    outline: none !important;
  }

  /* Improved spacing between blocks */
  .ProseMirror > * + * {
    margin-top: 0.75em;
  }

  /* Better placeholder styling */
  .ProseMirror p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  /* Remove any borders from the editor */
  .ProseMirror:focus {
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
  }
`;

// Component for the heading popover
const HeadingPopover = ({ editor }: { editor: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  const headingLevels = [
    { level: 1, label: 'Heading 1' },
    { level: 2, label: 'Heading 2' },
    { level: 3, label: 'Heading 3' },
  ];

  return (
    <div className="toolbar-popover">
      <button
        className={`toolbar-button ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Heading"
      >
        H
      </button>
      {isOpen && (
        <div className="toolbar-popover-content">
          {headingLevels.map(({ level, label }) => (
            <div
              key={level}
              className="toolbar-popover-item"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level }).run();
                setIsOpen(false);
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for the list popover
const ListPopover = ({ editor }: { editor: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  const listTypes = [
    { type: 'bulletList', label: 'Bullet List' },
    { type: 'orderedList', label: 'Numbered List' },
    { type: 'taskList', label: 'Task List' },
  ];

  return (
    <div className="toolbar-popover">
      <button
        className={`toolbar-button ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="List"
      >
        List
      </button>
      {isOpen && (
        <div className="toolbar-popover-content">
          {listTypes.map(({ type, label }) => (
            <div
              key={type}
              className="toolbar-popover-item"
              onClick={() => {
                if (type === 'taskList') {
                  editor.chain().focus().toggleTaskList().run();
                } else if (type === 'bulletList') {
                  editor.chain().focus().toggleBulletList().run();
                } else {
                  editor.chain().focus().toggleOrderedList().run();
                }
                setIsOpen(false);
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add TablePopover component
const TablePopover = ({ editor }: { editor: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleInsertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({
      rows,
      cols,
      withHeaderRow: true,
    }).run();
    setIsOpen(false);
  };

  const tableOptions = [
    { rows: 2, cols: 2, label: '2×2' },
    { rows: 3, cols: 3, label: '3×3' },
    { rows: 3, cols: 4, label: '3×4' },
    { rows: 4, cols: 3, label: '4×3' },
    { rows: 4, cols: 4, label: '4×4' },
  ];

  return (
    <div className="toolbar-popover">
      <button
        className={`toolbar-button ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Insert Table"
      >
        Table
      </button>
      {isOpen && (
        <div className="toolbar-popover-content">
          <div className="toolbar-popover-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem',
            padding: '0.5rem'
          }}>
            {tableOptions.map(({ rows, cols, label }) => (
              <div
                key={`${rows}x${cols}`}
                className="toolbar-popover-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
                onClick={() => handleInsertTable(rows, cols)}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
        class: 'prose dark:prose-invert prose-base w-full min-h-[300px] focus:outline-none font-sans',
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

  const handleImageUpload = async (file: File) => {
    // Implementation
  };

  const handleTableInsert = () => {
    // Implementation
  };

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
            onClick={() => editor.chain().focus().undo().run()}
            className="toolbar-button"
            title="Undo"
          >
            ↩
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="toolbar-button"
            title="Redo"
          >
            ↪
          </button>
        </div>

        <div className="toolbar-separator" />

        <HeadingPopover editor={editor} />

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`}
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`}
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`toolbar-button ${editor.isActive('underline') ? 'is-active' : ''}`}
            title="Underline"
          >
            U
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`toolbar-button ${editor.isActive('strike') ? 'is-active' : ''}`}
            title="Strike"
          >
            S
          </button>
        </div>

        <div className="toolbar-separator" />

        <ListPopover editor={editor} />

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`toolbar-button ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
            title="Code Block"
          >
            {'</>'}
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`toolbar-button ${editor.isActive('blockquote') ? 'is-active' : ''}`}
            title="Quote"
          >
            "
          </button>
        </div>

        <div className="toolbar-separator" />

        <TablePopover editor={editor} />

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
            title="Align Left"
          >
            ←
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
            title="Align Center"
          >
            ↔
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
            title="Align Right"
          >
            →
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="editor-content-container">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </div>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(SolutionEditor);


