// components/ui/toast-renderer.tsx
"use client";

import * as React from "react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "@/components/ui/toast";
import { useToast as useToastHook } from "@/hooks/use-toast";
import ToastProgressBar from "@/components/ui/toast-progress";

/**
 * ToastRenderer
 *
 * - reads `toasts` array from your use-toast memory
 * - renders a <Toast /> for each item using Radix primitives
 * - calls the hook's dismiss when the Radix toast is closed
 */
export function ToastRenderer() {
  const state = useToastHook();
  const { toasts, dismiss } = state;

  return (
    // Render within Radix Provider so animations/gestures work
    <ToastProvider>
      {/* Radix viewport (positioned in components/ui/toast.tsx) */}
      <ToastViewport />

      {/* Render each toast from memory */}
      {toasts.map((t) => {
        if (!t.id) return null;
        const open = t.open ?? true;

        const dur =
          typeof (t as any).duration === "number" ? (t as any).duration : 4000;

        return (
          <Toast
            key={t.id}
            open={open}
            // pass same duration to Radix so it auto-dismisses in sync
            duration={dur}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                // delegate to your hook's dismiss
                dismiss?.(t.id);
              }
            }}
            // optionally pass variant if you store it
            // variant={(t as any).variant}
          >
            {/* progress bar: top thin green line that animates over `dur` */}
            <ToastProgressBar duration={dur} />

            {t.title ? <ToastTitle>{t.title}</ToastTitle> : null}
            {t.description ? (
              <ToastDescription>{t.description}</ToastDescription>
            ) : null}
            <ToastClose />
          </Toast>
        );
      })}
    </ToastProvider>
  );
}

export default ToastRenderer;
