export default function AIChatSidebar() {
  return (
    <div className="flex flex-col h-full w-full">
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
    </div>
  );
} 