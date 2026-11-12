import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

type Base = { label: string; error?: string };
type InputProps = Base & InputHTMLAttributes<HTMLInputElement>;
type AreaProps = Base & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Field = forwardRef<HTMLInputElement, InputProps>(function Field(
  { label, error, className = "", id, ...rest },
  ref,
) {
  const fid = id || rest.name;
  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        id={fid}
        placeholder=" "
        {...rest}
        className="peer w-full bg-transparent border-0 border-b border-foreground/25 py-4 pt-6 text-foreground text-[16px] focus:outline-none focus:border-brass placeholder-transparent transition-colors"
      />
      <label
        htmlFor={fid}
        className="eyebrow absolute left-0 top-3 origin-left text-muted-foreground pointer-events-none transition-all duration-300
          peer-placeholder-shown:top-6 peer-placeholder-shown:text-[13px] peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-placeholder-shown:font-normal peer-placeholder-shown:text-muted-foreground
          peer-focus:top-0 peer-focus:text-brass peer-focus:eyebrow"
      >
        {label}
      </label>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
});

export function TextArea({ label, error, className = "", id, ...rest }: AreaProps) {
  const fid = id || rest.name;
  return (
    <div className={`relative ${className}`}>
      <textarea
        id={fid}
        placeholder=" "
        rows={4}
        {...rest}
        className="peer w-full bg-transparent border-0 border-b border-foreground/25 py-4 pt-6 text-foreground text-[16px] focus:outline-none focus:border-brass placeholder-transparent transition-colors resize-none"
      />
      <label
        htmlFor={fid}
        className="eyebrow absolute left-0 top-3 text-muted-foreground pointer-events-none transition-all duration-300
          peer-placeholder-shown:top-6 peer-placeholder-shown:text-[13px] peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case peer-placeholder-shown:font-normal
          peer-focus:top-0 peer-focus:text-brass"
      >
        {label}
      </label>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
