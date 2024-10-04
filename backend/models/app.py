from flask import *
import numpy as np
import os
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from flask_cors import CORS

# Load your pre-trained model
model = load_model('fracturePrediction.h5')

app = Flask(__name__)
CORS(app)

def preprocess_image(img_path, target_size):
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) 
    img_array /= 255.0 
    return img_array

@app.route("/check_fracture", methods=['POST'])
def check_fracture():
    if request.method == 'POST':
        img = request.files['image']
        print(f"Received file: {img.filename}")

        static_dir = "./static/"
        if not os.path.exists(static_dir):
            os.makedirs(static_dir)

        img_path = os.path.join(static_dir, img.filename)
        img.save(img_path)

        print("Processing image for prediction...")
        test_image = preprocess_image(img_path, target_size=(150, 150))
        
        result = model.predict(test_image)
        if result[0][0] > 0.5:
            prediction = 'No Fracture'
        else:
            prediction = 'Fracture'
        
        print(f"Prediction result: {prediction}")
        return prediction

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=False)
