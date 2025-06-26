import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

export const LazyImage = forwardRef<HTMLImageElement, LazyImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      className,
      placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23f3f4f6'/%3E%3C/svg%3E",
      onLoad,
      onError,
      threshold = 0.1,
      rootMargin = "50px",
    },
    ref,
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [imageSrc, setImageSrc] = useState(placeholder);
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // IntersectionObserverの設定
    const setupIntersectionObserver = useCallback(() => {
      if (!imgRef.current) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              // 一度表示されたら監視を停止
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        {
          threshold,
          rootMargin,
        },
      );

      observerRef.current.observe(imgRef.current);
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

    // 画像の読み込み
    useEffect(() => {
      if (isInView && !isLoaded && !hasError) {
        setImageSrc(src);
      }
    }, [isInView, src, isLoaded, hasError]);

    // 画像読み込み成功時の処理
    const handleLoad = useCallback(() => {
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    }, [onLoad]);

    // 画像読み込みエラー時の処理
    const handleError = useCallback(() => {
      setHasError(true);
      setIsLoaded(false);
      setImageSrc(placeholder);
      onError?.();
    }, [placeholder, onError]);

    return (
      <div
        className={cn("relative overflow-hidden", !isLoaded && "animate-pulse bg-gray-200", className)}
        style={{
          width: width ? `${width}px` : "auto",
          height: height ? `${height}px` : "auto",
        }}
      >
        {/** biome-ignore lint/performance/noImgElement: テストなので */}
        <img
          ref={(node) => {
            // forwardRefとuseRefの両方に対応
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            imgRef.current = node;
          }}
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            hasError && "opacity-50",
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />

        {/* ローディングインジケーター */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {/* エラーインジケーター */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>Error icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">画像を読み込めませんでした</p>
            </div>
          </div>
        )}
      </div>
    );
  },
);
