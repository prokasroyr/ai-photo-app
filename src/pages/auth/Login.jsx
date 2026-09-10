import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
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

      // ২. Firestore থেকে Role এবং Approval স্ট্যাটাস চেক
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        const role = data.role || "photographer";
        const isApproved = data.isApproved === true || data.approved === true;

        // 🛑 অ্যাডমিন ব্যতীত অন্য রোল যদি Approved না থাকে তবে লগআউট করিয়ে দেওয়া
        if (role !== "admin" && !isApproved) {
          await signOut(auth);
          alert("⚠️ আপনার অ্যাকাউন্টটি এখনও অ্যাডমিন দ্বারা অনুমোদিত (Approve) হয়নি। অনুগ্রহ করে অপেক্ষা করুন।");
          setLoading(false);
          return;
        }

        // ৩. রোল অনুযায়ী রিডাইরেক্ট
        if (role === "admin" || role === "photographer") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/client", { replace: true });
        }
      } else {
        // ফায়ারস্টোরে রেকর্ড না থাকলে বাই-ডিফল্ট ড্যাশবোর্ডে পাঠাবে
        navigate("/dashboard", { replace: true });
      }

    } catch (error) {
      console.error("Login Error:", error);
      let message = "Login failed. Please try again.";

      if (error.code === "auth/invalid-credential") {
        message = "❌ Email অথবা Password ভুল।";
      } else if (error.code === "auth/user-not-found") {
        message = "❌ এই Email দিয়ে কোনো account পাওয়া যায়নি।";
      } else if (error.code === "auth/wrong-password") {
        message = "❌ Password ভুল।";
      } else if (error.code === "auth/invalid-email") {
        message = "❌ Email address সঠিক নয়।";
      } else if (error.code === "auth/too-many-requests") {
        message = "⚠️ অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
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
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

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