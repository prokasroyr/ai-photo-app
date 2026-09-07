import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AI_SERVER = "https://ai-photo-backend-8le8.onrender.com";

export default function Searching() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [isFailed, setIsFailed] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${AI_SERVER}/search-status/${jobId}`);
        const data = await res.json();

        if (data.status === "completed") {
          clearInterval(interval);
          // সার্চ কমপ্লিট হলে রেজাল্ট পেজে ডেটাসহ পাঠিয়ে দেওয়া হবে
          navigate(`/client/result/${jobId}`, {
            state: {
              matchedPhotos: data.matches || [],
              eventId: data.eventId || "default_event",
            },
          });
        } else if (data.status === "failed") {
          clearInterval(interval);
          setIsFailed(true);
        } else {
          setProgress(data.progress || 50); // প্রোগ্রেস পার্সেন্টেজ আপডেট
        }
      } catch (err) {
        console.error("Status polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, navigate]);

  if (isFailed) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl shadow-lg text-center border">
        <h2 className="text-xl font-bold text-red-600 mb-2">❌ Search Failed</h2>
        <p className="text-sm text-gray-500 mb-6">Could not match any face in this event.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl shadow-lg text-center border">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">🤖 Finding Your Photos...</h2>
      <p className="text-sm text-gray-500 mb-6">AI is processing event images to locate your face.</p>

      <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
        <div
          className="bg-purple-600 h-4 rounded-full transition-all duration-300 animate-pulse"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs font-semibold text-purple-700">{progress}% Completed</p>
    </div>
  );
}