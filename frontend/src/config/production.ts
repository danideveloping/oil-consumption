// Production Configuration
// Update this file with your backend URL after deployment

export const PRODUCTION_CONFIG = {
  // Backend API URL - Update this after deploying your backend
  // Examples:
  // - For Railway: 'https://your-app.railway.app/oil/api'
  // - For Render: 'https://your-app.onrender.com/oil/api'
  // - For Heroku: 'https://your-app.herokuapp.com/oil/api'
  API_BASE_URL: '/oil/api', // This will work for same-domain deployment
  
  // Frontend URL
  FRONTEND_URL: 'https://shahiniconstuction.com/oil',
  
  // Environment
  NODE_ENV: 'production',
};

// For cross-origin deployment, uncomment and update the line below:
// export const PRODUCTION_CONFIG = {
//   API_BASE_URL: 'https://your-backend-url.com/oil/api',
//   FRONTEND_URL: 'https://shahiniconstuction.com/oil',
//   NODE_ENV: 'production',
// }; 