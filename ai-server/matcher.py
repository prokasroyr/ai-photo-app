import json
import numpy as np
import face_recognition
from PIL import Image

def search_matching_photos(selfie_file_path, photos_list, tolerance=0.55):
    """
    Render Free Tier-এর জন্য আল্ট্রা-ফাস্ট ও মেমোরি-অপটিমাইজড ফেস ম্যাচিং ফাংশন
    """
    matched_photos = []

    try:
        # ১. সেলফি লোড ও রেজুলেশন কমিয়ে RAM ক্র্যাশ ঠেকানো (Max 800px)
        with Image.open(selfie_file_path) as img:
            img = img.convert('RGB')
            img.thumbnail((800, 800))
            selfie_np = np.array(img)

        # ২. সেলফির ফেস এনকোডিং বের করা
        selfie_encodings = face_recognition.face_encodings(selfie_np, num_jitters=1)

        if len(selfie_encodings) == 0:
            print("❌ No face detected in the uploaded selfie!")
            return []

        target_encoding = selfie_encodings[0]
        print("📸 Selfie face encoding generated successfully.")

        # ৩. ডাটাবেসের সব এনকোডিং একসাথে লিস্টে নেওয়া
        db_encodings_list = []
        photo_mapping = []  # প্রতিটি এনকোডিং কোন ফটোর তা ট্র্যাক রাখতে

        for photo in photos_list:
            photo_encodings = photo.get("faceEncodings", [])
            photo_url = photo.get("imageUrl") or photo.get("cloudinaryUrl") or photo.get("url")
            photo_id = photo.get("id")

            if not photo_encodings or not photo_url:
                continue

            for enc_item in photo_encodings:
                try:
                    if isinstance(enc_item, str):
                        parsed_enc = json.loads(enc_item)
                    else:
                        parsed_enc = enc_item
                    
                    db_encodings_list.append(parsed_enc)
                    photo_mapping.append({
                        "id": photo_id,
                        "imageUrl": photo_url
                    })
                except Exception as err:
                    print(f"⚠️ Error parsing encoding: {err}")
                    continue

        if not db_encodings_list:
            print("⚠️ No valid encodings found in photos_list.")
            return []

        # ৪. NumPy Vectorized Distance (সব ছবির দূরত্ব একবারে ম্যাট্রিক্সে বের করা - মিলি সেকেন্ডের কাজ)
        db_matrix = np.array(db_encodings_list)
        distances = np.linalg.norm(db_matrix - target_encoding, axis=1)

        # ৫. ডুপ্লিকেট ছবি দূর করে ফিল্টার করা
        matched_dict = {}

        for idx, distance in enumerate(distances):
            if distance <= tolerance:
                photo_info = photo_mapping[idx]
                p_id = photo_info["id"]
                score = round(float(1 - distance), 2)

                # একই ছবিতে ২টি ফেস থাকলেও বেস্ট স্কোরটি মাত্র ১ বারই তালিকায় থাকবে
                if p_id not in matched_dict or score > matched_dict[p_id]["score"]:
                    matched_dict[p_id] = {
                        "id": p_id,
                        "imageUrl": photo_info["imageUrl"],
                        "score": max(score, 0.50)
                    }

        matched_photos = list(matched_dict.values())

    except Exception as e:
        print(f"❌ Error in face matching process: {e}")
        return []

    # ৬. সর্বোচ্চ স্কোরের ওপর ভিত্তি করে সর্টিং
    matched_photos.sort(key=lambda x: x["score"], reverse=True)
    print(f"🎉 Total Matched Photos Found: {len(matched_photos)}")
    
    return matched_photos