const Header = () => {
  return (
    <header className="border-b border-black">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">

        {/* Left side */}
        <div className="text-xl font-semibold">
          Blog
        </div>

        {/* Right side navigation */}
        <nav className="flex items-center gap-6 text-sm">
          <a href="#" className="hover:text-gray-600">Our story</a>
          <a href="#" className="hover:text-gray-600">Membership</a>
          <a href="#" className="hover:text-gray-600">Write</a>
          <a href="#" className="hover:text-gray-600">Sign in</a>

          <button className="rounded-full bg-black px-4 py-2 text-white hover:bg-gray-800">
            Get started
          </button>
        </nav>

      </div>
    </header>
  )
}

export default Header
