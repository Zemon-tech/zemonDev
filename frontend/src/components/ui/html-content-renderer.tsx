import React, { useEffect, useRef, useCallback } from 'react';

interface HtmlContentRendererProps {
  content: string;
  className?: string;
  allowScripts?: boolean;
  allowStyles?: boolean;
  initializationMode?: 'auto' | 'content-scripts' | 'renderer';
  renderInIframe?: boolean;
}

/**
 * Full HTML Content Renderer
 * Renders HTML content with full CSS and JavaScript support
 * No security restrictions since content is created by admin team
 * 
 * This implementation properly handles:
 * - Inline and external scripts
 * - Event handlers (onclick, onload, etc.)
 * - Interactive components (accordions, tabs, carousels, charts)
 * - CSS styles and external stylesheets
 * - DOM manipulation and dynamic content
 */
export const HtmlContentRenderer: React.FC<HtmlContentRendererProps> = ({
  content,
  className = '',
  allowScripts = true,
  allowStyles = true,
  initializationMode = 'auto',
  renderInIframe = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const styleIdRef = useRef<string>('');
  const scriptIdRef = useRef<string>('');
  const executedScriptsRef = useRef<Set<string>>(new Set());
  const initializedComponentsRef = useRef<Set<string>>(new Set());

  // Generate unique IDs for this component instance
  useEffect(() => {
    if (!styleIdRef.current) {
      styleIdRef.current = `html-content-styles-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!scriptIdRef.current) {
      scriptIdRef.current = `html-content-scripts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }, []);

  // Renderer runs idempotent init after executing content scripts (if any)

  // Function to execute scripts properly
  const executeScripts = useCallback(async () => {
    if (!containerRef.current || !allowScripts) return;
    // In 'renderer' mode we intentionally do not execute content scripts
    if (initializationMode === 'renderer') return;

    try {
      const container = containerRef.current;

      // Step 1: Handle external scripts first
      const externalScripts = container.querySelectorAll('script[src]');
      const externalScriptPromises: Promise<void>[] = [];

      externalScripts.forEach((script) => {
        const scriptSrc = script.getAttribute('src');
        if (scriptSrc) {
          const scriptKey = `external-${scriptSrc}`;
          
          // Skip if already executed
          if (executedScriptsRef.current.has(scriptKey)) {
            return;
          }

          const promise = new Promise<void>((resolve, reject) => {
            // Check if script is already loaded globally
            const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
            if (existingScript) {
              executedScriptsRef.current.add(scriptKey);
              resolve();
              return;
            }

            const newScript = document.createElement('script');
            newScript.src = scriptSrc;
            newScript.async = script.hasAttribute('async');
            newScript.defer = script.hasAttribute('defer');
            newScript.type = script.getAttribute('type') || 'text/javascript';
            
            // Copy all other attributes
            Array.from(script.attributes).forEach(attr => {
              if (!['src', 'async', 'defer', 'type'].includes(attr.name)) {
                newScript.setAttribute(attr.name, attr.value);
              }
            });

            newScript.onload = () => {
              executedScriptsRef.current.add(scriptKey);
              resolve();
            };
            newScript.onerror = () => reject(new Error(`Failed to load script: ${scriptSrc}`));
            
            document.head.appendChild(newScript);
          });
          
          externalScriptPromises.push(promise);
          script.remove();
        }
      });

      // Step 2: Wait for external scripts to load, then execute inline scripts
      await Promise.all(externalScriptPromises);

      // Step 3: Execute inline scripts
      const inlineScripts = container.querySelectorAll('script:not([src])');
      inlineScripts.forEach((script, index) => {
        try {
          const scriptContent = script.textContent || script.innerHTML;
          if (scriptContent) {
            const scriptKey = `inline-${index}-${scriptContent.slice(0, 50)}`;
            
            // Skip if already executed
            if (executedScriptsRef.current.has(scriptKey)) {
              script.remove();
              return;
            }

            // Create a new script element
            const newScript = document.createElement('script');
            newScript.type = script.getAttribute('type') || 'text/javascript';
            newScript.id = `${scriptIdRef.current}-inline-${Date.now()}-${index}`;
            
            // Copy all attributes
            Array.from(script.attributes).forEach(attr => {
              if (attr.name !== 'type') {
                newScript.setAttribute(attr.name, attr.value);
              }
            });

            // Set the script content
            newScript.textContent = scriptContent;
            
            // Append to document head; browser will execute in global scope
            document.head.appendChild(newScript);
            executedScriptsRef.current.add(scriptKey);
            
            script.remove();
          }
        } catch (error) {
          console.warn('Inline script processing error:', error);
        }
      });

    } catch (error) {
      console.warn('Script execution setup error:', error);
    }
  }, [allowScripts, initializationMode]);

  // Function to initialize interactive components
  const initializeInteractiveComponents = useCallback(() => {
    try {
      const container = containerRef.current;
      if (!container) return;

      const containerId = container.innerHTML.slice(0, 100); // Use content hash as ID
      
      // Skip if already initialized
      if (initializedComponentsRef.current.has(containerId)) {
        return;
      }

      // Initialize accordions
      initializeAccordions(container);
      
      // Initialize tabs
      initializeTabs(container);
      
      // Initialize carousels
      initializeCarousels(container);
      
      // Initialize charts
      initializeCharts(container);
      
      // Initialize other interactive elements
      initializeOtherComponents(container);

      // Mark as initialized
      initializedComponentsRef.current.add(containerId);

    } catch (error) {
      console.warn('Interactive components initialization error:', error);
    }
  }, []);

  // Execute scripts and initialize components when content changes
  useEffect(() => {
    if (renderInIframe) return; // handled separately
    if (!containerRef.current) return;

    executedScriptsRef.current.clear();
    initializedComponentsRef.current.clear();

    // Execute content scripts first, then run renderer init (idempotent)
    const run = async () => {
      try {
        await executeScripts();
      } finally {
        initializeInteractiveComponents();
      }
    };
    run();

    return () => {
      // no-op cleanup; listeners are idempotent on next render due to data-initialized
    };
  }, [content, executeScripts, initializeInteractiveComponents, renderInIframe]);

  // Extract and inject CSS styles
  useEffect(() => {
    if (renderInIframe) return;
    if (!containerRef.current || !allowStyles) return;

    // Remove any existing styles from this component
    const existingStyle = document.getElementById(styleIdRef.current);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Find all style tags and inject them into the document head
    const styleTags = containerRef.current.querySelectorAll('style');
    if (styleTags.length > 0) {
      const combinedStyles = Array.from(styleTags)
        .map(styleTag => styleTag.textContent)
        .join('\n');

      if (combinedStyles) {
        const newStyle = document.createElement('style');
        newStyle.id = styleIdRef.current;
        newStyle.textContent = combinedStyles;
        document.head.appendChild(newStyle);
      }
    }

    // Find all link tags for external CSS and inject them
    const linkTags = containerRef.current.querySelectorAll('link[rel="stylesheet"]');
    linkTags.forEach((linkTag) => {
      const href = linkTag.getAttribute('href');
      if (href) {
        const existingLink = document.querySelector(`link[href="${href}"]`);
        if (!existingLink) {
          const newLink = document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = href;
          document.head.appendChild(newLink);
        }
      }
    });
  }, [content, allowStyles, renderInIframe]);

  // Cleanup function to remove injected resources when component unmounts
  useEffect(() => {
    return () => {
      if (allowStyles && styleIdRef.current) {
        // Remove styles injected by this component
        const injectedStyle = document.getElementById(styleIdRef.current);
        if (injectedStyle) {
          injectedStyle.remove();
        }
      }
      
      if (allowScripts && scriptIdRef.current) {
        // Remove scripts injected by this component
        const injectedScripts = document.querySelectorAll(`script[id^="${scriptIdRef.current}"]`);
        injectedScripts.forEach(script => script.remove());
      }
    };
  }, [allowStyles, allowScripts]);

  // Override any CSS width constraints in the HTML content
  useEffect(() => {
    if (!containerRef.current || renderInIframe) return;
    
    const container = containerRef.current;
    const overrideWidthConstraints = () => {
      const elements = container.querySelectorAll('*');
      elements.forEach((element) => {
        const el = element as HTMLElement;
        if (el.style.width && el.style.width !== '100%') {
          el.style.width = '100%';
        }
        if (el.style.maxWidth && el.style.maxWidth !== '100%') {
          el.style.maxWidth = '100%';
        }
      });
    };

    // Override constraints after content is rendered
    const observer = new MutationObserver(overrideWidthConstraints);
    observer.observe(container, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['style']
    });

    // Initial override
    overrideWidthConstraints();

    return () => observer.disconnect();
  }, [content, renderInIframe]);

  // Iframe rendering (opt-in)
  useEffect(() => {
    if (!renderInIframe || !iframeRef.current) return;
    const iframe = iframeRef.current;

    // Set content using srcdoc to avoid repeated document.write and variable re-declarations
    if (iframe.srcdoc !== (content || '')) {
      iframe.srcdoc = content || '';
    }

    let cleanup: (() => void) | undefined;

    const onLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      // Auto-resize height to fit content
      const updateHeight = () => {
        try {
          const body = doc.body;
          const html = doc.documentElement;
          const height = Math.max(
            body?.scrollHeight || 0,
            body?.offsetHeight || 0,
            html?.clientHeight || 0,
            html?.scrollHeight || 0,
            html?.offsetHeight || 0
          );
          iframe.style.height = `${height}px`;
        } catch {
          /* noop */
        }
      };

      let resizeObserver: ResizeObserver | undefined;
      const ResizeObserverCtor = (window as any).ResizeObserver as typeof ResizeObserver | undefined;
      if (ResizeObserverCtor) {
        resizeObserver = new ResizeObserverCtor(updateHeight);
        resizeObserver.observe(doc.documentElement);
      }
      const interval = window.setInterval(updateHeight, 300);
      updateHeight();

      cleanup = () => {
        if (resizeObserver) resizeObserver.disconnect();
        window.clearInterval(interval);
      };
    };

    iframe.addEventListener('load', onLoad, { once: true });

    return () => {
      iframe.removeEventListener('load', onLoad);
      if (cleanup) cleanup();
    };
  }, [content, renderInIframe]);

  if (renderInIframe) {
    return (
      <iframe
        ref={iframeRef}
        className={`${className} forge-html-content`}
        style={{ 
          width: '100vw', 
          border: 'none',
          maxWidth: '100vw',
          padding: '0',
          margin: '0',
          minWidth: '100vw'
        }}
        title="html-content"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`full-html-content w-full ${className}`}
      style={{ 
        width: '100%',
        maxWidth: '100%',
        padding: '0',
        margin: '0',
        minWidth: '100%'
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

// Helper functions for initializing interactive components
function initializeAccordions(container: Element) {
  // Pattern 1: Container-based accordions with triggers/panels
  const accordions = container.querySelectorAll('.accordion, [data-accordion]');
  accordions.forEach((accordion) => {
    const triggers = accordion.querySelectorAll('.accordion-trigger, [data-accordion-trigger]');
    const panels = accordion.querySelectorAll('.accordion-panel, [data-accordion-panel]');

    triggers.forEach((trigger, index) => {
      const panel = panels[index];
      const el = trigger as HTMLElement & { dataset: DOMStringMap };
      if (el.dataset.initialized === 'true') return;
      if (trigger && panel) {
        el.dataset.initialized = 'true';
        el.addEventListener('click', () => {
          const panelElement = panel as HTMLElement;
          const isOpen = panel.classList.contains('active') || panelElement.style.display === 'block';

          panels.forEach(p => {
            const pElement = p as HTMLElement;
            p.classList.remove('active');
            pElement.style.display = 'none';
          });

          if (!isOpen) {
            panel.classList.add('active');
            panelElement.style.display = 'block';
          }
        });
      }
    });
  });

  // Pattern 2: Header-content siblings (.accordion-header + .accordion-content)
  const headers = container.querySelectorAll('.accordion-header');
  headers.forEach((header) => {
    const el = header as HTMLElement & { dataset: DOMStringMap };
    if (el.dataset.initialized === 'true') return;
    const contentSibling = header.nextElementSibling;
    if (!contentSibling || !contentSibling.classList.contains('accordion-content')) return;
    el.dataset.initialized = 'true';
    el.addEventListener('click', () => {
      header.classList.toggle('active');
      contentSibling.classList.toggle('active');
      const contentEl = contentSibling as HTMLElement;
      contentEl.style.display = contentSibling.classList.contains('active') ? 'block' : 'none';
    });
  });
}

function initializeTabs(container: Element) {
  const tabContainers = container.querySelectorAll('.tabs, [data-tabs]');
  tabContainers.forEach((tabContainer) => {
    const tabButtons = tabContainer.querySelectorAll('.tab-button, [data-tab]');
    const tabContents = tabContainer.querySelectorAll('.tab-content, [data-tab-content]');

    tabButtons.forEach((button, index) => {
      const content = tabContents[index];
      const btn = button as HTMLElement & { dataset: DOMStringMap };
      if (btn.dataset.initialized === 'true') return;
      if (button && content) {
        btn.dataset.initialized = 'true';
        btn.addEventListener('click', () => {
          tabButtons.forEach(b => (b as HTMLElement).classList.remove('active'));
          tabContents.forEach(c => (c as HTMLElement).classList.remove('active'));

          btn.classList.add('active');
          content.classList.add('active');
        });
      }
    });
  });
}

function initializeCarousels(container: Element) {
  const carousels = container.querySelectorAll('.carousel, [data-carousel]');
  carousels.forEach((carousel) => {
    const slides = carousel.querySelectorAll('.carousel-slide, [data-slide]');
    const prevButton = carousel.querySelector('.carousel-prev, [data-carousel-prev]');
    const nextButton = carousel.querySelector('.carousel-next, [data-carousel-next]');
    const indicators = carousel.querySelectorAll('.carousel-indicator, [data-carousel-indicator]');
    
    // Use unique variable names to prevent conflicts
    const carouselState = {
      currentSlide: 0
    };
    
    const showSlide = (index: number) => {
      slides.forEach((slide, i) => {
        const slideElement = slide as HTMLElement;
        slideElement.style.display = i === index ? 'block' : 'none';
      });
      
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
    };
    
    if (prevButton) {
      const prev = prevButton as HTMLElement & { dataset: DOMStringMap };
      if (prev.dataset.initialized !== 'true') {
        prev.dataset.initialized = 'true';
        prev.addEventListener('click', () => {
          carouselState.currentSlide = carouselState.currentSlide > 0 ? carouselState.currentSlide - 1 : slides.length - 1;
          showSlide(carouselState.currentSlide);
        });
      }
    }
    
    if (nextButton) {
      const next = nextButton as HTMLElement & { dataset: DOMStringMap };
      if (next.dataset.initialized !== 'true') {
        next.dataset.initialized = 'true';
        next.addEventListener('click', () => {
          carouselState.currentSlide = carouselState.currentSlide < slides.length - 1 ? carouselState.currentSlide + 1 : 0;
          showSlide(carouselState.currentSlide);
        });
      }
    }
    
    indicators.forEach((indicator, index) => {
      const ind = indicator as HTMLElement & { dataset: DOMStringMap };
      if (ind.dataset.initialized === 'true') return;
      ind.dataset.initialized = 'true';
      ind.addEventListener('click', () => {
        carouselState.currentSlide = index;
        showSlide(carouselState.currentSlide);
      });
    });
    
    // Show first slide
    if (slides.length > 0) {
      showSlide(0);
    }
  });
}

function initializeCharts(container: Element) {
  const charts = container.querySelectorAll('canvas[data-chart], .chart');
  charts.forEach((chart) => {
    // Check if Chart.js is available
    if (typeof (window as any).Chart !== 'undefined') {
      const ctx = (chart as HTMLCanvasElement).getContext('2d');
      if (ctx) {
        // Try to initialize chart based on data attributes or surrounding elements
        const chartType = chart.getAttribute('data-chart-type') || 'bar';
        const chartData = chart.getAttribute('data-chart-data');
        
        if (chartData) {
          try {
            const data = JSON.parse(chartData);
            new (window as any).Chart(ctx, {
              type: chartType,
              data: data,
              options: {
                responsive: true,
                maintainAspectRatio: false
              }
            });
          } catch (error) {
            console.warn('Chart initialization error:', error);
          }
        }
      }
    }
  });
}

function initializeOtherComponents(container: Element) {
  // Initialize modals
  const modals = container.querySelectorAll('.modal, [data-modal]');
  modals.forEach((modal, modalIndex) => {
    const modalId = modal.getAttribute('data-modal') || `modal-${modalIndex}`;
    const triggers = container.querySelectorAll(`[data-modal-trigger="${modalId}"]`);
    const closeButtons = modal.querySelectorAll('.modal-close, [data-modal-close]');
    
    triggers.forEach((trigger) => {
      const trg = trigger as HTMLElement & { dataset: DOMStringMap };
      if (trg.dataset.initialized === 'true') return;
      trg.dataset.initialized = 'true';
      trg.addEventListener('click', () => {
        const modalElement = modal as HTMLElement;
        modal.classList.add('active');
        modalElement.style.display = 'block';
      });
    });
    
    closeButtons.forEach((closeBtn) => {
      const btn = closeBtn as HTMLElement & { dataset: DOMStringMap };
      if (btn.dataset.initialized === 'true') return;
      btn.dataset.initialized = 'true';
      btn.addEventListener('click', () => {
        const modalElement = modal as HTMLElement;
        modal.classList.remove('active');
        modalElement.style.display = 'none';
      });
    });
  });
  
  // Initialize tooltips
  const tooltips = container.querySelectorAll('[data-tooltip]');
  tooltips.forEach((element) => {
    const el = element as HTMLElement & { dataset: DOMStringMap };
    if (el.dataset.initialized === 'true') return;
    el.dataset.initialized = 'true';
    el.addEventListener('mouseenter', (e) => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = el.getAttribute('data-tooltip') || '';
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = '#333';
      tooltip.style.color = 'white';
      tooltip.style.padding = '5px 10px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.fontSize = '12px';
      tooltip.style.zIndex = '1000';
      
      document.body.appendChild(tooltip);
      
      const rect = (e.target as Element).getBoundingClientRect();
      tooltip.style.left = rect.left + 'px';
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
      el.addEventListener('mouseleave', () => {
        tooltip.remove();
      }, { once: true });
    });
  });
}

export default HtmlContentRenderer;
