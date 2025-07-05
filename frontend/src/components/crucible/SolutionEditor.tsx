import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import CodeBlock from '@tiptap/extension-code-block';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { BubbleMenu } from '@tiptap/react';
import { useCallback, useState, useEffect } from 'react';
import Link from '@tiptap/extension-link';

export default function SolutionEditor({ value, onChange }: { value?: string; onChange?: (val: string) => void }) {
  const [bubbleMenuVisible, setBubbleMenuVisible] = useState(false);
  const [initialContent] = useState(value || '');

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
      }),
      Placeholder.configure({
        placeholder: 'Start typing or use the toolbar above for formatting...',
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: 'max-w-full h-auto my-2 rounded' },
      }),
      CodeBlock.configure({
        HTMLAttributes: { 
          class: 'bg-base-300 text-base-content p-4 rounded my-2 font-mono overflow-x-auto',
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
    ],
    content: initialContent,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-base max-w-none min-h-[300px] focus:outline-none font-sans bg-base-100 dark:bg-base-300/10 rounded-xl shadow-sm border border-base-200 dark:border-base-700 px-4 py-3 transition-all duration-300 text-base-content',
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
      <div
        className="flex flex-wrap gap-0.5 mb-2 border-b border-base-200 dark:border-base-700 pb-2 sticky top-0 bg-base-100 dark:bg-base-800 z-10 rounded-t-xl px-2"
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <div className="flex flex-wrap gap-0.5 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Heading 3"
          >
            H3
          </button>
        </div>
        <div className="flex flex-wrap gap-0.5 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Bullet List"
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('orderedList') ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Numbered List"
          >
            1. List
          </button>
        </div>
        <div className="flex flex-wrap gap-0.5 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('blockquote') ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Quote"
          >
            Quote
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('codeBlock') ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Code Block"
          >
            Code
          </button>
          <button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('table') ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Insert Table"
          >
            Table
          </button>
        </div>
        <div className="flex flex-wrap gap-0.5 mr-2">
          <button 
            onClick={handleImageUpload} 
            className="p-1 rounded-md text-xs hover:bg-base-200 dark:hover:bg-base-700 text-base-content"
            title="Insert Image"
          >
            Image
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={`p-1 rounded-md text-xs hover:bg-base-200 dark:hover:bg-base-700 text-base-content`}
            title="Horizontal Rule"
          >
            Divider
          </button>
        </div>
        <div className="flex flex-wrap gap-0.5">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('textAlign', { align: 'left' }) ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Align Left"
          >
            Left
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('textAlign', { align: 'center' }) ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Align Center"
          >
            Center
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1 rounded-md text-xs ${editor.isActive('textAlign', { align: 'right' }) ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 dark:hover:bg-base-700 text-base-content'}`}
            title="Align Right"
          >
            Right
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
} 