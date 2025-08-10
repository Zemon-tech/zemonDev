import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentRendererProps {
  content: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
  enableScripts?: boolean;
  enableStyles?: boolean;
}

/**
 * Secure HTML Content Renderer with CSS and JavaScript Support
 * Safely renders HTML content with DOMPurify sanitization and working script execution
 */
export const HtmlContentRenderer: React.FC<HtmlContentRendererProps> = ({
  content,
  className = '',
  allowedTags = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'br', 'hr',
    'ul', 'ol', 'li',
    'strong', 'em', 'b', 'i', 'u', 's',
    'blockquote', 'pre', 'code',
    'a', 'img', 'video', 'audio', 'iframe',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'form', 'input', 'button', 'textarea', 'select', 'option',
    'canvas', 'svg', 'style', 'script'
  ],
  allowedAttributes = [
    'href', 'src', 'alt', 'title', 'class', 'id', 'style',
    'width', 'height', 'target', 'rel', 'type', 'value',
    'placeholder', 'required', 'disabled', 'readonly',
    'maxlength', 'minlength', 'pattern', 'autocomplete',
    'autofocus', 'form', 'name', 'size', 'step', 'min', 'max',
    'defer', 'async', 'crossorigin', 'integrity'
  ],
  enableScripts = true,
  enableStyles = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<Set<string>>(new Set());

  // Configure DOMPurify with allowed tags and attributes
  const sanitizeConfig = {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORBID_TAGS: ['object', 'embed', 'applet'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    RETURN_TRUSTED_TYPE: false,
    SANITIZE_DOM: true,
    WHOLE_DOCUMENT: false,
  };

  // Sanitize the HTML content
  let sanitizedContent = DOMPurify.sanitize(content, sanitizeConfig);

  // Post-process HTML to enhance external links and extract styles/scripts
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    
    // Find all external links and add target="_blank" and rel="noopener noreferrer"
    const links = tempDiv.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        // Add external link indicator class
        link.classList.add('external-link');
      }
    });
    
    sanitizedContent = tempDiv.innerHTML;
  }

  // Function to safely execute scripts
  const executeScripts = (container: HTMLElement) => {
    if (!enableScripts) return;

    const scripts = container.querySelectorAll('script');
    console.log(`Found ${scripts.length} scripts to execute`);
    
    scripts.forEach((script, index) => {
      // Create a unique ID for this script to avoid duplicate execution
      const scriptId = `script-${Date.now()}-${index}`;
      if (processedRef.current.has(scriptId)) return;
      
      try {
        if (script.src) {
          // External script
          console.log(`Loading external script: ${script.src}`);
          const newScript = document.createElement('script');
          newScript.src = script.src;
          newScript.async = script.async;
          newScript.defer = script.defer;
          newScript.type = script.type || 'text/javascript';
          newScript.crossOrigin = script.crossOrigin;
          newScript.integrity = script.integrity;
          
          // Add error handling
          newScript.onerror = () => console.warn('Failed to load external script:', script.src);
          newScript.onload = () => console.log('External script loaded:', script.src);
          
          container.appendChild(newScript);
        } else if (script.textContent) {
          // Inline script - execute by creating a new script element
          console.log(`Executing inline script ${index}:`, script.textContent.substring(0, 100) + '...');
          try {
            // Create a new script element
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            newScript.type = script.type || 'text/javascript';
            
            // Append to document head to execute
            document.head.appendChild(newScript);
            
            // Remove after execution to keep DOM clean
            setTimeout(() => {
              if (newScript.parentNode) {
                newScript.parentNode.removeChild(newScript);
              }
            }, 100);
            
            console.log('Inline script executed successfully');
          } catch (error) {
            console.warn('Failed to execute inline script:', error);
          }
        }
        
        processedRef.current.add(scriptId);
      } catch (error) {
        console.warn('Error processing script:', error);
      }
    });
  };

  // Function to apply styles
  const applyStyles = (container: HTMLElement) => {
    if (!enableStyles) return;

    const styles = container.querySelectorAll('style');
    styles.forEach((style, index) => {
      const styleId = `style-${Date.now()}-${index}`;
      if (processedRef.current.has(styleId)) return;

      try {
        // Create a new style element
        const newStyle = document.createElement('style');
        newStyle.textContent = style.textContent || '';
        newStyle.setAttribute('data-html-content', 'true');
        
        // Add to document head
        document.head.appendChild(newStyle);
        processedRef.current.add(styleId);
      } catch (error) {
        console.warn('Error applying style:', error);
      }
    });
  };

  // Effect to process content after render
  useEffect(() => {
    console.log('HtmlContentRenderer: Content changed, processing...');
    console.log('Container ref:', containerRef.current);
    console.log('Enable scripts:', enableScripts);
    console.log('Enable styles:', enableStyles);
    
    if (containerRef.current) {
      // Apply styles first
      if (enableStyles) {
        console.log('Applying styles...');
        applyStyles(containerRef.current);
      }
      
      // Execute scripts after styles are applied
      if (enableScripts) {
        console.log('Executing scripts...');
        // Small delay to ensure styles are applied and DOM is ready
        setTimeout(() => {
          console.log('Executing scripts after delay...');
          executeScripts(containerRef.current!);
        }, 200);
      }
    } else {
      console.log('Container ref not available yet');
    }

    // Cleanup function to remove added styles when component unmounts
    return () => {
      console.log('Cleaning up HtmlContentRenderer...');
      if (enableStyles) {
        const addedStyles = document.querySelectorAll('style[data-html-content="true"]');
        addedStyles.forEach(style => {
          document.head.removeChild(style);
        });
      }
      processedRef.current.clear();
    };
  }, [content, enableScripts, enableStyles]);

  // Custom CSS for enhanced styling
  const customStyles = `
    .html-content h1 { @apply text-4xl font-bold text-primary mb-4 mt-8; }
    .html-content h2 { @apply text-3xl font-bold text-primary/90 mb-3 mt-6; }
    .html-content h3 { @apply text-2xl font-semibold text-primary/80 mb-2 mt-4; }
    .html-content h4 { @apply text-xl font-semibold text-base-content mb-2 mt-4; }
    .html-content h5 { @apply text-lg font-medium text-base-content mb-2 mt-3; }
    .html-content h6 { @apply text-base font-medium text-base-content mb-2 mt-3; }
    
    .html-content p { @apply text-base text-base-content/90 leading-relaxed mb-4; }
    .html-content ul { @apply list-disc list-inside space-y-2 mb-4; }
    .html-content ol { @apply list-decimal list-inside space-y-2 mb-4; }
    .html-content li { @apply text-base-content/90; }
    
    .html-content blockquote { @apply border-l-4 border-primary/30 pl-4 italic text-base-content/80 bg-base-200/30 py-2 rounded-r-lg mb-4; }
    .html-content pre { @apply bg-base-200 text-base-content p-4 rounded-lg overflow-x-auto text-sm font-mono my-4; }
    .html-content code { @apply bg-base-200 text-base-content px-2 py-1 rounded text-sm font-mono; }
    
    .html-content a { @apply text-primary hover:text-primary-focus underline decoration-primary/30 underline-offset-2 transition-colors; }
    .html-content a.external-link { @apply inline-flex items-center gap-1; }
    .html-content a.external-link::after { 
      content: "↗"; 
      @apply text-xs ml-1 opacity-70; 
    }
    .html-content img { @apply max-w-full h-auto rounded-lg shadow-md my-4; }
    .html-content video { @apply max-w-full h-auto rounded-lg shadow-md my-4; }
    .html-content audio { @apply w-full my-4; }
    
    .html-content table { @apply w-full border-collapse bg-base-100 rounded-lg overflow-hidden shadow-lg border border-base-300 my-6; }
    .html-content thead { @apply bg-gradient-to-r from-primary/10 to-primary/5; }
    .html-content th { @apply px-4 py-3 text-left text-sm font-semibold text-base-content/90 border-b border-base-200; }
    .html-content td { @apply px-4 py-3 text-sm text-base-content/80 border-b border-base-200; }
    .html-content tr:hover { @apply bg-base-50 transition-colors duration-150; }
    
    .html-content form { @apply space-y-4 my-6; }
    .html-content input, .html-content textarea, .html-content select { @apply w-full px-3 py-2 border border-base-300 rounded-md bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent; }
    .html-content button { @apply px-4 py-2 bg-primary text-primary-content rounded-md hover:bg-primary-focus transition-colors; }
    
    .html-content canvas { @apply max-w-full h-auto rounded-lg shadow-md my-4; }
    .html-content svg { @apply max-w-full h-auto; }
    
    .html-content iframe { @apply w-full aspect-video rounded-lg shadow-md my-4; }
    
    /* Dark mode adjustments */
    .dark .html-content blockquote { @apply bg-base-800/30 border-primary/20; }
    .dark .html-content pre { @apply bg-base-800 text-base-content; }
    .dark .html-content code { @apply bg-base-800 text-base-content; }
    .dark .html-content table { @apply bg-base-800 border-base-600; }
    .dark .html-content thead { @apply from-primary/20 to-primary/10; }
    .dark .html-content th { @apply border-base-600; }
    .dark .html-content td { @apply border-base-600; }
    .dark .html-content tr:hover { @apply bg-base-700; }
    .dark .html-content input, .dark .html-content textarea, .dark .html-content select { @apply bg-base-800 border-base-600; }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div 
        ref={containerRef}
        className={`html-content ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </>
  );
};

export default HtmlContentRenderer;
