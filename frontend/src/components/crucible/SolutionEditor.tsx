import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Blockquote from '@tiptap/extension-blockquote';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
// @ts-expect-error: lowlight types may be incomplete
import { createLowlight, common } from 'lowlight';
const lowlight = createLowlight(common);

// Simple toolbar button
function ToolbarButton({ onClick, icon, label, active }: { onClick: () => void; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`btn btn-xs btn-ghost ${active ? 'bg-base-200' : ''}`}
      onClick={onClick}
      aria-label={label}
      tabIndex={0}
    >
      {icon}
    </button>
  );
}

export default function SolutionEditor({ value, onChange }: { value?: string; onChange?: (val: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({ lowlight }),
      Image,
      Placeholder.configure({ placeholder: 'Start writing your solution...' }),
      Underline,
      Link,
      Blockquote,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[300px] focus:outline-none',
      },
    },
  });

  if (!editor) return <div>Loading editor…</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 mb-2 border-b border-base-200 pb-2 sticky top-0 bg-white z-10">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={<b>B</b>}
          label="Bold"
          active={editor.isActive('bold')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={<i>I</i>}
          label="Italic"
          active={editor.isActive('italic')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={<u>U</u>}
          label="Underline"
          active={editor.isActive('underline')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={<s>S</s>}
          label="Strike"
          active={editor.isActive('strike')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          icon={<span className="font-bold">H1</span>}
          label="Heading 1"
          active={editor.isActive('heading', { level: 1 })}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          icon={<span className="font-bold">H2</span>}
          label="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          icon={<span className="font-bold">H3</span>}
          label="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={<span>• List</span>}
          label="Bullet List"
          active={editor.isActive('bulletList')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={<span>1. List</span>}
          label="Ordered List"
          active={editor.isActive('orderedList')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={<span>❝</span>}
          label="Blockquote"
          active={editor.isActive('blockquote')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          icon={<span>{'<>'}</span>}
          label="Code Block"
          active={editor.isActive('codeBlock')}
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          icon={<span>¶</span>}
          label="Paragraph"
          active={editor.isActive('paragraph')}
        />
        {/* Add more toolbar buttons as needed */}
      </div>
      {/* Editor Content */}
      <div className="flex-1 min-h-[300px] overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
} 