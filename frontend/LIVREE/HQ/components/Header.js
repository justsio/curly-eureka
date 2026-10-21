export default function Header() {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Entreprise';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {companyName.charAt(0)}
          </div>
          <span className="font-semibold text-gray-800 hidden sm:block">{companyName}</span>
        </div>
      </div>
    </header>
  );
}
