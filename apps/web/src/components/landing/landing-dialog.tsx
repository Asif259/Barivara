'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './landing.module.css';

let displayTransitionSupport: boolean | undefined;

/** Firefox parses `allow-discrete` but does not transition `display`, so probe it. */
function canTransitionDisplay() {
  if (displayTransitionSupport !== undefined) return displayTransitionSupport;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete')) {
    return (displayTransitionSupport = false);
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  void getComputedStyle(probe).display;
  probe.style.display = 'none';
  displayTransitionSupport = getComputedStyle(probe).display === 'block';
  probe.remove();
  return displayTransitionSupport;
}

/** Plays the exit transition, then closes, in browsers without `overlay`. */
async function closeAnimated(dialog: HTMLDialogElement) {
  if (!(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay())) {
    dialog.setAttribute('data-closing', '');
    const animations = dialog.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 600)),
      ]);
    }
    if (!dialog.hasAttribute('data-closing')) return;
    dialog.removeAttribute('data-closing');
  }
  dialog.close();
}

interface LandingDialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  narrow?: boolean;
  children: ReactNode;
}

/**
 * Native modal <dialog>: the browser provides focus containment, inert page,
 * Esc / back-gesture dismissal and focus return. Click outside also closes it.
 */
export function LandingDialog({ open, onClose, labelledBy, narrow, children }: LandingDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // React swallows the native `autofocus` attribute, so focus the marked field here.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
    else if (!open && dialog.open) void closeAnimated(dialog);
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleClose = () => onCloseRef.current();
    // Route Esc through the animated close.
    const handleCancel = (e: Event) => {
      e.preventDefault();
      void closeAnimated(dialog);
    };

    // Light dismiss where `closedby` is missing (Safari). Test the pointer
    // position, not the target: the dialog is also the target for its padding.
    const outside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    const handleDown = (e: PointerEvent) => {
      pressedOutside = outside(e);
    };
    const handleUp = (e: PointerEvent) => {
      if (pressedOutside && outside(e)) void closeAnimated(dialog);
    };
    const needsLightDismiss = !('closedBy' in HTMLDialogElement.prototype);

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('cancel', handleCancel);
    if (needsLightDismiss) {
      dialog.addEventListener('pointerdown', handleDown);
      dialog.addEventListener('pointerup', handleUp);
    }
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('pointerdown', handleDown);
      dialog.removeEventListener('pointerup', handleUp);
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      data-lenis-prevent
      className={`${styles.dialog} ${narrow ? styles.dialogNarrow : ''}`}
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      {children}
    </dialog>
  );
}
