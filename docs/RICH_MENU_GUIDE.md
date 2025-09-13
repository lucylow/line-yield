# LINE Official Account Rich Menu Configuration Guide

This guide provides comprehensive instructions for setting up and managing Rich Menus for your LINE Official Account according to Kaia Wave Mini Dapp guidelines.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Rich Menu Design Requirements](#rich-menu-design-requirements)
3. [Template Structure](#template-structure)
4. [API Management](#api-management)
5. [CLI Tools](#cli-tools)
6. [Frontend Integration](#frontend-integration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## 🎯 Overview

Rich Menus are interactive graphical menus that appear at the bottom of LINE chats, providing users with easy access to your Mini Dapp and other important links. According to Kaia Wave guidelines, Rich Menus must follow a specific template structure.

### Key Requirements

- **Image Dimensions**: Exactly 2500x1686 pixels
- **Image Format**: JPEG or PNG
- **Template Structure**: 4 specific areas (A, B, C, D)
- **Mandatory Dapp Portal URL**: Area D must link to `https://liff.line.me/2006533014-8gD06D64`
- **Image Assets**: Must include Mini Dapp Icon + Portal Wordmark in Area D

## 🎨 Rich Menu Design Requirements

### Template Layout

```
┌─────────────────────────────────────────────────────────┐
│                    Area A (1250x843)                   │
│                  Mini Dapp (LIFF)                      │
├─────────────────┬───────────────────────────────────────┤
│   Area B        │              Area C                   │
│  (625x843)      │            (625x843)                  │
│ Social Channel 1│          Social Channel 2             │
├─────────────────┴───────────────────────────────────────┤
│                    Area D (2500x843)                   │
│                   Dapp Portal                          │
│              (Mini Dapp Icon + Wordmark)               │
└─────────────────────────────────────────────────────────┘
```

### Area Specifications

| Area | Position | Size | Purpose | Required |
|------|----------|------|---------|----------|
| A | Top-left | 1250x843 | Mini Dapp (LIFF) | Yes |
| B | Top-center | 625x843 | Social Channel 1 | Yes |
| C | Top-right | 625x843 | Social Channel 2 | Yes |
| D | Bottom | 2500x843 | Dapp Portal | **Mandatory** |

### Design Guidelines

1. **Clean and Professional**: Use clear, readable fonts and consistent branding
2. **High Contrast**: Ensure text and buttons are easily readable
3. **Brand Consistency**: Match your project's visual identity
4. **Conversion Focused**: Guide users toward your Mini Dapp and Dapp Portal
5. **Mobile Optimized**: Design for mobile viewing experience

## 📝 Template Structure

### JSON Configuration

```json
{
  "size": {
    "width": 2500,
    "height": 1686
  },
  "selected": false,
  "name": "LINE Yield Rich Menu",
  "chatBarText": "Open Menu",
  "areas": [
    {
      "bounds": {
        "x": 0,
        "y": 0,
        "width": 1250,
        "height": 843
      },
      "action": {
        "type": "uri",
        "label": "Mini Dapp",
        "uri": "https://liff.line.me/YOUR_LIFF_ID"
      }
    },
    {
      "bounds": {
        "x": 1250,
        "y": 0,
        "width": 625,
        "height": 843
      },
      "action": {
        "type": "uri",
        "label": "Website",
        "uri": "https://yourprojectwebsite.com"
      }
    },
    {
      "bounds": {
        "x": 1875,
        "y": 0,
        "width": 625,
        "height": 843
      },
      "action": {
        "type": "uri",
        "label": "Social",
        "uri": "https://twitter.com/yourproject"
      }
    },
    {
      "bounds": {
        "x": 0,
        "y": 843,
        "width": 2500,
        "height": 843
      },
      "action": {
        "type": "uri",
        "label": "Dapp Portal",
        "uri": "https://liff.line.me/2006533014-8gD06D64"
      }
    }
  ]
}
```

### Required URLs

- **Area A**: Your Mini Dapp LIFF URL
- **Area B**: Your project website or primary social channel
- **Area C**: Secondary social channel or community link
- **Area D**: **MUST BE** `https://liff.line.me/2006533014-8gD06D64`

## 🔌 API Management

### Create Rich Menu

```bash
curl -X POST http://localhost:3000/api/rich-menu/create \
  -H "Content-Type: application/json" \
  -d '{
    "channelAccessToken": "YOUR_TOKEN",
    "template": {
      "name": "LINE Yield Rich Menu",
      "chatBarText": "Open Menu",
      "miniDappUrl": "https://liff.line.me/YOUR_LIFF_ID",
      "socialChannel1Url": "https://yourprojectwebsite.com",
      "socialChannel2Url": "https://twitter.com/yourproject",
      "dappPortalUrl": "https://liff.line.me/2006533014-8gD06D64"
    }
  }'
```

### Upload Image

```bash
curl -X POST http://localhost:3000/api/rich-menu/upload/RICH_MENU_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@rich-menu-image.jpg" \
  -F "channelAccessToken=YOUR_TOKEN"
```

### Complete Setup

```bash
curl -X POST http://localhost:3000/api/rich-menu/setup-complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "template={\"name\":\"LINE Yield Rich Menu\",\"miniDappUrl\":\"https://liff.line.me/YOUR_LIFF_ID\"}" \
  -F "image=@rich-menu-image.jpg" \
  -F "channelAccessToken=YOUR_TOKEN"
```

### List Rich Menus

```bash
curl "http://localhost:3000/api/rich-menu/list?channelAccessToken=YOUR_TOKEN"
```

## 🛠️ CLI Tools

### Generate Template

```bash
cd backend
npm run manage-rich-menu -- template
```

This creates a `rich-menu-template.json` file with the correct structure.

### Create Rich Menu

```bash
# Generate template first
npm run manage-rich-menu -- template

# Edit the template file with your URLs
# Then create the Rich Menu
npm run manage-rich-menu -- create --template rich-menu-template.json
```

### Upload Image

```bash
npm run manage-rich-menu -- upload \
  --rich-menu-id RICH_MENU_ID \
  --image rich-menu-image.jpg
```

### Complete Setup

```bash
npm run manage-rich-menu -- setup-complete \
  --template rich-menu-template.json \
  --image rich-menu-image.jpg
```

### List Rich Menus

```bash
npm run manage-rich-menu -- list
```

### Set as Default

```bash
npm run manage-rich-menu -- set-default --rich-menu-id RICH_MENU_ID
```

### Delete Rich Menu

```bash
npm run manage-rich-menu -- delete --rich-menu-id RICH_MENU_ID
```

## 🎨 Frontend Integration

### Rich Menu Status Component

The verification system automatically checks Rich Menu configuration:

```tsx
import { LineVerificationStatus } from '@/components/LineVerificationStatus';

function Dashboard() {
  return (
    <LineVerificationStatus 
      autoRefresh={true}
      refreshInterval={30000}
    />
  );
}
```

The component will show:
- ✅ Rich Menu exists and is configured correctly
- ⚠️ Rich Menu exists but configuration issues
- ❌ No Rich Menu found

### Rich Menu Management API

```typescript
// Create Rich Menu
const response = await fetch('/api/rich-menu/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    channelAccessToken: 'YOUR_TOKEN',
    template: {
      name: 'LINE Yield Rich Menu',
      miniDappUrl: 'https://liff.line.me/YOUR_LIFF_ID',
      socialChannel1Url: 'https://yourprojectwebsite.com',
      socialChannel2Url: 'https://twitter.com/yourproject'
    }
  })
});
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Image dimensions must be 2500x1686"

**Cause:** Image size doesn't match requirements
**Solution:**
- Resize your image to exactly 2500x1686 pixels
- Use image editing software like Photoshop, GIMP, or online tools
- Maintain aspect ratio during resizing

#### 2. "Area D URI mismatch"

**Cause:** Area D doesn't link to the correct Dapp Portal URL
**Solution:**
- Ensure Area D links to `https://liff.line.me/2006533014-8gD06D64`
- Check your template configuration
- Verify the JSON structure is correct

#### 3. "Rich Menu not showing in LINE"

**Cause:** Rich Menu not set as default
**Solution:**
- Use `--set-default` command or API endpoint
- Verify the Rich Menu is properly linked to your Official Account
- Check if image was uploaded successfully

#### 4. "Upload failed: Invalid image format"

**Cause:** Unsupported image format
**Solution:**
- Use JPEG or PNG format only
- Ensure file size is under 10MB
- Check image file is not corrupted

#### 5. "Rich Menu areas not clickable"

**Cause:** Incorrect bounds configuration
**Solution:**
- Verify bounds match the template exactly
- Check that all areas have valid URIs
- Ensure no overlapping areas

### Debug Mode

Enable verbose logging:

```bash
npm run manage-rich-menu -- list --verbose
```

Or check the verification status:

```bash
npm run verify-line-setup -- --verbose
```

## 📚 Best Practices

### Design

1. **Keep it Simple**: Don't overcrowd the menu with too many elements
2. **Clear Call-to-Actions**: Use descriptive labels for each area
3. **Visual Hierarchy**: Make the most important areas (Mini Dapp, Dapp Portal) stand out
4. **Consistent Branding**: Use your project's colors, fonts, and logo
5. **Test on Mobile**: Ensure the menu looks good on mobile devices

### Technical

1. **Validate Configuration**: Always verify Rich Menu configuration before deployment
2. **Test All Links**: Ensure all URLs are accessible and working
3. **Monitor Performance**: Check Rich Menu analytics in LINE Developers Console
4. **Backup Configuration**: Keep copies of your Rich Menu JSON and images
5. **Version Control**: Track changes to your Rich Menu configuration

### Content

1. **Localized Content**: Consider creating versions for different languages
2. **Seasonal Updates**: Update Rich Menu for special events or promotions
3. **User Feedback**: Monitor user engagement and adjust accordingly
4. **Clear Messaging**: Use concise, action-oriented text
5. **Consistent Updates**: Keep social media links and website URLs current

## 🔗 Additional Resources

- [LINE Rich Menu API Documentation](https://developers.line.biz/en/reference/messaging-api/#rich-menu)
- [Rich Menu Design Guidelines](https://developers.line.biz/en/docs/messaging-api/using-rich-menus/)
- [Kaia Wave Mini Dapp Documentation](https://docs.dappportal.io/mini-dapp/line-integration/official-account)
- [LINE Developers Console](https://developers.line.biz/console/)

## 📞 Support

If you encounter issues:

1. **Check verification script output** for specific error messages
2. **Validate image dimensions** and format requirements
3. **Verify template configuration** matches the required structure
4. **Test all URLs** to ensure they're accessible
5. **Check LINE API status** for any service outages
6. **Create an issue** in the project repository

---

**Remember**: The Dapp Portal URL (`https://liff.line.me/2006533014-8gD06D64`) is mandatory in Area D and cannot be changed. This ensures compliance with Kaia Wave Mini Dapp guidelines.


