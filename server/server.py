from flask import Flask, request, jsonify, send_from_directory
import os

import util


 #Get the path to the client build directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_BUILD_DIR = os.path.join(BASE_DIR, '..', 'client', 'build')

app = Flask(__name__)

# API Endpoints (unchanged)
@app.route('/get_feature_names', methods=['GET'])
def get_feature_names():
    response = jsonify({'data_columns': util.get_feature_name()})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/predict_price', methods=['POST'])
def predict_price():
    try:
        feature = request.form['feature']
        start_date = request.form['start_date']
        end_date = request.form['end_date']
        
        forecast_df = util.predict_with_prophet(feature, start_date, end_date)
        
        # Build response as list of objects
        forecast_list = []
        for _, row in forecast_df.iterrows():
            forecast_list.append({
                'date': row['ds'],
                'predicted_value': row['yhat']
            })
        
        response = jsonify(forecast_list)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except KeyError as e:
        return jsonify({'error': f'Missing form field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(CLIENT_BUILD_DIR, path)):
        return send_from_directory(CLIENT_BUILD_DIR, path)
    else:
        return send_from_directory(CLIENT_BUILD_DIR, 'index.html')

if __name__ == '__main__':
    print("Starting Python Flask server...")
    app.run(host='0.0.0.0', port=5000) 