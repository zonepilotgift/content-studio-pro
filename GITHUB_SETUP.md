# GitHub Setup Guide for Content Studio Pro

## Step 1: Upload to GitHub

1. **Go to GitHub** (https://github.com)
2. **Click the "+" icon** in the top right corner
3. **Select "New repository"**
4. **Fill in the details:**
   - Repository name: `content-studio-pro` (or any name you prefer)
   - Description: "Complete content creation platform with 8 integrated tools"
   - Choose "Public" (required for GitHub Pages)
   - ✅ Check "Add a README file"
5. **Click "Create repository"**

## Step 2: Upload Your Files

1. **Click "Add file"** → **"Upload files"**
2. **Drag and drop** all the files from the zip:
   - studio-index.html
   - studio-script.js
   - studio-styles.css
   - enhanced_backend.py
   - requirements.txt
   - STUDIO_README.md
   - MOBILE_TESTING_GUIDE.md
   - .gitignore
3. **Scroll down** and click **"Commit changes"**

## Step 3: Enable GitHub Pages

1. **Go to your repository settings:**
   - Click the "Settings" tab at the top
2. **Find "Pages" in the left sidebar** (under "Code and automation")
3. **Configure GitHub Pages:**
   - Source: Select "Deploy from a branch"
   - Branch: Select "main" (or "master")
   - Folder: Select "/ (root)"
4. **Click "Save"**
5. **Wait 1-2 minutes** for deployment

## Step 4: Access Your Live Site

1. **Go back to the "Pages" section** in Settings
2. **You'll see a message:** "Your site is live at https://yourusername.github.io/content-studio-pro/"
3. **Click the URL** to visit your live site!

## Step 5: Rename index.html (IMPORTANT!)

GitHub Pages looks for a file named `index.html`, but we named ours `studio-index.html`.

**Option A: Rename via GitHub Web Interface**
1. Click on `studio-index.html` in your repository
2. Click the pencil icon (Edit)
3. Change the filename at the top from `studio-index.html` to `index.html`
4. Scroll down and click "Commit changes"

**Option B: Rename Locally (if using Git)**
```bash
git mv studio-index.html index.html
git commit -m "Rename to index.html for GitHub Pages"
git push
```

## Step 6: Update Script and CSS References

After renaming to `index.html`, you need to update the file references:

1. **Edit index.html:**
   - Find: `<link rel="stylesheet" href="studio-styles.css">`
   - Change to: `<link rel="stylesheet" href="styles.css">`
   - Find: `<script src="studio-script.js"></script>`
   - Change to: `<script src="script.js"></script>`

2. **Rename the CSS file:**
   - Rename `studio-styles.css` to `styles.css`

3. **Rename the JS file:**
   - Rename `studio-script.js` to `script.js`

## Step 7: Wait and Refresh

1. **Wait 1-2 minutes** for GitHub Pages to rebuild
2. **Visit your URL** again
3. **Your Content Studio Pro is now live!** 🎉

## Troubleshooting

### Site Not Loading?
- Make sure the repository is **Public**
- Check that GitHub Pages is enabled in Settings
- Wait a few minutes - deployment takes time
- Clear your browser cache

### 404 Error?
- Make sure you renamed `studio-index.html` to `index.html`
- Check that all files are in the root directory (not in a subfolder)

### Styling Not Working?
- Make sure CSS and JS filenames match the references in index.html
- Check browser console for errors (F12)

### Backend Features Not Working?
- GitHub Pages only hosts static files (HTML, CSS, JS)
- For backend features (real-time search), you'll need to:
  - Deploy the Python backend separately (Heroku, Railway, etc.)
  - Update the API URL in the JavaScript file
  - Or use the tool without backend (templates only)

## Using Without Backend

The tool works great without the backend! You'll have:
- ✅ All 8 tools functional
- ✅ Template-based content generation
- ✅ SEO analysis
- ✅ Multi-platform formatting
- ✅ Hashtag generation
- ✅ Content calendar
- ✅ Analytics dashboard
- ❌ Real-time web search (requires backend)

## Optional: Custom Domain

Want to use your own domain (like contentpro.com)?

1. **Buy a domain** (Namecheap, GoDaddy, etc.)
2. **In GitHub Settings → Pages:**
   - Enter your custom domain
   - Click "Save"
3. **In your domain registrar:**
   - Add a CNAME record pointing to `yourusername.github.io`
4. **Wait for DNS propagation** (up to 24 hours)

## Need Help?

- GitHub Pages Documentation: https://docs.github.com/en/pages
- GitHub Community: https://github.community/

---

**Your live URL will be:**
`https://yourusername.github.io/repository-name/`

Replace `yourusername` with your GitHub username and `repository-name` with your repo name.

Enjoy your Content Studio Pro! 🚀