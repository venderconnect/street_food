import { useEffect } from 'react';

export default function ConfirmDialog({ open, title = 'Are you sure?', description, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onCancel?.(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-lg bg-white shadow-lg">
          <div className="p-4 border-b font-semibold">{title}</div>
          {description && <div className="p-4 text-sm text-gray-700">{description}</div>}
          <div className="p-4 border-t flex justify-end gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 rounded bg-gray-200 text-gray-900 text-sm"> {cancelText} </button>
            <button onClick={onConfirm} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm"> {confirmText} </button>
          </div>
        </div>
      </div>
    </div>
  );
}
