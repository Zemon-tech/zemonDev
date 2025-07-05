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
      className="flex flex-col h-full overflow-hidden bg-base-100 border-l border-base-200 relative"
      style={{ 
        width: `${width}px`,
        minWidth: `${minWidth}px`,
        maxWidth: '50vw',
        transition: isResizing ? 'none' : 'width 0.1s ease-out'
      }}
    >
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-lg font-semibold mb-2">AI Chat</div>
        <div className="flex-1 overflow-y-auto mb-2">
          <div className="text-base-content/60 italic">Chat history will appear here</div>
        </div>
      </div>
      <div className="p-4 border-t border-base-200 bg-base-100 sticky bottom-0">
        <input
          type="text"
          className="input input-bordered w-full"
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