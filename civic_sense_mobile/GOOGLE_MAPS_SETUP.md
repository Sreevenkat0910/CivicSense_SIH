# Google Maps API Setup Instructions

## 🆓 Free Google Maps API Key

Google Maps offers a generous **free tier** for development and small applications:

### **Free Quotas (Monthly)**
- **Maps Load**: 28,000 loads
- **Geocoding**: 40,000 requests  
- **Places**: 1,000 requests
- **Directions**: 2,500 requests

This is more than enough for development and small production apps!

## 🔑 How to Get Your Free API Key

### **Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required but won't charge until you exceed free limits)

### **Step 2: Enable APIs**
1. Go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Maps JavaScript API**
   - **Places API** (optional)
   - **Geocoding API** (optional)

### **Step 3: Create API Key**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key

### **Step 4: Configure Your App**
1. Replace `YOUR_API_KEY_HERE` in `web/index.html` with your actual API key
2. Restart the Flutter app

## 🛡️ Security Best Practices

### **Restrict Your API Key**
1. In Google Cloud Console, click on your API key
2. Under "Application restrictions":
   - Choose "HTTP referrers"
   - Add: `localhost:*` (for development)
   - Add: `yourdomain.com/*` (for production)
3. Under "API restrictions":
   - Choose "Restrict key"
   - Select only the APIs you need

## 🚀 Quick Setup

1. **Get API key** from Google Cloud Console
2. **Replace** `YOUR_API_KEY_HERE` in `web/index.html`
3. **Restart** the Flutter app
4. **Enjoy** your interactive map!

## 📱 What You'll Get

- **Real Google Maps** with satellite/street view
- **Interactive markers** with info windows
- **Zoom and pan** functionality
- **My Location** button
- **Professional map tiles**

The map will work immediately once you add your API key!
