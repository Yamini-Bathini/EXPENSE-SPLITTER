import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-rose-50/60 dark:bg-slate-900/80 backdrop-blur-md" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(95vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/60 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 p-6 shadow-xl backdrop-blur-xl focus:outline-none">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full border border-white/60 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 p-2 text-slate-700 dark:text-slate-300 transition hover:bg-white dark:hover:bg-slate-700">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
