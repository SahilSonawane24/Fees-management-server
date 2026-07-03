# Deployment Guide for Render.com

## Issues Fixed
- ✅ MongoDB connection pooling (prevents slow responses)
- ✅ Connection timeouts configured (prevents hanging requests)
- ✅ Multiple env variable support (MONGODB_URI, MONGO_URI, DATABASE_URL)

## Step-by-Step Deployment

### 1. Backend Setup on Render

**Create a New Web Service:**
- Push your code to GitHub
- Go to render.com → New → Web Service
- Connect your GitHub repo
- Select the root directory or specify `backend/`

**Environment Variables (Critical):**
Add these in Render's Environment section:

```
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/fees-db
JWT_SECRET=your_strong_random_jwt_secret_key_here_min_32_chars
NODE_ENV=production
PORT=10000
```

**Build & Start Commands:**
- Build: `npm install`
- Start: `npm start` (or `node server.js`)

### 2. Frontend Setup on Render

**Create a New Static Site:**
- Specify the `frontend/` directory
- Build command: `npm install && npm run build`
- Publish directory: `dist`

**Add Backend URL:**
Update `frontend/src/utils/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend.onrender.com';
```

Then add to frontend environment:
```
REACT_APP_API_URL=https://your-backend-service.onrender.com
```

### 3. MongoDB Atlas Setup

1. Go to MongoDB Atlas → Network Access
2. Add Render's IP ranges or Allow from Anywhere (0.0.0.0/0)
3. Create a Database User with strong password
4. Get connection string from "Connect" → "Drivers"
5. Replace username, password, and database name

### 4. Common Issues & Solutions

**Slow Loading / Timeouts:**
- Check MongoDB connection string is correct
- Verify Network Access allows Render IPs
- Check your database queries aren't too large (add pagination)
- Set `NODE_ENV=production` for better performance

**MONGODB_URI Error:**
- Verify env variable exists in Render dashboard
- Restart service after adding variables
- Check for typos in connection string

**Cold Start (First Request Slow):**
- Normal on Render free tier - service spins down after inactivity
- Upgrade to Paid tier to prevent this

**CORS Errors:**
- Verify `frontend/.env` has correct backend URL
- Check backend has CORS enabled

### 5. Testing After Deployment

```bash
# Test backend health
curl https://your-backend-service.onrender.com/

# Test API endpoint
curl https://your-backend-service.onrender.com/api/admin/login

# Check logs
# Go to Render dashboard → Service → Logs
```

### 6. Performance Tips

✅ Keep MongoDB connection pool active: `maxPoolSize: 10`
✅ Set appropriate timeouts: 5s for server selection, 45s for operations
✅ Use indexes on frequently queried fields (rollNo, email, etc.)
✅ Paginate large queries to reduce response time
✅ Add caching headers for static assets
✅ Monitor database connection usage

## Debugging Commands

```bash
# Local test before deployment
NODE_ENV=production npm start

# Check if all env vars are loaded
node -e "console.log(process.env.MONGODB_URI ? '✅ Loaded' : '❌ Missing')"
```

## Render Logs Location
Dashboard → Your Service → Logs tab (shows real-time startup issues)
