# 🚀 Push echo:Intune to GitHub

## Step 1: Create a GitHub Repository

1. Go to **https://github.com/new**
2. Fill in the details:
   - **Repository name:** `echoIntune` (or `echo-intune`)
   - **Description:** Mental wellness tracking app with AI-powered insights
   - **Visibility:** Choose Public or Private
   - ⚠️ **IMPORTANT:** Do NOT initialize with README, .gitignore, or license
3. Click **"Create repository"**

---

## Step 2: Connect Local Repo to GitHub

After creating the repo, GitHub will show you commands. Use these:

```bash
# Change branch from 'master' to 'main' (GitHub standard)
git branch -M main

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/echoIntune.git

# Push your code
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username!

---

## Step 3: Verify the Push

After pushing, go to your repository on GitHub:
```
https://github.com/YOUR_USERNAME/echoIntune
```

You should see:
- ✅ All your files and folders
- ✅ README.md displayed on the homepage
- ✅ 148 files committed
- ✅ No .env files (secure!)

---

## Quick Copy-Paste Commands

```bash
# Navigate to project
cd /Users/deekshita/Desktop/b-uni/echoIntune

# Rename branch to 'main'
git branch -M main

# Add remote (REPLACE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/echoIntune.git

# Push to GitHub
git push -u origin main
```

---

## Security Checklist Before Pushing ✅

- ✅ `.gitignore` is configured
- ✅ `.env` files are ignored
- ✅ `.env.example` files are included (safe templates)
- ✅ No API keys or passwords in code
- ✅ Database credentials use environment variables
- ✅ JWT secrets use environment variables

**All secure! Safe to push!** 🔒

---

## After Pushing

### Update README.md with your repo URL
Once pushed, you might want to update the README with:
- Your live demo link (if deployed)
- Your GitHub repository link
- Deployment badges

### Set Up GitHub Secrets (for CI/CD later)
If you plan to use GitHub Actions for deployment:
- Go to Settings → Secrets and variables → Actions
- Add your environment variables as secrets

---

## Troubleshooting

### "Permission denied (publickey)"
You need to set up SSH keys or use HTTPS with a Personal Access Token.

**Option 1 - HTTPS with Token:**
```bash
# Use this format:
git remote add origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/echoIntune.git
```

**Option 2 - SSH:**
```bash
# Set up SSH key first: https://docs.github.com/en/authentication
git remote add origin git@github.com:YOUR_USERNAME/echoIntune.git
```

### "Repository already exists"
If you see this error:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/echoIntune.git
```

---

## 🎉 You're Done!

Your code is now on GitHub, safe and version-controlled!

**Next Steps:**
1. Share your repository link
2. Deploy to production (see DEPLOYMENT_GUIDE.md)
3. Continue developing with Git workflow

---

**Happy Coding!** 🌊
