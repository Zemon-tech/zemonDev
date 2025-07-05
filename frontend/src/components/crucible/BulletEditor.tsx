'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface BulletItem {
  id: string;
  content: string;
  children: BulletItem[];
  isExpanded: boolean;
}

interface BulletEditorProps {
  className?: string;
  onChange?: (items: BulletItem[]) => void;
}

export default function BulletEditor({ className = '', onChange }: BulletEditorProps) {
  const [items, setItems] = useState<BulletItem[]>([
    { id: '1', content: '', children: [], isExpanded: true }
  ]);
  const [activeItemId, setActiveItemId] = useState('1');
  const inputRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  // Helper to find an item and its parent in the tree
  const findItem = (
    itemId: string,
    items: BulletItem[],
    parent: BulletItem | null = null
  ): [BulletItem | null, BulletItem | null] => {
    for (const item of items) {
      if (item.id === itemId) {
        return [item, parent];
      }
      const [found, foundParent] = findItem(itemId, item.children, item);
      if (found) {
        return [found, foundParent];
      }
    }
    return [null, null];
  };

  // Helper to generate a unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Update items and notify parent
  const updateItems = useCallback((newItems: BulletItem[]) => {
    setItems(newItems);
    onChange?.(newItems);
  }, [onChange]);

  // Handle content change for an item
  const handleContentChange = useCallback((itemId: string, content: string) => {
    const updateItemContent = (items: BulletItem[]): BulletItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, content };
        }
        if (item.children.length > 0) {
          return { ...item, children: updateItemContent(item.children) };
        }
        return item;
      });
    };

    updateItems(updateItemContent(items));
  }, [items, updateItems]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent, itemId: string) => {
    const [currentItem, parentItem] = findItem(itemId, items);
    if (!currentItem) return;

    // Enter: Create new item at same level
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newId = generateId();
      
      const insertNewItem = (items: BulletItem[]): BulletItem[] => {
        return items.reduce((acc: BulletItem[], item) => {
          acc.push(item);
          if (item.id === itemId) {
            acc.push({ id: newId, content: '', children: [], isExpanded: true });
          }
          if (item.children.length > 0) {
            return [...acc, { ...item, children: insertNewItem(item.children) }];
          }
          return acc;
        }, []);
      };

      const newItems = insertNewItem(items);
      updateItems(newItems);
      setActiveItemId(newId);
    }

    // Tab: Indent (make child of previous item)
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const makeChild = (items: BulletItem[]): BulletItem[] => {
        const result: BulletItem[] = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === itemId && i > 0) {
            const prevItem = { ...items[i - 1] };
            prevItem.children = [...prevItem.children, items[i]];
            prevItem.isExpanded = true;
            result[i - 1] = prevItem;
          } else if (i < items.length - 1 || items[i].id !== itemId) {
            result.push(items[i]);
          }
        }
        return result;
      };

      updateItems(makeChild(items));
    }

    // Shift + Tab: Outdent
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      if (!parentItem) return;

      // First, create a copy of the items array
      const newItems = [...items];

      // Find the parent's parent to determine where to insert the current item
      const [parentOfParent] = findItem(parentItem.id, newItems);

      // Remove the current item from its parent's children
      const updatedParentChildren = parentItem.children.filter(child => child.id !== currentItem.id);
      
      // Update the parent's children
      const updateParentInTree = (items: BulletItem[]): BulletItem[] => {
        return items.map(item => {
          if (item.id === parentItem.id) {
            return { ...item, children: updatedParentChildren };
          }
          if (item.children.length > 0) {
            return { ...item, children: updateParentInTree(item.children) };
          }
          return item;
        });
      };
      
      const itemsWithUpdatedParent = updateParentInTree(newItems);

      // If parent has a parent, insert after parent, otherwise add to root level
      if (parentOfParent) {
        const parentIndex = parentOfParent.children.findIndex(item => item.id === parentItem.id);
        if (parentIndex !== -1) {
          parentOfParent.children.splice(parentIndex + 1, 0, currentItem);
        }
      } else {
        // Parent is at root level, find its index and insert after it
        const parentIndex = itemsWithUpdatedParent.findIndex(item => item.id === parentItem.id);
        if (parentIndex !== -1) {
          itemsWithUpdatedParent.splice(parentIndex + 1, 0, currentItem);
        }
      }

      updateItems(itemsWithUpdatedParent);
    }

    // Backspace: Delete empty item
    if (e.key === 'Backspace' && currentItem.content === '') {
      e.preventDefault();
      const deleteItem = (items: BulletItem[]): BulletItem[] => {
        return items.reduce((acc: BulletItem[], item) => {
          if (item.id === itemId) {
            return acc;
          }
          acc.push({ ...item, children: deleteItem(item.children) });
          return acc;
        }, []);
      };

      const newItems = deleteItem(items);
      if (newItems.length === 0) {
        // Always keep at least one item
        updateItems([{ id: generateId(), content: '', children: [], isExpanded: true }]);
      } else {
        updateItems(newItems);
      }
    }
  }, [items, updateItems]);

  // Focus the input when activeItemId changes
  useEffect(() => {
    const input = inputRefs.current[activeItemId];
    if (input) {
      input.focus();
    }
  }, [activeItemId]);

  // Render a bullet item and its children recursively
  const renderItem = (item: BulletItem, level: number = 0) => {
    return (
      <div
        key={item.id}
        className="group"
        style={{ marginLeft: `${level * 16}px` }}
      >
        <div className="flex items-center gap-1 group-hover:bg-gray-50 rounded">
          {item.children.length > 0 ? (
            <button
              onClick={() => {
                const toggleExpand = (items: BulletItem[]): BulletItem[] => {
                  return items.map(i => {
                    if (i.id === item.id) {
                      return { ...i, isExpanded: !i.isExpanded };
                    }
                    if (i.children.length > 0) {
                      return { ...i, children: toggleExpand(i.children) };
                    }
                    return i;
                  });
                };
                updateItems(toggleExpand(items));
              }}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              {item.isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            </div>
          )}
          <input
            ref={el => {
              if (el) inputRefs.current[item.id] = el;
            }}
            value={item.content}
            onChange={e => handleContentChange(item.id, e.target.value)}
            onKeyDown={e => handleKeyDown(e, item.id)}
            onFocus={() => setActiveItemId(item.id)}
            placeholder={level === 0 ? "Main point..." : "Sub-point..."}
            className="flex-1 bg-transparent border-none focus:outline-none py-0.5 px-1 text-xs"
          />
        </div>
        {item.isExpanded && item.children.map(child => renderItem(child, level + 1))}
      </div>
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="text-xs text-gray-500 mb-1 border-b border-gray-100 pb-1">
        Tab to indent, Shift+Tab to outdent, Enter for new line
      </div>
      <div className="overflow-y-auto">
        {items.map(item => renderItem(item))}
      </div>
    </div>
  );
} 