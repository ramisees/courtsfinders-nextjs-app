# 🤖 Google Gemini API Setup for Courts Finder

## What You Need

Google Gemini is waiting for these specific credentials to be configured:

### 1. Google Gemini API Key
- **What it is**: API key for Google's Gemini AI model
- **Where to get it**: Google AI Studio (https://makersuite.google.com/app/apikey)
- **Environment variable name**: `GOOGLE_GEMINI_API_KEY` or `GEMINI_API_KEY`

### 2. Steps to Get Your Gemini API Key:

#### Step 1: Go to Google AI Studio
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account

#### Step 2: Create API Key
1. Click "Create API Key"
2. Select your Google Cloud project (or create new one)
3. Copy the generated API key (starts with "AIza...")

#### Step 3: Add to Vercel Environment Variables
1. Go to your Vercel dashboard: https://vercel.com
2. Select your `courtsfinders-nextjs-app` project
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `GOOGLE_GEMINI_API_KEY`
   - **Value**: Your API key (paste the "AIza..." key)
   - **Environment**: Production, Preview, Development (select all)

#### Step 4: Add to Local Development
1. In your project folder, edit `.env.local` file
2. Add this line:
   ```
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

### 3. Required Permissions for Gemini API:

Make sure these APIs are enabled in Google Cloud Console:
- **Generative Language API** (for Gemini)
- **AI Platform API** (if using advanced features)

### 4. Usage Limits to Know:

**Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day
- Rate limits may apply

**Paid Tier:**
- Higher rate limits
- Pay-per-use pricing
- Better availability

### 5. Integration Points in Your App:

Your Courts Finder app might use Gemini for:
- **Smart search suggestions** 
- **Court recommendations**
- **Natural language queries**
- **Content generation**
- **Review analysis**

### 6. Common Environment Variable Names:

Different services might expect:
- `GOOGLE_GEMINI_API_KEY`
- `GEMINI_API_KEY` 
- `GOOGLE_AI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`

### 7. Test Your Setup:

After adding the API key, you can test it with:
```bash
npm run dev
```

Then check the browser console for any remaining credential errors.

---

## 🔧 Quick Setup Checklist:

- [ ] Get API key from Google AI Studio
- [ ] Add `GOOGLE_GEMINI_API_KEY` to Vercel environment variables
- [ ] Add same key to local `.env.local` file
- [ ] Redeploy your Vercel app
- [ ] Test functionality

## 🚨 Important Notes:

1. **Keep your API key secure** - never commit it to GitHub
2. **Monitor usage** - watch your API quota
3. **Set up billing** if you need higher limits
4. **Enable required APIs** in Google Cloud Console

---

**Need the exact variable name your app expects?** Check your code for environment variable references to see the specific name format required.
