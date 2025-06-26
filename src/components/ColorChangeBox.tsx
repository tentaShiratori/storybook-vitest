import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ColorChangeBoxProps {
  width?: number;
  height?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  initialColor?: string;
  activeColor?: string;
}

export const ColorChangeBox = forwardRef<HTMLDivElement, ColorChangeBoxProps>(
  (
    {
      width = 200,
      height = 200,
      className,
      threshold = 0.5,
      rootMargin = "0px",
      initialColor = "bg-gray-300",
      activeColor = "bg-blue-500",
    },
    ref,
  ) => {
    const [isInView, setIsInView] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // IntersectionObserverの設定
    const setupIntersectionObserver = useCallback(() => {
      if (!boxRef.current) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsInView(entry.isIntersecting);
          });
        },
        {
          threshold,
          rootMargin,
        },
      );

      observerRef.current.observe(boxRef.current);
    }, [threshold, rootMargin]);

    // IntersectionObserverの初期化
    useEffect(() => {
      setupIntersectionObserver();

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [setupIntersectionObserver]);

    return (
      <div
        ref={(node) => {
          // forwardRefとuseRefの両方に対応
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          boxRef.current = node;
        }}
        className={cn(
          "transition-colors duration-500 ease-in-out rounded-lg flex items-center justify-center text-white font-bold text-lg",
          isInView ? activeColor : initialColor,
          className,
        )}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {isInView ? "画面内！" : "画面外"}
      </div>
    );
  },
);
