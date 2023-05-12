function FormField({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`form-control w-full mt-1 ${className}`}>{children}</div>
  );
}

export default FormField;
