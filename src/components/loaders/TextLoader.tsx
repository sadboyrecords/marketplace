function TextLoader({ className = "" }: { className?: string | undefined }) {
  return (
    <div className={`h-4 w-full animate-pulse bg-slate-400 ${className}`}></div>
  );
}

export default TextLoader;
