from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import sys
import util
import pandas as pd  # Import pandas if not already imported

# Get the path to the client directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_DIR = os.path.join(BASE_DIR, '..', 'client')

app = Flask(
    __name__, 
    template_folder=CLIENT_DIR,
    static_folder=CLIENT_DIR
)

@app.route('/')
def home():
    return render_template('app.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(CLIENT_DIR, filename)

@app.route('/get_feature_names', methods=['GET'])
def get_feature_names():
    response = jsonify({'data_columns': util.get_feature_name()})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# FIXED PREDICTION ENDPOINT
@app.route('/predict_price', methods=['POST'])
def predict_price():
    try:
        feature = request.form['feature']
        start_date = request.form['start_day']
        end_date = request.form['end_day']
        
        forecast_df = util.predict_with_prophet(feature, start_date, end_date)
        
        # Build response as list of objects
        forecast_list = []
        for _, row in forecast_df.iterrows():
            forecast_list.append({
                'date': row['ds'],
                'predicted_value': row['yhat']
            })
        
        response = jsonify(forecast_list)  # Return array directly
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except KeyError as e:
        return jsonify({'error': f'Missing form field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


if __name__ == '__main__':
    print("Starting Python Flask server...")
    app.run(debug=True, port=5000)