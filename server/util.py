import json
import pickle
import numpy as np
import cv2
import base64
import os
from wavelet import w2d

# متغيرات عامة
__class_name_to_number = {}
__class_number_to_name = {}
__model = None

def classify_image(image_base64_data, file_path=None):
    """
    تقبل إما نص base64 أو مسار ملف، وتقوم باقتطاع الوجه وتصنيفه.
    """
    imgs = get_cropped_image_if_2_eyes(file_path, image_base64_data)
    result = []

    for img in imgs:
        # 1. تحجيم الصورة الأصلية المقتطعة إلى 32x32
        scalled_raw_img = cv2.resize(img, (32, 32))
        
        # 2. تطبيق الـ Wavelet Transform وتحجيمه بنفس الأبعاد
        img_har = w2d(img, 'db1', 5)
        scalled_img_har = cv2.resize(img_har, (32, 32))
        
        # 3. دمج الصورتين رأسياً (Raw + Wavelet)
        combined_img = np.vstack((scalled_raw_img.reshape(32 * 32 * 3, 1), scalled_img_har.reshape(32 * 32, 1)))
        
        len_image_array = 32 * 32 * 3 + 32 * 32
        
        # 4. تحضير المصفوفة لتمريرها للموديل (Floating numbers)
        final = combined_img.reshape(1, len_image_array).astype(float)
        
        # 5. التوقع وحساب الاحتمالات
        prediction = __model.predict(final)[0]
        probabilities = np.around(__model.predict_proba(final) * 100, 2).tolist()[0]
        
        result.append({
            'class': class_number_to_name(prediction),
            'class_probability': probabilities,
            'class_dictionary': __class_name_to_number
        })

    return result

def class_number_to_name(class_num):
    return __class_number_to_name.get(class_num, "Unknown")

def load_saved_artifacts():
    """
    تحميل النموذج والـ Class Dictionary عند تشغيل السيرفر مرة واحدة فقط.
    """
    print("Loading saved artifacts... start")
    global __class_name_to_number
    global __class_number_to_name
    global __model

    # تحميل قاموس الفئات
    artifacts_path = os.path.join(os.path.dirname(__file__), "artifacts")
    dict_path = os.path.join(artifacts_path, "class_dictionary.json")
    
    with open(dict_path, "r") as f:
        __class_name_to_number = json.load(f)
        __class_number_to_name = {v: k for k, v in __class_name_to_number.items()}

    # تحميل النموذج
    model_path = os.path.join(artifacts_path, "saved_model.pickle")
    if __model is None:
        with open(model_path, 'rb') as f:
            __model = pickle.load(f)
            
    print("Loading saved artifacts... done")

def get_cv2_image_from_base64_string(b64str):
    """
    تحويل نص Base64 القادم من الـ Frontend إلى صورة OpenCV.
    """
    if ',' in b64str:
        encoded_data = b64str.split(',')[1]
    else:
        encoded_data = b64str
        
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def get_cropped_image_if_2_eyes(image_path, image_base64_data):
    """
    اقتطاع الوجه في حال وجود عينين اثنتين على الأقل.
    """
    # تحميل المصنفات مع دعم المسار الاحتياطي
    cascade_dir = os.path.join(os.path.dirname(__file__), "opencv/haarcascades")
    face_cascade_path = os.path.join(cascade_dir, "haarcascade_frontalface_default.xml")
    eye_cascade_path = os.path.join(cascade_dir, "haarcascade_eye.xml")

    if os.path.exists(face_cascade_path) and os.path.exists(eye_cascade_path):
        face_cascade = cv2.CascadeClassifier(face_cascade_path)
        eye_cascade = cv2.CascadeClassifier(eye_cascade_path)
    else:
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

    if image_path:
        img = cv2.imread(image_path)
    else:
        img = get_cv2_image_from_base64_string(image_base64_data)

    if img is None:
        return []

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    cropped_faces = []
    for (x, y, w, h) in faces:
        roi_gray = gray[y:y+h, x:x+w]
        roi_color = img[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(roi_gray)
        if len(eyes) >= 2:
            cropped_faces.append(roi_color)

    return cropped_faces