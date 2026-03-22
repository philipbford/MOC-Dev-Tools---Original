import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Drawer({ open, onClose, title, children, width = 'max-w-xl' }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      {/* panel */}
      <div className={`relative z-10 w-full ${width} h-full bg-white shadow-xl flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
