import { forwardRef, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(({ isOpen, onClose, title, children, className }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // モーダルの表示/非表示アニメーション
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 150);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESCキーでモーダルを閉じる
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose],
  );

  // キーボードイベントリスナーの追加/削除
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // スクロールを無効化
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, handleKeyDown]);

  // フォーカストラップ
  const handleTabKey = useCallback((event: React.KeyboardEvent) => {
    const focusableElements = event.currentTarget.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  // バックドロップクリックでモーダルを閉じる
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isVisible) return null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: テストなので
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/50 backdrop-blur-sm transition-opacity duration-150",
        isAnimating && isOpen ? "opacity-100" : "opacity-0",
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/** biome-ignore lint/a11y/noStaticElementInteractions: テストなので */}
      <div
        ref={ref}
        className={cn(
          "relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl",
          "transform transition-all duration-150",
          isAnimating && isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
          className,
        )}
        onKeyDown={handleTabKey}
      >
        {/* ヘッダー */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            {/** biome-ignore lint/nursery/useUniqueElementIds: テストなので */}
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>Close modal</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* コンテンツ */}
        <div className="p-4">{children}</div>

        {/* フォーカス用の隠しボタン */}
        <button type="button" className="sr-only" onClick={onClose} aria-label="Close modal (hidden)">
          Close
        </button>
      </div>
    </div>
  );
});
