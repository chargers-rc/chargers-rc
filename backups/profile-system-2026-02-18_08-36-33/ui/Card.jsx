export default function Card({ children, className = "" }) {
  return (
    <div className={`card card-hover ${className}`}>
      {children}
    </div>
  );
}
