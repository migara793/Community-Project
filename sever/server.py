from flask import Flask,request,jsonify
import util
app=Flask(__name__) 



@app.route('/get_feature_names',methods=['GET'])
def get_feature_names():

    response = jsonify({'data_columns':util.get_feature_name()})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
@app.route('/predict_price',methods=['POST','GET'])
def predict_price():
    feature = request.form['feature']
    start_date = request.form['start_day']
    end_date  = request.form['end_day']

    response = jsonify(util.predict_with_prophet(feature,start_date,end_date))
    response.headers.add('Access-control-Allow-Origin','*')
    return response



if __name__=='__main__':
    print("Starting python Flask servrer for home Price Prediction ..")
    app.run()