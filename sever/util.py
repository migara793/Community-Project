import json
import pickle
import numpy as np
__data_columns=None
__model=None
from datetime import date
import holidays
from prophet import Prophet
import pandas as pd
import re
def predict_with_prophet(
    feature: str,
    start_date: str,
    end_date: str,
    models_dir: str = 'artifacts'
) -> pd.DataFrame:
    """
    Make predictions using a saved Prophet model for a specific feature between custom dates.
    
    Args:
        feature (str): The feature/column name to predict
        start_date (str): Start date for prediction (format: 'YYYY-MM-DD')
        end_date (str): End date for prediction (format: 'YYYY-MM-DD')
        models_dir (str): Directory where the model pickle files are stored
    
    Returns:
        pd.DataFrame: DataFrame containing the forecast with columns ['ds', 'yhat', 'yhat_lower', 'yhat_upper', ...]
    """
    global __data_columns
    global __model
    # Sanitize the feature name
    safe_feature = re.sub(r'[<>:"/\\|?*]', '_', feature)
    model_path = f"{models_dir}/prophet_model_{safe_feature.upper()}.pkl"
    
    try:
        # Convert input dates to datetime.
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date)
        
        # Validate date range
        if start_dt >= end_dt:
            raise ValueError("Start date must be before end date")
            
        # Load the saved model
        with open(model_path, "rb") as file:
            __model = pickle.load(file)
        
        # Get the last date from training data
        last_train_date = __model.history['ds'].max()
        
        # Calculate required prediction days
        if start_dt <= last_train_date:
            raise ValueError(f"Start date must be after the last training date ({last_train_date.date()})")
            
        prediction_days = (end_dt - last_train_date).days
        
        # Create future dataframe
        future = __model.make_future_dataframe(periods=prediction_days)
        
        # Make prediction
        forecast = __model.predict(future)
        
        # Filter for the requested date range
        mask = (forecast['ds'] >= start_dt) & (forecast['ds'] <= end_dt)
        forecast = forecast.loc[mask]
        forecast = forecast[['ds', 'yhat']].rename(columns={
                                'ds': 'date',
                                'yhat': 'predicted_value'
                            })
        forecast['date'] = forecast['date'].dt.strftime('%Y-%m-%d')
        forecast['predicted_value'] = forecast['predicted_value'].round(2)
        return forecast.reset_index(drop=True)

        
    except FileNotFoundError:
        raise ValueError(f"No saved Prophet model found for feature '{feature}' at {model_path}")
    except Exception as e:
        raise RuntimeError(f"Error making prediction for feature '{feature}': {str(e)}")










def get_feature_name():
    global __data_columns
    global __model
    
    with open(f"./artifacts/columns.json","r") as f:
        __data_columns=json.load(f)['data_columns']
    return __data_columns     


if __name__ =="__main__":
   

    
             

