import { useState, useEffect, useRef } from 'react';
import { Search, User, Globe, X } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { motion, AnimatePresence } from 'framer-motion';

interface UserSearchResult {
  username: string;
  fullName: string;
  headline?: string;
  bio?: string;
  profileBackground?: {
    type: 'gradient' | 'image';
    value: string;
    name: string;
  };
  publicUrl: string;
}

interface UserSearchProps {
  placeholder?: string;
  className?: string;
  onUserSelect?: (user: UserSearchResult) => void;
}

const UserSearch = ({ placeholder = "Search users...", className = "", onUserSelect }: UserSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/search?q=${encodeURIComponent(query)}`
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data.data.results || []);
          setShowResults(true);
        } else {
          setError('Failed to search users');
          setResults([]);
        }
      } catch (err) {
        setError('Failed to search users');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleUserSelect = (user: UserSearchResult) => {
    if (onUserSelect) {
      onUserSelect(user);
    } else {
      // Default behavior: navigate to public profile
      window.open(user.publicUrl, '_blank');
    }
    setShowResults(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-base-200"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (results.length > 0 || loading || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {loading && (
              <div className="p-4 text-center text-base-content/60">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                Searching...
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-error">
                {error}
              </div>
            )}

            {!loading && !error && results.length === 0 && query.length >= 2 && (
              <div className="p-4 text-center text-base-content/60">
                No users found
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <div className="py-2">
                {results.map((user, index) => (
                  <motion.div
                    key={user.username}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-3 hover:bg-base-200 cursor-pointer transition-colors"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{
                          background: user.profileBackground?.type === 'gradient' 
                            ? user.profileBackground.value 
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base-content truncate">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-base-content/60 truncate">
                          @{user.username}
                        </div>
                        {user.headline && (
                          <div className="text-xs text-base-content/50 truncate mt-1">
                            {user.headline}
                          </div>
                        )}
                      </div>
                      <Globe className="w-4 h-4 text-base-content/40" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSearch;
