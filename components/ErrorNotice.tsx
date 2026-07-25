import { AlertTriangle, X } from "lucide-react";

export function ErrorNotice({ message, onDismiss }: { message?: string; onDismiss?: () => void }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-400/30 bg-red-950/35 p-3 text-sm text-red-50">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
      <p className="min-w-0 flex-1 break-words">{message}</p>
      {onDismiss ? (
        <button aria-label="Dismiss error" className="rounded p-1 text-red-100/75 hover:bg-red-100/10 hover:text-red-50" onClick={onDismiss}>
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
