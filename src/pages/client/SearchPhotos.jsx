import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const AI_SERVER = "https://ai-photo-backend-8le8.onrender.com";

export default function SearchPhotos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId: urlEventId } = useParams();

  // ইভেন্ট কোড ও সেলফি স্টেট
  const [eventId, setEventId] = useState(
    urlEventId || location.state?.eventId || ""
  );
  const [step, setStep] = useState(eventId ? 2 : 1); // ইভেন্ট আইডি থাকলে সরাসরি স্টেপ ২ তে যাবে
  const [selfie, setSelfie] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (urlEventId || location.state?.eventId) {
      setStep(2);
    }
  }, [urlEventId, location.state]);

  // স্টেপ ১: ইভেন্ট কোড সাবমিট
  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (!eventId.trim()) {
      alert("অনুগ্রহ করে ইভেন্ট কোডটি লিখুন!");
      return;
    }
    setStep(2);
  };

  // স্টেপ ২: সেলফি আপলোড ও AI সার্চ শুরু
  const handleSearch = async () => {
    if (!selfie) {
      alert("অনুগ্রহ করে আপনার একটি সেলফি সিলেক্ট করুন!");
      return;
    }

    setIsSearching(true);

    try {
      // ১. সেলফি আপলোড
      const formData = new FormData();
      formData.append("file", selfie);

      const uploadRes = await fetch(`${AI_SERVER}/upload-selfie`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.detail || "Selfie upload failed");

      const selfieUrl = uploadData.path || uploadData.url || uploadData.filePath || uploadData.selfieUrl;

      // ২. সার্চ স্টার্ট
      const searchRes = await fetch(`${AI_SERVER}/start-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId.trim(),
          event_id: eventId.trim(),
          selfieUrl: selfieUrl,
          selfie_url: selfieUrl,
        }),
      });

      const searchData = await searchRes.json();
      if (!searchRes.ok) throw new Error(searchData.detail || "Search start failed");

      const jobId = searchData.jobId || searchData.job_id || searchData.taskId;

      // ৩. প্রোগ্রেস পেজে রিডাইরেক্ট
      navigate(`/client/processing/${jobId}`);

    } catch (error) {
      console.error("❌ Search Failed:", error);
      alert("Search Failed: " + (error.message || "Unknown error"));
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-6 text-center">

        {/* ---------------- STEP 1: EVENT CODE INPUT ---------------- */}
        {step === 1 && (
          <form onSubmit={handleEventSubmit} className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              📸 Find Your Photos
            </h1>
            <p className="text-xs text-gray-500">
              ফটোগ্রাফারের দেওয়া Event Code টি বসিয়ে আপনার ইভেন্টে প্রবেশ করুন
            </p>

            <div className="text-left">
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Event Passcode
              </label>
              <input
                type="text"
                placeholder="E.G. WEDDING2026"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-center font-mono uppercase tracking-widest text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200"
            >
              Continue ➔
            </button>
          </form>
        )}

        {/* ---------------- STEP 2: UPLOAD SELFIE ---------------- */}
        {step === 2 && !isSearching && (
          <div className="space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">
                Event: {eventId}
              </span>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Change Code
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              🤳 Take or Upload a Selfie
            </h2>
            <p className="text-xs text-gray-500">
              আপনার একটি স্পষ্ট ছবি দিন যাতে AI ইভেন্ট থেকে আপনাকে খুঁজে বের করতে পারে
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelfie(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border rounded-lg p-1"
            />

            {selfie && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(selfie)}
                  alt="Selfie Preview"
                  className="w-24 h-24 object-cover rounded-full mx-auto border-2 border-purple-500 shadow-sm"
                />
              </div>
            )}

            <button
              onClick={handleSearch}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow transition duration-200"
            >
              🔍 Find My Photos
            </button>
          </div>
        )}

        {/* ---------------- SEARCHING LOADING STATE ---------------- */}
        {isSearching && (
          <div className="py-6 space-y-4">
            <p className="text-lg font-semibold text-gray-800">
              Connecting to AI Server...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="bg-purple-600 h-3 rounded-full animate-pulse w-full" />
            </div>
            <p className="text-xs text-gray-500">Please wait a moment...</p>
          </div>
        )}

      </div>
    </div>
  );
}