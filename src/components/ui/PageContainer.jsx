export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`min-h-screen bg-surface-base text-text-base flex justify-center`}>
      <div className={`w-full max-w-md px-md py-lg ${className}`}>
        {children}
      </div>
    </div>
  );
}
