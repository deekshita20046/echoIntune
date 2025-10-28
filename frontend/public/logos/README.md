# 🎨 Logo Files Guide
## Where to Place Your Logo Files

---

## 📁 Directory Structure

Place your logo files in this directory (`/frontend/public/logos/`) with these exact names:

```
/frontend/public/logos/
├── icon-light.svg          ← Icon logo for light/white backgrounds
├── icon-dark.svg           ← Icon logo for dark/colored backgrounds
├── logo-full-light.svg     ← Full logo (with text) for light backgrounds
└── logo-full-dark.svg      ← Full logo (with text) for dark backgrounds
```

---

## 📋 File Naming Convention

### Icon Logos (Square, no text)

**`icon-light.svg`**
- For light/white backgrounds (navigation, cards)
- Should have dark/ocean colors for visibility
- Recommended colors: Ocean Deep (#2B5E7B) or Ocean Midnight (#1E3D52)

**`icon-dark.svg`**
- For dark/colored backgrounds (footers, dark sections)
- Should have light colors for visibility
- Recommended colors: Shell White (#FFF9F2) or Seafoam Mist (#EAF6F8)

### Full Logos (With "echo: Intune" text)

**`logo-full-light.svg`**
- For light/white backgrounds
- Text colors:
  - "echo" in Dancing Script: Ocean Deep (#2B5E7B)
  - "Intune" in Satoshi Bold: Ocean Deep (#2B5E7B)
  - Colon ":" in Satoshi Bold: Ocean Deep (#2B5E7B)

**`logo-full-dark.svg`**
- For dark/colored backgrounds
- Text colors:
  - "echo" in Dancing Script: Shell White (#FFF9F2)
  - "Intune" in Satoshi Bold: Shell White (#FFF9F2)
  - Colon ":" in Satoshi Bold: Shell White (#FFF9F2)

---

## 🎨 Design Specifications

### Icon Logos
- **Format:** SVG (vector, scalable)
- **Aspect Ratio:** 1:1 (square)
- **Recommended Size:** 512x512px artboard
- **Padding:** Leave some breathing room around the icon
- **Style:** Should work at small sizes (40x40px)

### Full Logos
- **Format:** SVG (vector, scalable)
- **Aspect Ratio:** Horizontal (width > height)
- **Recommended Size:** 2000px width minimum
- **Typography:**
  - "echo" → Dancing Script, weight 600
  - ": Intune" → Satoshi, weight 700
- **Style:** Clean, readable at various sizes

---

## 📍 Where Each Logo Will Be Used

### `icon-light.svg`
- ✅ Header/Navigation bar
- ✅ Sidebar menu
- ✅ Auth pages (login/register)
- ✅ Favicon (browser tab)
- ✅ Light-themed cards

### `icon-dark.svg`
- ✅ Dark hero sections
- ✅ Colored backgrounds
- ✅ Footer areas
- ✅ Over images or gradients

### `logo-full-light.svg`
- ✅ Landing page hero section (optional)
- ✅ Email templates
- ✅ Marketing materials
- ✅ Light backgrounds

### `logo-full-dark.svg`
- ✅ Dark hero sections with full logo
- ✅ Footer with full branding
- ✅ Dark marketing materials
- ✅ Over colored backgrounds

---

## ✅ Quick Checklist

Before uploading your logos, ensure:

- [ ] All 4 files are in SVG format
- [ ] File names match exactly (case-sensitive):
  - `icon-light.svg`
  - `icon-dark.svg`
  - `logo-full-light.svg`
  - `logo-full-dark.svg`
- [ ] Icon logos are square aspect ratio
- [ ] Full logos use Dancing Script for "echo"
- [ ] Full logos use Satoshi Bold for "Intune"
- [ ] Light versions have dark colors
- [ ] Dark versions have light colors
- [ ] SVG files are optimized (not too large)

---

## 🚀 After Uploading

Once you place the files in this folder:

1. **No code changes needed** - everything is already configured
2. **Refresh your browser** - hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. **Check these pages:**
   - Landing page - logo in navigation
   - Dashboard - logo in header/sidebar
   - Login/Register - logo at top
   - Browser tab - favicon

---

## 🆘 Troubleshooting

**Logo not showing?**
- Check file names match exactly (case-sensitive)
- Make sure files are in `/frontend/public/logos/` directory
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
- Check browser console for errors (F12)

**Logo looks wrong?**
- Verify you used the right variant for the background
- Check SVG colors match the specifications above
- Ensure typography uses correct fonts

**Need to update a logo?**
- Just replace the file with the same name
- Hard refresh browser to see changes

---

## 📞 Current Status

✅ Folder created  
✅ Code updated to use logos  
⏳ **Waiting for you to add the 4 SVG files**

Once you add them, the logos will appear automatically! 🎨✨

