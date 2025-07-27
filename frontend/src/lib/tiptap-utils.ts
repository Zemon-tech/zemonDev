import type { Editor } from '@tiptap/core';

// Check if a node is in the schema
export function isNodeInSchema(nodeName: string, editor: Editor | null): boolean {
  if (!editor) return false;
  return editor.schema.nodes[nodeName] !== undefined;
}

// Check if a mark is in the schema
export function isMarkInSchema(markName: string, editor: Editor | null): boolean {
  if (!editor) return false;
  return editor.schema.marks[markName] !== undefined;
}

// Sanitize URL
export function sanitizeUrl(url: string, baseUrl?: string): string {
  if (!url) return '';
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    const urlObj = baseUrl ? new URL(url, baseUrl) : new URL(url);
    return urlObj.toString();
  } catch {
    return '';
  }
}

// Handle image upload
export async function handleImageUpload(file: File): Promise<string> {
  // This is a placeholder implementation
  // In a real app, you would upload to your server/CDN
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

// Find node position
export function findNodePosition(editor: Editor | null, nodeName: string): number | null {
  if (!editor) return null;
  const { state } = editor;
  const { doc } = state;
  
  for (let i = 0; i < doc.content.size; i++) {
    const node = doc.nodeAt(i);
    if (node && node.type.name === nodeName) {
      return i;
    }
  }
  
  return null;
}

// Check if node is empty
export function isEmptyNode(editor: Editor | null, nodeName: string): boolean {
  if (!editor) return true;
  const { state } = editor;
  const { doc } = state;
  
  for (let i = 0; i < doc.content.size; i++) {
    const node = doc.nodeAt(i);
    if (node && node.type.name === nodeName) {
      return node.content.size === 0;
    }
  }
  
  return true;
}

// Maximum file size for uploads (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; 