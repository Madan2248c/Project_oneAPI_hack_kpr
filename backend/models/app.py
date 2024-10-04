import logging
from flask import Flask, request, jsonify
import numpy as np
import os
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor
import asyncio  # Import asyncio
from symptom2disease import DiseasePredictor  # Ensure this is the correct import path

# Load your pre-trained model and disease predictor
model = load_model('fracturePrediction.h5')
disease = DiseasePredictor("C:/Users/Madan/OneDrive/Desktop/intel/Project_oneAPI_hack_kpr/backend/models/SyptomsData/Training.csv")

app = Flask(__name__)
CORS(app)
executor = ThreadPoolExecutor()

def preprocess_image(img_path: str, target_size: tuple) -> np.ndarray:
    """Preprocess the image for prediction."""
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) 
    img_array /= 255.0  # Normalize the image
    return img_array

def sync_check_fracture(img_path: str) -> str:
    """Synchronous function to check for fractures."""
    test_image = preprocess_image(img_path, target_size=(150, 150))
    result = model.predict(test_image)
    return 'There is no fracture in the given x-ray' if result[0][0] > 0.5 else 'There is a fracture in the given x-ray, please meet your doctor immediately'

@app.route("/check_fracture", methods=['POST'])
async def check_fracture():
    """Endpoint to check for fractures in an X-ray image."""
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    img = request.files['image']
    print(f"Received file: {img.filename}")

    static_dir = "./static/"
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)

    img_path = os.path.join(static_dir, img.filename)
    img.save(img_path)

    # Run the synchronous function in a thread
    loop = asyncio.get_event_loop()
    prediction = await loop.run_in_executor(executor, sync_check_fracture, img_path)


    return jsonify({"prediction": prediction})

@app.route("/predict_disease", methods=['POST'])
async def predict_disease():
    """Endpoint to predict disease based on symptoms."""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    symptoms = request.json.get('symptoms')
    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400

    symptoms = ','.join(symptoms)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(executor, disease.disease_prediction, symptoms)

    return jsonify(result)

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=False)
