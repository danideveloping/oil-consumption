# Oil Tank Management System

A comprehensive web application for managing oil tanks, machinery, and consumption tracking with real-time data visualization and reporting.

## Features

- **User Authentication**: Secure login and registration system with role-based access control
- **Machinery Management**: Track and manage industrial machinery
- **Location Management**: Organize machinery by places/locations
- **Oil Consumption Tracking**: Record daily oil usage with detailed analytics
- **Data Visualization**: Daily and monthly consumption reports
- **Responsive Design**: Modern UI that works on desktop and mobile
- **Real-time Dashboard**: Overview of key metrics and recent activities
- **Role-Based Access Control**: Superadmin and user roles with different permission levels

## User Roles

### SuperAdmin
- **Full Access**: Can view all historical data and reports
- **Complete Analytics**: Access to daily and monthly summaries for any time period
- **Data Management**: Can view and manage all oil consumption records
- **User Management**: Full administrative privileges

### Normal User
- **Current Month Only**: Restricted to viewing current month data
- **Limited Reporting**: Cannot access historical monthly summaries
- **Basic Operations**: Can add oil entries and view current month consumption
- **No Historical Data**: Cannot view data from previous months

## Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL database
- JWT authentication
- RESTful API architecture

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Hook Form for form management
- Lucide React for icons

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nafta
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install all dependencies (backend and frontend)
   npm run install:all
   ```

3. **Environment Setup**
   Create a `.env` file in the `backend` directory with your PostgreSQL configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # PostgreSQL Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=oil_tank_management
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   ```

4. **Database Setup**
   - Make sure PostgreSQL is running and accessible
   - Create a database named `oil_tank_management` in pgAdmin (or use your existing database)
   - Update the `.env` file with your PostgreSQL credentials
   
   Initialize the database tables:
   ```bash
   cd backend
   npm run init-db
   cd ..
   ```

5. **Create SuperAdmin User**
   Create a superadmin user to access all features:
   ```bash
   cd backend
   npm run create-superadmin
   cd ..
   ```
   Follow the prompts to enter username, email, and password for the superadmin account.

6. **Start the Application**
   ```bash
   # Start both backend and frontend concurrently
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Backend (http://localhost:5000)
   npm run dev:backend

   # Terminal 2 - Frontend (http://localhost:3000)
   npm run dev:frontend
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/oil/api

## Usage

### Getting Started

1. **Register a New Account**
   - Navigate to http://localhost:3000
   - Click "Sign up" to create a new account
   - Fill in username, email, and password

2. **Add Places**
   - Go to "Places" in the sidebar
   - Add locations where your machinery is located
   - Include location details and descriptions

3. **Add Machinery**
   - Go to "Machinery" in the sidebar
   - Add your industrial equipment
   - Assign machinery to specific places
   - Set capacity and type information

4. **Record Oil Data**
   - Go to "Data & Reports"
   - Add daily oil consumption records
   - Track different types: consumption, refill, maintenance
   - View daily and monthly summaries

### API Endpoints

#### Authentication
- `POST /oil/api/auth/login` - User login
- `POST /oil/api/auth/register` - User registration

#### Places
- `GET /oil/api/places` - Get all places
- `POST /oil/api/places` - Create new place
- `PUT /oil/api/places/:id` - Update place
- `DELETE /oil/api/places/:id` - Delete place

#### Machinery
- `GET /oil/api/machinery` - Get all machinery
- `POST /oil/api/machinery` - Create new machinery
- `PUT /oil/api/machinery/:id` - Update machinery
- `DELETE /oil/api/machinery/:id` - Delete machinery

#### Oil Data
- `GET /oil/api/data` - Get oil consumption data (with pagination)
- `GET /oil/api/data/daily` - Get daily summaries
- `GET /oil/api/data/monthly` - Get monthly summaries
- `POST /oil/api/data` - Create new oil data entry
- `PUT /oil/api/data/:id` - Update oil data entry
- `DELETE /oil/api/data/:id` - Delete oil data entry

## Database Schema

### Users
- id (SERIAL PRIMARY KEY), username (VARCHAR), email (VARCHAR), password (VARCHAR), role (VARCHAR), created_at (TIMESTAMP)

### Places
- id (SERIAL PRIMARY KEY), name (VARCHAR), location (VARCHAR), description (TEXT), created_at (TIMESTAMP)

### Machinery
- id (SERIAL PRIMARY KEY), name (VARCHAR), type (VARCHAR), place_id (INTEGER REFERENCES places), capacity (DECIMAL), description (TEXT), created_at (TIMESTAMP)

### Oil Data
- id (SERIAL PRIMARY KEY), machinery_id (INTEGER REFERENCES machinery), date (DATE), litres (DECIMAL), type (VARCHAR), notes (TEXT), created_at (TIMESTAMP)

## Development

### Project Structure
```
nafta/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── database/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── main.tsx
│   └── public/
└── package.json
```

### Available Scripts

```bash
# Development
npm run dev                 # Start both backend and frontend
npm run dev:backend         # Start backend only
npm run dev:frontend        # Start frontend only

# Production
npm run build              # Build frontend for production
npm start                  # Start production server

# Database
cd backend && npm run init-db  # Initialize database tables
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the repository. 