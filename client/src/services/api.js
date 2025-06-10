import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE;

export const getFeatures = async () => {
  try {
    const response = await axios.get(`${API_BASE}/get_feature_names`);
    return response.data.data_columns;
  } catch (error) {
    throw new Error('Failed to load features');
  }
};

export const predictPrice = async (feature, startDate, endDate) => {
  try {
    const formData = new FormData();
    formData.append('feature', feature);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    
    const response = await axios.post(`${API_BASE}/predict_price`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Prediction failed');
  }
};