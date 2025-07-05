import { EditorContent, useEditor, type Editor } from '@tiptap/react';
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
import { useCallback, useState } from 'react';
import Link from '@tiptap/extension-link';

export default function SolutionEditor({ value, onChange }: { value?: string; onChange?: (val: string) => void }) {
  const [bubbleMenuVisible, setBubbleMenuVisible] = useState(false);

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
          HTMLAttributes: { class: 'border-l-4 pl-4 italic' }
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
          class: 'bg-gray-800 text-white p-4 rounded my-2 font-mono overflow-x-auto',
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
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none min-h-[300px] focus:outline-none font-sans bg-white/90 rounded-xl shadow border border-base-200 px-6 py-4 transition-all duration-300 sm:prose-base md:prose-lg lg:prose-xl',
        style: 'font-size: 1.1rem; line-height: 1.8;',
      },
    },
    onSelectionUpdate({ editor }) {
      setBubbleMenuVisible(editor.isActive('text') && editor.state.selection.content().size > 0);
    },
  });

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
          className="bg-white shadow-lg rounded-lg p-2 flex gap-1"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-2 py-1 rounded ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
          >
            <s>S</s>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`px-2 py-1 rounded ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
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
            className={`px-2 py-1 rounded ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          >
            Link
          </button>
        </BubbleMenu>
      )}
      <div
        className="flex flex-wrap gap-1 mb-3 border-b border-base-200 pb-3 sticky top-0 bg-white/90 z-10 rounded-t-xl px-2"
        style={{ backdropFilter: 'blur(2px)' }}
      >
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          Bullet
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        >
          Numbered
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
        >
          Quote
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 rounded ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
        >
          Code
        </button>
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('table') ? 'bg-gray-200' : ''}`}
        >
          Table
        </button>
        <button onClick={handleImageUpload} className="px-2 py-1 rounded">
          Image
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={`px-2 py-1 rounded ${editor.isActive('horizontalRule') ? 'bg-gray-200' : ''}`}
        >
          Divider
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-2 py-1 rounded ${editor.isActive('textAlign', { align: 'left' }) ? 'bg-gray-200' : ''}`}
        >
          Left
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-2 py-1 rounded ${editor.isActive('textAlign', { align: 'center' }) ? 'bg-gray-200' : ''}`}
        >
          Center
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-2 py-1 rounded ${editor.isActive('textAlign', { align: 'right' }) ? 'bg-gray-200' : ''}`}
        >
          Right
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
} 