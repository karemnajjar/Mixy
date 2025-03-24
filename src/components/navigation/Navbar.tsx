export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-primary-500 text-2xl font-bold">Mixy</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <NavLink href="/feed">Feed</NavLink>
            <NavLink href="/explore">Explore</NavLink>
            <NavLink href="/messages">Messages</NavLink>
            <NavLink href="/notifications">Notifications</NavLink>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <button className="bg-primary-500 text-white px-4 py-2 rounded-full hover:bg-primary-600">
              Create
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-gray-600 hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium"
    >
      {children}
    </a>
  );
} 