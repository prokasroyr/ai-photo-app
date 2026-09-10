import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // ১. Firebase Auth এ ইউজার তৈরি
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // ২. Firestore এ পেন্ডিং ইউজার হিসেবে ডাটা সেভ করা
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email.trim(),
        role: "photographer",
        isApproved: false, // 🛑 বাই-ডিফল্ট অ্যাপ্রুভ থাকবে না
        createdAt: new Date(),
      });

      // অ্যাকাউন্ট খোলার পর সেশন ক্লিয়ার করে দেওয়া
      await auth.signOut();

      alert("⏳ অ্যাকাউন্ট তৈরি হয়েছে! অ্যাডমিন অনুমোদনের (Approval) পর লগইন করতে পারবেন।");
      navigate("/login");
    } catch (error) {
      console.error("Register Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-lg w-[400px]"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Register
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-3 rounded-lg font-semibold transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;