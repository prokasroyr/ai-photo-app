import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function ClientHome() {
  const [eventCode, setEventCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkEvent = async (e) => {
    if (e) e.preventDefault();

    const cleanCode = eventCode.trim().toUpperCase();

    if (!cleanCode) {
      setError("অনুগ্রহ করে Event Code টাইপ করুন!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Event Code সার্চ করা
      const q = query(
        collection(db, "events"),
        where("eventCode", "==", cleanCode)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("❌ সঠিক Event Code দিন! এই কোডে কোনো ইভেন্ট পাওয়া যায়নি।");
        setLoading(false);
        return;
      }

      const eventDoc = snapshot.docs[0];
      const eventData = eventDoc.data();

      // 2. পরবর্তী পেজ ও ডাউনলোড ফিচারের জন্য লোকালস্টোরেজে তথ্য জমা রাখা
      localStorage.setItem("lastEventId", eventDoc.id);
      if (eventData.studioName) {
        localStorage.setItem("studioName", eventData.studioName);
      }

      // 3. সেলফি আপলোড পেজে রিডাইরেক্ট করা
      navigate(`/client/upload/${eventDoc.id}`, {
        state: { 
          eventId: eventDoc.id,
          studioName: eventData.studioName || "" 
        }
      });
    } catch (err) {
      console.error("Error verifying event:", err);
      setError("⚠️ ইভেন্ট ভেরিফাই করতে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100 space-y-6">
        
        {/* হেডার */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-800">
            📸 Find Your Photos
          </h1>
          <p className="text-sm text-gray-500">
            ফটোগ্রাফারের দেওয়া Event Code টি বসিয়ে আপনার ইভেন্টে প্রবেশ করুন
          </p>
        </div>

        {/* এরর মেসেজ */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center font-medium border border-red-200">
            {error}
          </div>
        )}

        {/* ইনপুট ফর্ম */}
        <form onSubmit={checkEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Passcode
            </label>
            <input
              type="text"
              placeholder="e.g. WEDDING2026"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono text-center text-lg tracking-widest transition"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3.5 rounded-xl font-bold shadow-md transition active:scale-95 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Checking Event Code..." : "Continue ➔"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default ClientHome;