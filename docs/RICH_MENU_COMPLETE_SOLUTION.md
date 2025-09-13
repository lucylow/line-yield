# Rich Menu Complete Solution - Kaia Wave Mini Dapp Guidelines

## 🎯 Overview

This document provides a comprehensive solution for implementing LINE Official Account Rich Menus according to Kaia Wave Mini Dapp guidelines. It includes verification, management, and deployment tools for Rich Menus with the required template structure.

## 🎨 Rich Menu Requirements

### Design Specifications
- **Image Dimensions**: Exactly 2500x1686 pixels
- **Image Format**: JPEG or PNG (max 10MB)
- **Template Structure**: 4 specific areas (A, B, C, D)
- **Mandatory Dapp Portal URL**: `https://liff.line.me/2006533014-8gD06D64`

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

## 🔧 Implementation Components

### 1. Rich Menu Verification Service
**File**: `backend/src/services/line-verification-service.ts`

Enhanced the existing verification service to include Rich Menu validation:

```typescript
// Check Rich Menu configuration
const richMenuResult = await this.verifyRichMenu();

// Validate according to Kaia Wave guidelines
const isValidConfiguration = this.validateRichMenuConfiguration(richMenu);
```

**Features:**
- ✅ Verifies Rich Menu exists and is active
- ✅ Validates dimensions (2500x1686)
- ✅ Checks area configuration (A, B, C, D)
- ✅ Ensures Area D links to correct Dapp Portal URL
- ✅ Validates all areas have proper URIs

### 2. Rich Menu Management Service
**File**: `backend/src/services/rich-menu-service.ts`

Complete Rich Menu management functionality:

```typescript
const richMenuService = new RichMenuService(channelAccessToken);

// Create Rich Menu
await richMenuService.createRichMenu(template);

// Upload image
await richMenuService.uploadRichMenuImage(richMenuId, imageBuffer);

// Set as default
await richMenuService.setDefaultRichMenu(richMenuId);

// Complete setup
await richMenuService.setupCompleteRichMenu(template, imageBuffer);
```

**Features:**
- ✅ Generate Kaia Wave compliant Rich Menu configuration
- ✅ Create Rich Menu via LINE Messaging API
- ✅ Upload Rich Menu images
- ✅ Set Rich Menu as default for all users
- ✅ Complete setup workflow (create + upload + set default)
- ✅ List and delete Rich Menus

### 3. Rich Menu API Endpoints
**File**: `backend/src/routes/rich-menu.ts`

RESTful API for Rich Menu management:

```bash
POST /api/rich-menu/create          # Create Rich Menu
POST /api/rich-menu/upload/:id      # Upload image
POST /api/rich-menu/setup-complete  # Complete setup
GET  /api/rich-menu/list           # List Rich Menus
POST /api/rich-menu/set-default/:id # Set as default
DELETE /api/rich-menu/:id          # Delete Rich Menu
GET  /api/rich-menu/template       # Get template configuration
```

**Features:**
- ✅ File upload support with multer
- ✅ Image validation (format, size)
- ✅ Comprehensive error handling
- ✅ Template generation endpoint

### 4. CLI Management Tool
**File**: `backend/scripts/manage-rich-menu.ts`

Command-line interface for Rich Menu management:

```bash
# Generate template
npm run manage-rich-menu -- template

# Create Rich Menu
npm run manage-rich-menu -- create --template template.json

# Upload image
npm run manage-rich-menu -- upload --rich-menu-id ID --image image.jpg

# Complete setup
npm run manage-rich-menu -- setup-complete --template template.json --image image.jpg

# List Rich Menus
npm run manage-rich-menu -- list

# Set as default
npm run manage-rich-menu -- set-default --rich-menu-id ID

# Delete Rich Menu
npm run manage-rich-menu -- delete --rich-menu-id ID
```

**Features:**
- ✅ Template generation
- ✅ Step-by-step workflow
- ✅ Complete automation
- ✅ Verbose logging
- ✅ Error handling and cleanup

### 5. Frontend Integration
**File**: `src/components/LineVerificationStatus.tsx`

Enhanced verification component with Rich Menu status:

```tsx
<LineVerificationStatus 
  autoRefresh={true}
  refreshInterval={30000}
/>
```

**Features:**
- ✅ Real-time Rich Menu status display
- ✅ Configuration validation indicators
- ✅ Error reporting
- ✅ Kaia Wave compliance checking

## 📋 Usage Examples

### 1. Quick Setup (Complete Workflow)

```bash
# Step 1: Generate template
cd backend
npm run manage-rich-menu -- template

# Step 2: Edit template.json with your URLs
# Step 3: Complete setup
npm run manage-rich-menu -- setup-complete \
  --template rich-menu-template.json \
  --image rich-menu-image.jpg
```

### 2. Step-by-Step Setup

```bash
# Step 1: Generate template
npm run manage-rich-menu -- template

# Step 2: Create Rich Menu
npm run manage-rich-menu -- create --template rich-menu-template.json

# Step 3: Upload image
npm run manage-rich-menu -- upload \
  --rich-menu-id RICH_MENU_ID \
  --image rich-menu-image.jpg

# Step 4: Set as default
npm run manage-rich-menu -- set-default --rich-menu-id RICH_MENU_ID
```

### 3. API Usage

```javascript
// Complete setup via API
const formData = new FormData();
formData.append('template', JSON.stringify({
  name: 'LINE Yield Rich Menu',
  miniDappUrl: 'https://liff.line.me/YOUR_LIFF_ID',
  socialChannel1Url: 'https://yourprojectwebsite.com',
  socialChannel2Url: 'https://twitter.com/yourproject'
}));
formData.append('image', imageFile);
formData.append('channelAccessToken', 'YOUR_TOKEN');

const response = await fetch('/api/rich-menu/setup-complete', {
  method: 'POST',
  body: formData
});
```

### 4. Verification

```bash
# Check Rich Menu status
npm run verify-line-setup

# Output includes Rich Menu validation:
# 📋 Rich Menu: Exists
# ✅ Configuration: Valid (Kaia Wave compliant)
# 📝 Name: LINE Yield Rich Menu
# 📏 Size: 2500x1686
# 🎯 Areas: 4
```

## 🎯 Template Configuration

### Required Template Structure

```json
{
  "name": "LINE Yield Rich Menu",
  "chatBarText": "Open Menu",
  "miniDappUrl": "https://liff.line.me/YOUR_LIFF_ID",
  "socialChannel1Url": "https://yourprojectwebsite.com",
  "socialChannel2Url": "https://twitter.com/yourproject",
  "dappPortalUrl": "https://liff.line.me/2006533014-8gD06D64"
}
```

### Generated JSON Configuration

The service automatically generates the correct JSON structure:

```json
{
  "size": { "width": 2500, "height": 1686 },
  "selected": false,
  "name": "LINE Yield Rich Menu",
  "chatBarText": "Open Menu",
  "areas": [
    {
      "bounds": { "x": 0, "y": 0, "width": 1250, "height": 843 },
      "action": {
        "type": "uri",
        "label": "Mini Dapp",
        "uri": "https://liff.line.me/YOUR_LIFF_ID"
      }
    },
    {
      "bounds": { "x": 1250, "y": 0, "width": 625, "height": 843 },
      "action": {
        "type": "uri",
        "label": "Website",
        "uri": "https://yourprojectwebsite.com"
      }
    },
    {
      "bounds": { "x": 1875, "y": 0, "width": 625, "height": 843 },
      "action": {
        "type": "uri",
        "label": "Social",
        "uri": "https://twitter.com/yourproject"
      }
    },
    {
      "bounds": { "x": 0, "y": 843, "width": 2500, "height": 843 },
      "action": {
        "type": "uri",
        "label": "Dapp Portal",
        "uri": "https://liff.line.me/2006533014-8gD06D64"
      }
    }
  ]
}
```

## 🔍 Verification Features

### What Gets Verified

✅ **Rich Menu Exists**: Checks if Rich Menu is created and active  
✅ **Correct Dimensions**: Validates 2500x1686 pixel size  
✅ **Area Configuration**: Verifies all 4 areas are properly configured  
✅ **Dapp Portal URL**: Ensures Area D links to correct URL  
✅ **Valid URIs**: Checks all areas have working URLs  
✅ **Kaia Wave Compliance**: Validates against official guidelines  

### Verification Output

```
📋 Rich Menu: Exists
✅ Configuration: Valid (Kaia Wave compliant)
📝 Name: LINE Yield Rich Menu
📏 Size: 2500x1686
🎯 Areas: 4
```

## 🚨 Important Requirements

### Mandatory Configuration

1. **Image Size**: Must be exactly 2500x1686 pixels
2. **Area D URL**: Must be `https://liff.line.me/2006533014-8gD06D64`
3. **Image Format**: JPEG or PNG only
4. **Template Structure**: Must follow the 4-area layout
5. **Portal Wordmark**: Must include Mini Dapp Icon + Portal Wordmark in Area D

### Compliance Validation

The verification system automatically checks:
- ✅ Dimensions match requirements
- ✅ All areas have correct bounds
- ✅ Area D has mandatory Dapp Portal URL
- ✅ All URIs are valid and accessible
- ✅ Rich Menu is set as default

## 📁 File Structure

```
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── line-verification-service.ts    # Enhanced with Rich Menu verification
│   │   │   └── rich-menu-service.ts           # Rich Menu management service
│   │   └── routes/
│   │       └── rich-menu.ts                   # Rich Menu API endpoints
│   └── scripts/
│       └── manage-rich-menu.ts               # CLI management tool
├── src/
│   └── components/
│       └── LineVerificationStatus.tsx        # Enhanced with Rich Menu status
├── docs/
│   └── RICH_MENU_GUIDE.md                    # Comprehensive documentation
└── RICH_MENU_COMPLETE_SOLUTION.md            # This summary document
```

## 🔗 Integration Points

### With Existing LINE Verification

The Rich Menu verification is seamlessly integrated with the existing LINE verification system:

```typescript
// Official Account verification now includes Rich Menu
const oaResult = await this.verifyOfficialAccount();
// oaResult.info.richMenu contains Rich Menu status
```

### With Frontend Components

```tsx
// Verification component shows Rich Menu status
<LineVerificationStatus 
  autoRefresh={true}
  refreshInterval={30000}
/>
```

### With CLI Tools

```bash
# Rich Menu management integrated with existing scripts
npm run verify-line-setup     # Shows Rich Menu status
npm run manage-rich-menu      # Manages Rich Menus
```

## 📚 Documentation

- **[Rich Menu Guide](docs/RICH_MENU_GUIDE.md)**: Comprehensive setup and usage guide
- **[API Reference](docs/RICH_MENU_GUIDE.md#api-management)**: Complete API documentation
- **[CLI Reference](docs/RICH_MENU_GUIDE.md#cli-tools)**: Command-line tool usage
- **[Troubleshooting](docs/RICH_MENU_GUIDE.md#troubleshooting)**: Common issues and solutions

## 🎉 Benefits

### For Developers
- ✅ **Automated Setup**: Complete Rich Menu setup in one command
- ✅ **Validation**: Automatic compliance checking
- ✅ **Error Handling**: Comprehensive error messages and recovery
- ✅ **CLI Tools**: Easy command-line management
- ✅ **API Integration**: RESTful API for programmatic control

### For Compliance
- ✅ **Kaia Wave Compliant**: Follows official guidelines exactly
- ✅ **Automatic Validation**: Ensures correct configuration
- ✅ **Mandatory URL**: Enforces Dapp Portal URL requirement
- ✅ **Template Structure**: Guarantees correct area layout

### For Maintenance
- ✅ **Status Monitoring**: Real-time Rich Menu status
- ✅ **Easy Updates**: Simple template-based updates
- ✅ **Version Control**: Track configuration changes
- ✅ **Error Recovery**: Automatic cleanup on failures

---

**This complete solution ensures your LINE Official Account Rich Menu is properly configured according to Kaia Wave Mini Dapp guidelines, with automated verification, management tools, and comprehensive documentation.**


