import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firestore'; // আপনার Firestore Config ফাইল অনুযায়ী পাথ ঠিক রাখুন

const AI_API_URL = "https://ai-photo-backend-8le8.onrender.com";

export default function EventDashboard({ eventId = "YOUR_EVENT_ID" }) {
  const [statusData, setStatusData] = useState({
    status: 'idle', // idle | processing | completed | failed
    total: 0,
    processed: 0,
    failed: 0,
    percentage: 0,
  });

  const [isTriggering, setIsTriggering] = useState(false);

  // ১. ফায়ারবেস থেকে রিয়েল-টাইম প্রগ্রেস আপডেট শোনা (Real-time Listener)
  useEffect(() => {
    if (!eventId) return;

    const eventRef = doc(db, 'events', eventId);
    
    // onSnapshot দিয়ে লাইভ ডাটা রিড করা
    const unsubscribe = onSnapshot(eventRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().processingStatus) {
        setStatusData(docSnap.data().processingStatus);
      }
    });

    return () => unsubscribe(); // আনমাউন্ট হলে লিসেনার বন্ধ করবে
  }, [eventId]);

  // ২. AI প্রসেসিং শুরু করার বাটনের হ্যান্ডলার
  const handleStartProcessing = async () => {
    setIsTriggering(true);
    try {
      const res = await axios.post(`${AI_API_URL}/process-event`, { eventId });
      if (res.data.success) {
        alert("🚀 AI Face Recognition শুরু হয়েছে!");
      }
    } catch (error) {
      console.error("Processing start error:", error);
      alert("প্রসেসিং শুরু করতে সমস্যা হয়েছে! সার্ভার চালু আছে কি না চেক করুন।");
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* হেডার সেকশন */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📸 Photographer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Event ID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-blue-600">{eventId}</span>
          </p>
        </div>

        {/* AI Processing Trigger Button */}
        <button
          onClick={handleStartProcessing}
          disabled={statusData.status === 'processing' || isTriggering}
          className={`px-6 py-3 rounded-xl font-bold text-white shadow-md transition flex items-center gap-2 ${
            statusData.status === 'processing' || isTriggering
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {statusData.status === 'processing' ? '⚡ AI Processing...' : '▶ Start AI Processing'}
        </button>
      </div>

      {/* রিয়েল-টাইম প্রগ্রেস বার কার্ড */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">AI Processing Progress</span>
            {/* স্ট্যাটাস ব্যাজ */}
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
                statusData.status === 'completed'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : statusData.status === 'processing'
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 animate-pulse'
                  : 'bg-gray-100 text-gray-600 border'
              }`}
            >
              {statusData.status}
            </span>
          </div>
          <span className="text-2xl font-black text-blue-600">{statusData.percentage || 0}%</span>
        </div>

        {/* প্রগ্রেস বার (Progress Bar) */}
        <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden border">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${statusData.percentage || 0}%` }}
          />
        </div>
      </div>

      {/* স্ট্যাটাস কাউন্টার কার্ডসমূহ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* মোট ছবি */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm text-center">
          <p className="text-sm font-medium text-gray-500">Total Photos</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-1">{statusData.total || 0}</p>
        </div>

        {/* সফলভাবে প্রসেসড */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm text-center border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Processed (Faces Found)</p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">{statusData.processed || 0}</p>
        </div>

        {/* ফেস না পাওয়া বা ব্যর্থ */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm text-center border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-gray-500">Failed / No Face</p>
          <p className="text-3xl font-extrabold text-red-500 mt-1">{statusData.failed || 0}</p>
        </div>
      </div>

    </div>
  );
}