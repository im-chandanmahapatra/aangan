import type { Img } from "../data";

type Props = {
  image: Img;
  sizes?: string;
  priority?: boolean;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
};

/** Responsive WebP image: two widths, lazy by default, intrinsic size to avoid CLS. */
export function Picture({
  image,
  sizes = "100vw",
  priority = false,
  className = "",
  alt,
  style,
}: Props) {
  return (
    <img
      src={image.lg}
      srcSet={`${image.sm} 720w, ${image.lg} ${image.lgW ?? 1440}w`}
      sizes={sizes}
      width={image.w}
      height={image.h}
      alt={alt ?? image.alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
      style={style}
    />
  );
}
