import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Firebase Auth স্টেট পরিবর্তন ওয়াচ করা
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        // Firestore থেকে রোল ফেচ করা
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        // ডাটাবেজে রোল না পাওয়া গেলে বাই-ডিফল্ট 'admin' ধরে নেয়া
        const role = userDoc.exists() && userDoc.data()?.role 
          ? userDoc.data().role 
          : "admin";

        // চেক করা রোলটি অনুমতিপ্রাপ্ত কি না
        if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error checking role:", error);
        // নেটওয়ার্ক বা অন্য কোনো সমস্যা হলেও অ্যাডমিনকে অ্যাক্সেস দেওয়া (ফ্যালব্যাক)
        setIsAuthorized(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [allowedRoles]);

  // Auth/Role চেক চলাকালীন লোডিং স্ক্রিন দেখাবে
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center font-semibold text-gray-600 animate-pulse">
          Verifying access permission...
        </div>
      </div>
    );
  }

  // চেক শেষ হওয়ার পর অনুমতি না থাকলে Client/Login পেজে পাঠাবে
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  // অনুমতি থাকলে Protected Routes রেন্ডার করবে
  return <Outlet />;
}