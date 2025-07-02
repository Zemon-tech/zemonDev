import { useLocation } from 'react-router-dom';

interface PlaceholderPageProps {
  title?: string;
  description?: string;
}

export default function PlaceholderPage({ 
  title, 
  description 
}: PlaceholderPageProps) {
  const location = useLocation();
  
  // Extract the page name from the URL path
  const pathSegments = location.pathname.split('/');
  const pageName = title || pathSegments[pathSegments.length - 1] || 'Page';
  const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
      <div className="w-24 h-24 mb-8 rounded-full bg-primary/20 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/40 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
            {formattedPageName.charAt(0)}
          </div>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-primary font-heading mb-4">
        {formattedPageName}
      </h1>
      
      <p className="text-text-secondary max-w-md mb-8">
        {description || `This ${formattedPageName} section is coming soon. We're working hard to build an amazing experience for you.`}
      </p>
      
      <div className="w-full max-w-md h-12 bg-background-secondary rounded-lg overflow-hidden">
        <div className="h-full bg-primary w-2/3 animate-pulse"></div>
      </div>
      <p className="text-text-secondary text-sm mt-2">
        Development progress: ~65%
      </p>
    </div>
  );
} 