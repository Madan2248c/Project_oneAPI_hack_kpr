from symptom2disease import * 
# from disease_predictor import DiseasePredictor

# Initialize the predictor with the path to your training data
predictor = DiseasePredictor("C:/Users/Madan/OneDrive/Desktop/intel/Project_oneAPI_hack_kpr/backend/models/SyptomsData/Training.csv")

# Call the prediction method with symptoms
result = predictor.predictDisease("Itching")

# Output the result
print(result['final_prediction'])
