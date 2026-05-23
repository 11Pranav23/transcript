# 🚀 Simple Deployment Guide: Vercel & Render

This guide explains how to deploy the YouTube Transcript Generator to **Render** (for the Node.js backend) and **Vercel** (for the React frontend).

---

## 🖥️ Part 1: Deploying the Backend on Render

Render is ideal for hosting the Express backend server.

### Steps:
1. **Sign Up / Sign In**: Go to [Render](https://render.com/) and log in using GitHub.
2. **Create New Web Service**:
   - Click the **"New +"** button at the top right and select **"Web Service"**.
   - Connect your GitHub repository containing the project.
3. **Configure Service Settings**:
   - **Name**: `yt-transcript-backend` (or any name you prefer)
   - **Region**: Select the closest region to your users
   - **Branch**: `main` (or whichever branch has your latest code)
   - **Root Directory**: `backend` (⚠️ *Crucial: do not leave empty!*)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Select Plan**: Choose the **Free** instance type.
5. **Add Environment Variables**:
   - Click on the **"Advanced"** button and add these keys:
     - `PORT` = `5000`
     - `NODE_ENV` = `production`
     - `YOUTUBE_API_KEY` = `[Your YouTube API Key]`
     - `OPENAI_API_KEY` = `[Your OpenAI API Key]`
     - `FRONTEND_URL` = `https://your-frontend-app.vercel.app` *(Note: You will update this URL once you deploy to Vercel below).*
6. **Deploy**: Click **"Create Web Service"**.
7. **Copy Backend URL**: Once deployed, copy the service URL provided at the top left of the dashboard (e.g. `https://yt-transcript-backend.onrender.com`).

---

## 🎨 Part 2: Deploying the Frontend on Vercel

Vercel is optimized for React frontends.

### Steps:
1. **Sign Up / Sign In**: Go to [Vercel](https://vercel.com/) and sign in with GitHub.
2. **Import Repository**:
   - Click **"Add New"** > **"Project"**.
   - Select and import your GitHub repository.
3. **Configure Build Settings**:
   - **Framework Preset**: Select **Create React App** (should be auto-detected).
   - **Root Directory**: Click *Edit* and select **`frontend`** (⚠️ *Crucial: do not leave empty!*).
   - **Build and Output Settings**: Keep default settings.
4. **Add Environment Variables**:
   - Expand the **"Environment Variables"** dropdown.
   - Add the following variable:
     - **Key**: `REACT_APP_API_URL`
     - **Value**: `https://your-backend-app.onrender.com` *(Paste the Render URL you copied in Part 1. Do NOT include a trailing slash, and do NOT append `/api` as the frontend code is now updated to handle this automatically).*
5. **Deploy**: Click **"Deploy"**.
6. **Get Frontend URL**: Vercel will build and deploy the React app, then give you a production URL (e.g., `https://yt-transcript-generator.vercel.app`).

---

## 🔄 Part 3: Final Integration (Link Backend to Frontend)

To prevent CORS issues, you need to tell your backend to accept requests from your new frontend URL.

1. Go back to your **Render Dashboard** for the backend service.
2. Navigate to **Environment**.
3. Edit the `FRONTEND_URL` variable:
   - Change it to your new Vercel URL (e.g., `https://yt-transcript-generator.vercel.app`).
4. Save Changes. Render will redeploy the backend with the new configuration.

---

## 🔍 Troubleshooting: "Cannot connect to server" Error

If your deployed website shows:
`❌ Cannot connect to server. Make sure the backend is running on port 5000.`

It means the frontend is trying to connect to a local port instead of your deployed Render URL. Follow these steps to fix it:

### 1. Trigger a New Deploy on Vercel (⚠️ Most Common Cause)
React environment variables are injected **at build time** (when the code is compiled), not at runtime. If you added `REACT_APP_API_URL` in Vercel settings *after* your first deploy, Vercel is still using the old build.
- Go to your project page on Vercel.
- Navigate to the **"Deployments"** tab.
- Click the **three dots (...)** next to your latest deployment.
- Select **"Redeploy"** and click **"Redeploy"** again to build with the new environment variables.

### 2. Check the Environment Variable Names & Formats
- In **Vercel**:
  - Key must be exactly: `REACT_APP_API_URL`
  - Value must be exactly: `https://your-backend-app.onrender.com` (Do **NOT** add a trailing slash `/` and do **NOT** add `/api`).
- In **Render**:
  - Key must be exactly: `FRONTEND_URL`
  - Value must be exactly: `https://your-site-name.vercel.app` (Match your Vercel URL, no trailing slash).

### 3. Render Wake-up Time
Render's free tier puts your backend server to sleep after 15 minutes of inactivity. When you visit the site for the first time, it can take up to 50 seconds to wake up. Wait 1 minute, refresh the page, and try again.

---

🎉 **Done! Your React app and Express backend are now successfully connected and running in production.**
