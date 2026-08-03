import { photoUrl, webpUrl } from "@/lib/media";

type Props = {
  storagePath: string | null | undefined;
  filename: string | null | undefined;
  alt: string;
  className?: string;
  /** Rendered size hint for the browser (évite de charger plus grand que nécessaire). */
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

/**
 * <picture> avec source WebP + fallback JPEG d'origine.
 * Les vignettes passent des dimensions contraintes ; le zoom charge la pleine résolution.
 */
export function PhotoPicture({
  storagePath,
  filename,
  alt,
  className,
  sizes,
  width,
  height,
  priority = false,
}: Props) {
  const jpg = photoUrl(storagePath, filename);
  if (!jpg) return null;
  const webp = webpUrl(storagePath, filename);

  return (
    <picture className="contents">

      <source srcSet={webp} type="image/webp" {...(sizes ? { sizes } : {})} />
      <img
        src={jpg}
        alt={alt}
        {...(width ? { width } : {})}
        {...(height ? { height } : {})}
        {...(sizes ? { sizes } : {})}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        {...(priority ? { fetchPriority: "high" as const } : {})}
        className={className ?? ""}
      />
    </picture>
  );
}
