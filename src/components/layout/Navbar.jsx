function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">
        📸 AI Wedding Photo
      </h1>

      <div className="flex gap-6">
        <button className="hover:text-blue-600">Dashboard</button>
        <button className="hover:text-blue-600">Events</button>
        <button className="hover:text-blue-600">Gallery</button>
      </div>
    </nav>
  );
}

export default Navbar;