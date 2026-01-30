import axios from 'axios';

const BASE_URL = 'http://localhost:8000/';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get AI-recommended resolution options for active collision alerts
export const getOptions = async () => {
  const response = await api.get('/get_options');
  return response.data;
};

// Execute a chosen resolution action
export const executeOption = async (alertId, trainId, action) => {
  const response = await api.post('/execute_option', {
    alert_id: alertId,
    train_id: trainId,
    action: action
  });
  return response.data;
};

// Get current simulation state (trains, alerts, time)
export const getSimulationState = async () => {
  const response = await api.get('/simulation/state');
  return response.data;
};

// Start the simulation engine
export const startSimulation = async () => {
  const response = await api.post('/simulation/start');
  return response.data;
};

// Stop the simulation engine
export const stopSimulation = async () => {
  const response = await api.post('/simulation/stop');
  return response.data;
};

export default api;