export default function MenuButton({ onClick, isActive, children, title }) {
  return (
    <button
      onClick={onClick}
      type="button"
      title={title}
      className={`p-2 rounded hover:bg-indigo-100 transition-colors ${
        isActive ? 'bg-indigo-100 text-indigo-600' : 'text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}