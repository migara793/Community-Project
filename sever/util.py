import json
import pickle
import numpy as np
__data_columns=None
__model=None
from datetime import date
import holidays


# Create Sri Lanka holiday calendar
Indian_holidays = holidays.country_holidays('IN')

def which_day(year, month, day):
    return date(year, month, day).weekday()


def get_estimated_salse(store,year,month,day,item):
    m1=np.sin(month*(2*np.pi/12))
    m2=np.cos(month*(2*np.pi/12))
    
    weekday=which_day(year,month,day)
    weekend=1 if weekday>=5 else 0
    holidays=1 if Indian_holidays.get(date(year,month,day)) else 0
    return __model.predict([[store,item,month,day,weekend,holidays,m1,m2,weekday]])



def load_saved_artifact():
    print("loading saved artifatcts..start")
    global __data_columns
    global __model
    
    with open("./artifacts/columns.json","r") as f:
        __data_columns=json.load(f)['data_columns']

    with open("./artifacts/xgboost_model.pkl","rb") as f:
        __model=pickle.load(f) 

    print("loading saved artifacts..done")  


if __name__ =="__main__":
    load_saved_artifact()
    print(__data_columns)
    print(get_estimated_salse(1,2015,12,31,1))          

