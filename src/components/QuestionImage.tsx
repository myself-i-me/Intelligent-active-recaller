interface Props {
  src: string;
  alt?: string;
}

// Resolves the image src against the deployed app's base URL when given a
// relative path, leaves http(s) and data: URLs alone.
function resolveSrc(src: string): string {
  if (/^(https?:|data:)/i.test(src)) return src;
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  const cleaned = src.replace(/^\.?\//, '');
  return `${base}/${cleaned}`;
}

export function QuestionImage({ src, alt }: Props) {
  return (
    <div className="my-3 flex justify-center">
      <img
        src={resolveSrc(src)}
        alt={alt ?? ''}
        className="max-h-96 rounded border border-slate-200 shadow-sm"
        loading="lazy"
      />
    </div>
  );
}
