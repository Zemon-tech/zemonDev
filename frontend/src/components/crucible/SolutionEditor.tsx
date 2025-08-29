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

// Import icons
import { HeadingOneIcon } from '../tiptap-icons/heading-one-icon';
import { HeadingTwoIcon } from '../tiptap-icons/heading-two-icon';
import { HeadingThreeIcon } from '../tiptap-icons/heading-three-icon';
import { BoldIcon } from '../tiptap-icons/bold-icon';
import { ItalicIcon } from '../tiptap-icons/italic-icon';
import { UnderlineIcon } from '../tiptap-icons/underline-icon';
import { StrikeIcon } from '../tiptap-icons/strike-icon';
import { SuperscriptIcon } from '../tiptap-icons/superscript-icon';
import { SubscriptIcon } from '../tiptap-icons/subscript-icon';
import { ListIcon } from '../tiptap-icons/list-icon';
import { ListOrderedIcon } from '../tiptap-icons/list-ordered-icon';
import { ListTodoIcon } from '../tiptap-icons/list-todo-icon';
import { BlockQuoteIcon } from '../tiptap-icons/block-quote-icon';
import { CodeBlockIcon } from '../tiptap-icons/code-block-icon';
import { ImagePlusIcon } from '../tiptap-icons/image-plus-icon';
import { AlignLeftIcon } from '../tiptap-icons/align-left-icon';
import { AlignCenterIcon } from '../tiptap-icons/align-center-icon';
import { AlignRightIcon } from '../tiptap-icons/align-right-icon';
import { Undo2Icon } from '../tiptap-icons/undo2-icon';
import { Redo2Icon } from '../tiptap-icons/redo2-icon';
import { ChevronDownIcon } from '../tiptap-icons/chevron-down-icon';
import { TableIcon } from '../tiptap-icons/table-icon';
import { MinusIcon } from '../tiptap-icons/minus-icon';
import { HighlighterIcon } from '../tiptap-icons/highlighter-icon';
import { AlignJustifyIcon } from '../tiptap-icons/align-justify-icon';

// Import Popover components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"

interface SolutionEditorProps {
  value: string;
  onChange: (content: string) => void;
}

// CSS styles for the editor
const editorStyles = `
  .editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .editor-content-wrapper {
    display: flex;
    justify-content: center;
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 0;
  }

  .editor-content {
    width: 100%;
    max-width: 46rem;
    margin: 0 auto;
  }

  .editor-toolbar {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem;
    border-bottom: 1px solid hsl(var(--border));
    background-color: hsl(var(--background));
    position: sticky;
    top: 0;
    z-index: 10;
    width: 100%;
    align-items: center;
    justify-content: center;
  }
  
  .toolbar-group {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }
  
  .toolbar-separator {
    width: 1px;
    height: 1.5rem;
    background-color: hsl(var(--border));
    margin: 0 0.25rem;
  }
  
  .toolbar-button {
    padding: 0.4rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: transparent;
    border: none;
    color: hsl(var(--foreground));
    transition: all 0.2s ease;
    min-width: 32px;
    min-height: 32px;
  }
  
  .toolbar-button:hover {
    background-color: hsl(var(--accent));
    transform: translateY(-1px);
  }
  
  .toolbar-button.is-active {
    background-color: hsl(var(--primary) / 0.1);
    color: hsl(var(--primary));
  }

  .toolbar-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toolbar-popover-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem;
    padding: 0.5rem;
  }

  .toolbar-popover-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.25rem;
    padding: 0.5rem;
  }

  /* Ensure popover content is visible */
  .toolbar-popover-grid button,
  .toolbar-popover-grid-2 button {
    background-color: hsl(var(--background));
    border: none;
    border-radius: 0.25rem;
    color: hsl(var(--foreground));
  }

  .toolbar-popover-grid button:hover,
  .toolbar-popover-grid-2 button:hover {
    background-color: hsl(var(--accent));
  }

  .toolbar-popover-grid button.is-active,
  .toolbar-popover-grid-2 button.is-active {
    background-color: hsl(var(--primary) / 0.1);
    color: hsl(var(--primary));
  }

  /* Ensure popover content has solid background */
  .toolbar-popover-grid,
  .toolbar-popover-grid-2 {
    background-color: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    min-width: 120px;
  }

  /* Ensure popover buttons have consistent sizing */
  .toolbar-popover-grid button,
  .toolbar-popover-grid-2 button {
    width: 100%;
    height: 36px;
    justify-content: center;
    font-size: 0.875rem;
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
    color: hsl(var(--foreground));
    border-bottom: 2px solid hsl(var(--border));
    padding-bottom: 0.25em;
  }

  .ProseMirror h2 {
    font-size: 1.5em;
    font-weight: 600;
    margin: 1em 0 0.5em;
    color: hsl(var(--foreground));
    border-bottom: 1px solid hsl(var(--border));
    padding-bottom: 0.25em;
  }

  .ProseMirror h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin: 1em 0 0.5em;
    color: hsl(var(--foreground));
  }

  /* Highlight styles */
  .ProseMirror mark {
    background-color: hsl(var(--warning) / 0.3);
    color: hsl(var(--foreground));
    padding: 0.1em 0.2em;
    border-radius: 0.2em;
  }

  .ProseMirror mark.ProseMirror-selectednode {
    background-color: hsl(var(--warning) / 0.5);
  }

  /* Table styles */
  .ProseMirror table {
    border-collapse: collapse;
    margin: 1rem 0;
    width: 100%;
    text-align: left;
    color: hsl(var(--foreground));
    background-color: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .ProseMirror th {
    background-color: hsl(var(--muted));
    font-weight: 600;
    padding: 0.75rem 1rem;
    border-bottom: 2px solid hsl(var(--border));
  }

  .ProseMirror td {
    padding: 0.75rem 1rem;
    border: 1px solid hsl(var(--border));
  }

  .ProseMirror tr:nth-child(even) {
    background-color: hsl(var(--muted));
  }

  /* Image styles */
  .ProseMirror img {
    max-width: 100%;
    height: auto;
    margin: 1rem auto;
    border-radius: 0.5rem;
    display: block;
    cursor: pointer;
    transition: filter 0.2s ease;
    position: relative;
  }

  .ProseMirror img.ProseMirror-selectednode {
    outline: 2px solid hsl(var(--primary));
    outline-offset: 2px;
  }

  .ProseMirror img:hover {
    filter: brightness(0.95);
  }

  .ProseMirror img.resizing {
    pointer-events: none;
    user-select: none;
  }

  .image-resizer {
    display: inline-flex;
    position: relative;
    max-width: 100%;
    margin: 1rem auto;
  }

  .image-resizer.selected::before {
    content: '';
    position: absolute;
    inset: -2px;
    border: 2px solid hsl(var(--primary));
    border-radius: 0.5rem;
    pointer-events: none;
  }

  .image-resizer .resize-handle {
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: hsl(var(--primary));
    border: 2px solid hsl(var(--background));
    border-radius: 50%;
    pointer-events: all;
    z-index: 20;
  }

  .image-resizer .resize-handle.top-left {
    top: -6px;
    left: -6px;
    cursor: nw-resize;
  }

  .image-resizer .resize-handle.top-right {
    top: -6px;
    right: -6px;
    cursor: ne-resize;
  }

  .image-resizer .resize-handle.bottom-left {
    bottom: -6px;
    left: -6px;
    cursor: sw-resize;
  }

  .image-resizer .resize-handle.bottom-right {
    bottom: -6px;
    right: -6px;
    cursor: se-resize;
  }
`;

// Add ResizableImage extension
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          };
        },
      },
    };
  },
});

// Add type for image attributes
interface ImageAttributes {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
}

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
            class: 'bg-base-300 text-base-content p-4 rounded my-2 font-mono overflow-x-auto text-sm',
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholderText,
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-[80%] mx-auto',
        },
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
          'prose dark:prose-invert prose-base w-full min-h-[300px] focus:outline-none font-sans px-4 py-3 transition-all duration-300 text-base-content',
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

  // Add image resize handler
  const handleImageResize = useCallback((event: MouseEvent, imageElement: HTMLImageElement) => {
    const startWidth = imageElement.width;
    const startX = event.pageX;

    const onMouseMove = (e: MouseEvent) => {
      const currentX = e.pageX;
      const diffX = currentX - startX;
      const newWidth = Math.max(100, startWidth + diffX);
      
      imageElement.classList.add('resizing');
      imageElement.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      imageElement.classList.remove('resizing');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const finalWidth = imageElement.width;
      if (editor) {
        const attrs: ImageAttributes = {
          src: imageElement.src,
          width: finalWidth,
        };
        editor.chain().focus().setImage(attrs).run();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleImageClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('.ProseMirror')) {
        const imageElement = target as HTMLImageElement;
        const resizer = document.createElement('div');
        resizer.className = 'image-resizer selected';
        
        const handles = [
          { class: 'resize-handle top-left' },
          { class: 'resize-handle top-right' },
          { class: 'resize-handle bottom-left' },
          { class: 'resize-handle bottom-right' },
        ];

        handles.forEach(handle => {
          const div = document.createElement('div');
          div.className = handle.class;
          div.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleImageResize(e, imageElement);
          });
          resizer.appendChild(div);
        });

        // Replace the image with the resizer wrapper
        const parent = imageElement.parentElement;
        if (parent && !parent.classList.contains('image-resizer')) {
          resizer.appendChild(imageElement.cloneNode(true));
          parent.replaceChild(resizer, imageElement);
        }
      }
    };

    editor.view.dom.addEventListener('click', handleImageClick);
    return () => {
      editor.view.dom.removeEventListener('click', handleImageClick);
    };
  }, [editor, handleImageResize]);

  if (!editor) return <div>Loading editor…</div>;

  return (
    <div className="editor-container">
      {bubbleMenuVisible && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top' }}
          className="bg-background shadow-md rounded-lg p-1.5 flex gap-1 border border-border"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md hover:bg-accent transition-colors ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
            title="Bold"
          >
            <BoldIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md hover:bg-accent transition-colors ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
            title="Italic"
          >
            <ItalicIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-md hover:bg-accent transition-colors ${editor.isActive('strike') ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
            title="Strike"
          >
            <StrikeIcon className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}
      
      <div className="editor-toolbar">
        {/* Headings Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="toolbar-button flex items-center gap-1" title="Headings">
              <HeadingOneIcon className="w-4 h-4" />
              <ChevronDownIcon className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="toolbar-popover-grid">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
              title="Heading 1"
            >
              <HeadingOneIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
              title="Heading 2"
            >
              <HeadingTwoIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
              title="Heading 3"
            >
              <HeadingThreeIcon className="w-4 h-4" />
            </button>
          </PopoverContent>
        </Popover>

        <div className="toolbar-separator" />

        {/* Text Formatting Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="toolbar-button flex items-center gap-1" title="Text Formatting">
              <BoldIcon className="w-4 h-4" />
              <ChevronDownIcon className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="toolbar-popover-grid">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`}
              title="Bold"
            >
              <BoldIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`}
              title="Italic"
            >
              <ItalicIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`toolbar-button ${editor.isActive('underline') ? 'is-active' : ''}`}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`toolbar-button ${editor.isActive('highlight') ? 'is-active' : ''}`}
              title="Highlight"
            >
              <HighlighterIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={`toolbar-button ${editor.isActive('superscript') ? 'is-active' : ''}`}
              title="Superscript"
            >
              <SuperscriptIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={`toolbar-button ${editor.isActive('subscript') ? 'is-active' : ''}`}
              title="Subscript"
            >
              <SubscriptIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`toolbar-button ${editor.isActive('strike') ? 'is-active' : ''}`}
              title="Strike"
            >
              <StrikeIcon className="w-4 h-4" />
            </button>
          </PopoverContent>
        </Popover>

        <div className="toolbar-separator" />

        {/* Lists Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="toolbar-button flex items-center gap-1" title="Lists">
              <ListIcon className="w-4 h-4" />
              <ChevronDownIcon className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="toolbar-popover-grid">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
              title="Bullet List"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`toolbar-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}
              title="Numbered List"
            >
              <ListOrderedIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={`toolbar-button ${editor.isActive('taskList') ? 'is-active' : ''}`}
              title="Task List"
            >
              <ListTodoIcon className="w-4 h-4" />
            </button>
          </PopoverContent>
        </Popover>

        <div className="toolbar-separator" />

        {/* Block Elements */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`toolbar-button ${editor.isActive('blockquote') ? 'is-active' : ''}`}
          title="Quote"
        >
          <BlockQuoteIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`toolbar-button ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
          title="Code Block"
        >
          <CodeBlockIcon className="w-4 h-4" />
        </button>

        <div className="toolbar-separator" />

        {/* Insert Elements */}
        <button
          onClick={handleImageUpload}
          className="toolbar-button"
          title="Insert Image"
        >
          <ImagePlusIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleTableInsert}
          className={`toolbar-button ${editor.isActive('table') ? 'is-active' : ''}`}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="toolbar-button"
          title="Horizontal Rule"
        >
          <MinusIcon className="w-4 h-4" />
        </button>

        <div className="toolbar-separator" />

        {/* Text Alignment Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="toolbar-button flex items-center gap-1" title="Text Alignment">
              <AlignLeftIcon className="w-4 h-4" />
              <ChevronDownIcon className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="toolbar-popover-grid">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`toolbar-button ${editor.isActive('textAlign', { align: 'left' }) ? 'is-active' : ''}`}
              title="Align Left"
            >
              <AlignLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`toolbar-button ${editor.isActive('textAlign', { align: 'center' }) ? 'is-active' : ''}`}
              title="Align Center"
            >
              <AlignCenterIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`toolbar-button ${editor.isActive('textAlign', { align: 'right' }) ? 'is-active' : ''}`}
              title="Align Right"
            >
              <AlignRightIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`toolbar-button ${editor.isActive('textAlign', { align: 'justify' }) ? 'is-active' : ''}`}
              title="Justify"
            >
              <AlignJustifyIcon className="w-4 h-4" />
            </button>
          </PopoverContent>
        </Popover>

        <div className="toolbar-separator" />

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="toolbar-button"
          title="Undo"
          disabled={!editor.can().undo()}
        >
          <Undo2Icon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="toolbar-button"
          title="Redo"
          disabled={!editor.can().redo()}
        >
          <Redo2Icon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="editor-content-wrapper">
        <div className="editor-content">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export default React.memo(SolutionEditor);