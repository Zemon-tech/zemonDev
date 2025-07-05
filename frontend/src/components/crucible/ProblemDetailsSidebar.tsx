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
      className="h-full bg-base-100 border-r border-base-200 flex flex-col overflow-hidden relative"
      style={{ 
        width: `${width}px`,
        minWidth: `${minWidth}px`,
        maxWidth: '50vw',
        transition: isResizing ? 'none' : 'width 0.1s ease-out'
      }}
    >
      <ScrollArea className="flex-1 h-full overflow-y-auto">
        <div className="card p-4 space-y-6 shadow-none border-none bg-transparent">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <div className="prose mb-4 text-base-content/80">{description}</div>
          <Accordion type="multiple" className="space-y-2">
            <AccordionItem value="requirements">
              <AccordionTrigger className="btn btn-ghost w-full justify-between">Requirements</AccordionTrigger>
              <AccordionContent className="pl-4">
                <ul className="list-disc list-inside text-sm">
                  {requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="constraints">
              <AccordionTrigger className="btn btn-ghost w-full justify-between">Constraints</AccordionTrigger>
              <AccordionContent className="pl-4">
                <ul className="list-disc list-inside text-sm">
                  {constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="hints">
              <AccordionTrigger className="btn btn-ghost w-full justify-between">AI Hints</AccordionTrigger>
              <AccordionContent className="pl-4">
                <ul className="list-disc list-inside text-sm">
                  {hints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span key={tag} className="badge mr-2 capitalize badge-outline">{tag}</span>
            ))}
          </div>
          <div>
            <textarea
              placeholder="Personal notes…"
              className="textarea w-full textarea-bordered"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onNotesChange(e.target.value)}
              rows={4}
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