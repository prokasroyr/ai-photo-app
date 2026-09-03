import { useState, useEffect } from "react";
import { db, auth } from "../../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { CLOUD_NAME, UPLOAD_PRESET } from "../../services/cloudinary";

function Settings() {
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

      // প্রত্যেক photographer-এর জন্য আলাদা settings
      const docRef = doc(db, "settings", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        // নতুন photographer হলে blank settings
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

      setProfile({
        ...profile,
        logo: data.secure_url,
      });

      alert("✅ Logo Uploaded");
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

      // Photographer UID অনুযায়ী settings save হবে
      await setDoc(
        doc(db, "settings", user.uid),
        {
          ...profile,
          photographerId: user.uid,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      alert("✅ Settings Saved Successfully");
    } catch (error) {
      console.error("❌ Save settings error:", error);
      alert("❌ Failed to Save Settings");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">
        ⚙️ Settings
      </h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-5">

        <input
          type="text"
          name="photographerName"
          placeholder="Photographer Name"
          value={profile.photographerName}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          name="studioName"
          placeholder="Studio Name"
          value={profile.studioName}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={profile.phone}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={profile.email}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          name="address"
          placeholder="Address"
          value={profile.address}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
          rows="3"
        />

        <div>
          <label className="font-semibold block mb-2">
            Studio Logo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />

          {profile.logo && (
            <img
              src={profile.logo}
              alt="Logo"
              className="w-32 h-32 object-cover rounded-lg mt-4 border"
            />
          )}
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          💾 Save Settings
        </button>

      </div>
    </div>
  );
}

export default Settings;