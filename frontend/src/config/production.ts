export const config = {
  apiBaseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://nafta-backend.onrender.com' 
    : 'http://localhost:5000',
  environment: 'production'
}; 