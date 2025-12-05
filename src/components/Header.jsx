function Header({ title, subtitle, action }) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {action && <div className="w-full sm:w-auto">{action}</div>}
      </div>
    </div>
  );
}

export default Header;

