import logging
from flask import Flask, request, jsonify,send_file
import numpy as np
import os
from ultralytics import YOLO
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor
import asyncio
from symptom2disease import DiseasePredictor 
from yoloFractureDetection import process_image

# Load your pre-trained model and disease predictor
disease = DiseasePredictor("../models/SyptomsData/Training.csv")

app = Flask(__name__)
CORS(app)
executor = ThreadPoolExecutor()
weights_path = "./best.pt"
class_names = ["elbow positive", "fingers positive", "forearm fracture", "humerus fracture", "humerus", "shoulder fracture", "wrist positive"]
model = YOLO(weights_path)

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
    out = process_image(img_path,model,class_names)
    print(out)

    return send_file(out,mimetype='image/jpeg'),200

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
