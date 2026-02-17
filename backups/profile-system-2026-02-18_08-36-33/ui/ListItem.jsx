export default function ListItem({ title, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-md w-full text-left py-sm px-sm rounded-md hover:bg-surface-alt transition-all"
    >
      <Icon className="text-brand-primary text-xl" />
      <span className="text-text-base font-medium">{title}</span>
    </button>
  );
}
