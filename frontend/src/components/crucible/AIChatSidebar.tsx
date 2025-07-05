import { useState, useCallback, useEffect } from 'react';

interface AIChatSidebarProps {
  defaultWidth?: number;
  minWidth?: number;
}

export default function AIChatSidebar({ 
  defaultWidth = 320,
  minWidth = 280,
}: AIChatSidebarProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const maxWidth = window.innerWidth / 2;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    }
  }, [isResizing, minWidth]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div 
      className="flex flex-col h-full overflow-hidden bg-base-100 dark:bg-base-800 border-l border-base-200 dark:border-base-700 relative"
      style={{ 
        width: `${width}px`,
        minWidth: `${minWidth}px`,
        maxWidth: '50vw',
        transition: isResizing ? 'none' : 'width 0.1s ease-out'
      }}
    >
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="text-sm font-semibold mb-1 border-b border-base-200 dark:border-base-700 pb-1 text-base-content">AI Chat</div>
        <div className="flex-1 overflow-y-auto">
          <div className="text-xs text-base-content/60 dark:text-base-content/50 italic">Chat history will appear here</div>
        </div>
      </div>
      <div className="p-2 border-t border-base-200 dark:border-base-700 bg-base-100 dark:bg-base-800 sticky bottom-0">
        <input
          type="text"
          className="input input-sm input-bordered w-full text-xs bg-base-100 dark:bg-base-700 text-base-content dark:text-base-content/90 border-base-200 dark:border-base-600"
          placeholder="Ask the AI..."
          disabled
        />
      </div>
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 transition-colors"
        onMouseDown={startResizing}
        style={{
          cursor: isResizing ? 'col-resize' : undefined,
          userSelect: 'none',
          touchAction: 'none',
        }}
      />
    </div>
  );
} 