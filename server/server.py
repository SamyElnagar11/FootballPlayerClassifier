from flask import Flask, request, jsonify
import util

app = Flask(__name__)

@app.route('/classify_image', methods=['GET', 'POST'])
def classify_image():
    # استقبال بيانات الصورة من الـ Request Body
    image_data = request.form.get('image_data')

    if not image_data:
        return jsonify({'error': 'No image_data provided'}), 400

    # إجراء عملية التصنيف
    response = jsonify(util.classify_image(image_data))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Football Player Classification...")
    # تحميل القواميس والنموذج قبل تشغيل السيرفر
    util.load_saved_artifacts()
    app.run(port=5000, debug=True)