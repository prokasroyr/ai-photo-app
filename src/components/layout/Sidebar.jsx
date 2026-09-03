import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const ok = window.confirm("আপনি কি Logout করতে চান?");

    if (!ok) return;

    try {
      await signOut(auth);

      alert("✅ Logout Successful");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
      alert("❌ Logout Failed");
    }
  };

  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white p-6 flex flex-col justify-between">
      <div>
        {/* Logo / Title */}
        <h1 className="text-2xl font-bold mb-10">
          📸 AI Wedding
        </h1>

        {/* Navigation */}
        <nav className="flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="hover:bg-slate-800 p-3 rounded-lg transition"
          >
            🏠 Dashboard
          </Link>

          <Link
            to="/events/create"
            className="hover:bg-slate-800 p-3 rounded-lg transition"
          >
            ➕ Create Event
          </Link>

          <Link
            to="/events"
            className="hover:bg-slate-800 p-3 rounded-lg transition"
          >
            📅 My Events
          </Link>

          <Link
            to="/gallery"
            className="hover:bg-slate-800 p-3 rounded-lg transition"
          >
            📷 Photo Gallery
          </Link>

          <Link
            to="/settings"
            className="hover:bg-slate-800 p-3 rounded-lg transition"
          >
            ⚙️ Settings
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-semibold transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;