import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion';
import React, { useState, useCallback, useEffect } from 'react';

interface Props {
  title: string;
  description: string;
  requirements: string[];
  constraints: string[];
  hints: string[];
  tags: string[];
  notes: string;
  onNotesChange: (val: string) => void;
  defaultWidth?: number;
  minWidth?: number;
}

export default function ProblemDetailsSidebar({
  title,
  description,
  requirements,
  constraints,
  hints,
  tags,
  notes,
  onNotesChange,
  defaultWidth = 320,
  minWidth = 280,
}: Props) {
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
      const newWidth = e.clientX;
      const maxWidth = window.innerWidth / 2;
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
    <aside 
      className="h-full bg-base-100 dark:bg-base-800 border-r border-base-200 dark:border-base-700 flex flex-col overflow-hidden relative"
      style={{ 
        width: `${width}px`,
        minWidth: `${minWidth}px`,
        maxWidth: '50vw',
        transition: isResizing ? 'none' : 'width 0.1s ease-out'
      }}
    >
      <ScrollArea className="flex-1 h-full overflow-y-auto">
        <div className="card p-2 space-y-3 shadow-none border-none bg-transparent">
          <h2 className="text-lg font-bold text-base-content">{title}</h2>
          <div className="prose-sm text-base-content/80 dark:text-base-content/70 text-sm">{description}</div>
          <Accordion type="multiple" className="space-y-1">
            <AccordionItem value="requirements" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-sm font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                Requirements
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-disc list-inside text-xs space-y-0.5 text-base-content/90 dark:text-base-content/80">
                  {requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="constraints" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-sm font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                Constraints
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-disc list-inside text-xs space-y-0.5 text-base-content/90 dark:text-base-content/80">
                  {constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="hints" className="border-b border-base-200/50 dark:border-base-700/50">
              <AccordionTrigger className="py-1 px-2 text-sm font-medium w-full flex justify-between items-center hover:bg-base-200/20 dark:hover:bg-base-700/30 rounded text-base-content">
                AI Hints
              </AccordionTrigger>
              <AccordionContent className="pl-2 py-1">
                <ul className="list-disc list-inside text-xs space-y-0.5 text-base-content/90 dark:text-base-content/80">
                  {hints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex flex-wrap gap-1 mb-1">
            {tags.map(tag => (
              <span key={tag} className="badge badge-sm capitalize badge-outline text-[10px] py-0 h-5 text-base-content/80 dark:text-base-content/70">{tag}</span>
            ))}
          </div>
          <div>
            <textarea
              placeholder="Personal notes…"
              className="textarea textarea-sm w-full textarea-bordered text-xs bg-base-100 dark:bg-base-700 text-base-content dark:text-base-content/90 border-base-200 dark:border-base-600"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onNotesChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </ScrollArea>
      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 transition-colors"
        onMouseDown={startResizing}
        style={{
          cursor: isResizing ? 'col-resize' : undefined,
          userSelect: 'none',
          touchAction: 'none',
        }}
      />
    </aside>
  );
} 