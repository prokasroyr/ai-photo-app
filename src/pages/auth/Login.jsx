import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // ১. Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // ২. Firestore থেকে Role চেক করা
      let userRole = "admin"; // ডিফল্ট নিরাপদ রোল

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // ডাটাবেজে role ফিল্ড থাকলে নিবে, না থাকলে ডিফল্ট admin ই থাকবে
          if (data.role) {
            userRole = data.role;
          }
        }
      } catch (err) {
        console.error("Firestore read error:", err);
      }

      // ৩. ড্যাশবোর্ড নেভিগেশন (Alert তুলে দেওয়া হয়েছে যেন পেজ রিডাইরেক্টে ট্রাফিকে বাধা না পড়ে)
      if (userRole === "admin" || userRole === "photographer") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/client", { replace: true });
      }

    } catch (error) {
      console.error("Login Error:", error);
      let message = "Login failed. Please try again.";

      if (error.code === "auth/invalid-credential") {
        message = "❌ Email অথবা Password ভুল।";
      } else if (error.code === "auth/user-not-found") {
        message = "❌ এই Email দিয়ে কোনো account পাওয়া যায়নি।";
      } else if (error.code === "auth/wrong-password") {
        message = "❌ Password ভুল।";
      } else if (error.code === "auth/invalid-email") {
        message = "❌ Email address সঠিক নয়।";
      } else if (error.code === "auth/too-many-requests") {
        message = "⚠️ অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-[400px]"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Admin Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-3 rounded-lg font-semibold transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;