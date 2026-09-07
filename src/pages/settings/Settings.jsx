import { useState, useEffect } from "react";
import { db, auth } from "../../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { CLOUD_NAME, UPLOAD_PRESET } from "../../services/cloudinary";

export default function Settings() {
  const [profile, setProfile] = useState({
    photographerName: "",
    studioName: "",
    phone: "",
    email: "",
    address: "",
    logo: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const loadSettings = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        console.log("❌ No logged-in photographer");
        return;
      }

      const docRef = doc(db, "settings", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);

        // ওয়াটারমার্কের সুবিধার জন্য LocalStorage-এ Studio Name সিঙ্ক করা হলো
        if (data.studioName) {
          localStorage.setItem("studioName", data.studioName);
        }
      } else {
        setProfile({
          photographerName: "",
          studioName: "",
          phone: "",
          email: user.email || "",
          address: "",
          logo: "",
        });
      }
    } catch (error) {
      console.error("❌ Load settings error:", error);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error?.message || "Logo upload failed");
        return;
      }

      setProfile((prev) => ({
        ...prev,
        logo: data.secure_url,
      }));

      alert("✅ Logo Uploaded Successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Upload Failed");
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("❌ Please login first");
        return;
      }

      // ১. Firestore ডাটাবেজে সেভ
      await setDoc(
        doc(db, "settings", user.uid),
        {
          ...profile,
          photographerId: user.uid,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // ২. ওয়াটারমার্ক ডাউনলোডের জন্য LocalStorage-এ Studio Name সেভ
      if (profile.studioName) {
        localStorage.setItem("studioName", profile.studioName);
      }

      alert("✅ Settings & Branding Saved Successfully!");
    } catch (error) {
      console.error("❌ Save settings error:", error);
      alert("❌ Failed to Save Settings");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        ⚙️ Settings & Branding
      </h1>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-gray-100">
        <p className="text-sm text-gray-500 border-b pb-4">
          এখানে আপনার স্টুডিওর নাম, লোগো এবং পার্সোনাল তথ্য সেট করুন। আপনার সেভ করা স্টুডিওর নাম ক্লায়েন্টের ছবিতে ওয়াটারমার্ক হিসেবে ব্যবহার হবে।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Photographer Name
            </label>
            <input
              type="text"
              name="photographerName"
              placeholder="e.g. John Doe"
              value={profile.photographerName}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Studio Name (Watermark Text)
            </label>
            <input
              type="text"
              name="studioName"
              placeholder="e.g. Dream Photography Studio"
              value={profile.studioName}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              placeholder="+8801700000000"
              value={profile.phone}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="studio@example.com"
              value={profile.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Studio Address
          </label>
          <textarea
            name="address"
            placeholder="Enter full studio address..."
            value={profile.address}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="3"
          />
        </div>

        {/* Studio Logo Section */}
        <div className="border-t pt-4">
          <label className="font-semibold block mb-2 text-gray-700">
            🎨 Studio Logo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />

          {profile.logo && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-1">Current Logo Preview:</p>
              <img
                src={profile.logo}
                alt="Studio Logo"
                className="w-28 h-28 object-cover rounded-lg border shadow-sm"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition duration-200"
        >
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}