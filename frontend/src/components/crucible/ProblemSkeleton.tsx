import React from 'react';

/**
 * Skeleton loading UI for problem workspace
 * Shows placeholders while content is loading
 */
export default function ProblemSkeleton() {
  return (
    <div className="flex h-full bg-base-100 dark:bg-base-900">
      {/* Problem sidebar skeleton */}
      <div className="w-64 border-r border-base-200 dark:border-base-700 p-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 mb-6"></div>
        
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-6"></div>
        
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex-1 overflow-hidden flex flex-col border-x border-base-200 dark:border-base-700">
        <div className="h-16 border-b border-base-200 dark:border-base-700 p-4 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
        
        <div className="flex-1 p-4 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-4"></div>
        </div>
      </div>
      
      {/* AI Chat sidebar skeleton */}
      <div className="w-64 border-l border-base-200 dark:border-base-700 p-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
      </div>
    </div>
  );
} 