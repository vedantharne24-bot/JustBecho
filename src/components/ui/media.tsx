"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * next/image with an editorial load-in: the frame shows the media tone, the
 * photograph fades and settles from a slight scale once decoded.
 */
export function Media({
  className,
  imgClassName,
  alt,
  ...props
}: ImageProps & { imgClassName?: string }) {
  const [loaded, setLoaded] = useState(false);
  const src = typeof props.src === "string" ? props.src : "";
  const unoptimized = props.unoptimized ?? (src.startsWith("data:") || src.startsWith("blob:"));

  return (
    <div className={cn("relative overflow-hidden bg-media", className)}>
      <Image
        {...props}
        alt={alt}
        unoptimized={unoptimized}
        onLoad={(e) => {
          setLoaded(true);
          props.onLoad?.(e);
        }}
        className={cn(
          "object-cover transition-[opacity,scale] duration-[1200ms] ease-out",
          loaded ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}
