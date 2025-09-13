# ShareTargetPicker Implementation for LINE Yield

This document provides a comprehensive guide to the ShareTargetPicker implementation for inviting friends in the LINE Yield Mini Dapp (LIFF).

## Overview

The ShareTargetPicker feature allows users to invite friends directly from within the LINE Mini App using LINE's native sharing functionality. This implementation follows the official LINE Mini Dapp documentation and provides multiple ways to invite friends with different message types.

## Features

- ✅ Text message invitations
- ✅ Rich template invitations (carousel)
- ✅ Image + text invitations
- ✅ Personalized messages with user data
- ✅ Multiple recipients support
- ✅ Comprehensive error handling
- ✅ Reusable components and hooks
- ✅ TypeScript support

## Architecture

### Core Components

1. **InviteService** (`src/services/inviteService.ts`)
   - Singleton service for handling all ShareTargetPicker operations
   - Provides methods for different invitation types
   - Handles API availability checks

2. **InviteFriends Component** (`src/components/InviteFriends.tsx`)
   - Full-featured UI component with advanced options
   - Supports all invitation types
   - Includes error handling and success feedback

3. **InviteButton Component** (`src/components/InviteButton.tsx`)
   - Simple, reusable button component
   - Multiple variants and sizes
   - Built-in status messages

4. **useInviteFriends Hook** (`src/hooks/useInviteFriends.ts`)
   - React hook for easy integration
   - Manages state and provides methods
   - Handles loading and error states

## Quick Start

### Basic Usage

```typescript
import { inviteService } from './services/inviteService';

// Simple text invitation
await inviteService.inviteFriendsWithText(
  'Join me on LINE Yield! Earn yield on your Kaia-USDT safely and easily!',
  { isMultiple: false }
);
```

### Using the Hook

```typescript
import { useInviteFriends } from './hooks/useInviteFriends';

function MyComponent() {
  const { inviteFriends, isInviting, error, success } = useInviteFriends();

  const handleInvite = async () => {
    await inviteFriends('Custom invitation message');
  };

  return (
    <button onClick={handleInvite} disabled={isInviting}>
      {isInviting ? 'Inviting...' : 'Invite Friends'}
    </button>
  );
}
```

### Using Components

```typescript
import InviteFriends from './components/InviteFriends';
import InviteButton from './components/InviteButton';

// Full-featured component
<InviteFriends 
  userYield="100" 
  currentAPY={12} 
/>

// Simple button
<InviteButton variant="primary" size="md">
  Invite Friends
</InviteButton>
```

## API Reference

### InviteService Methods

#### `inviteFriendsWithText(message: string, options?: InviteOptions)`
Sends a text message invitation.

**Parameters:**
- `message`: The text message to send
- `options`: Optional configuration
  - `isMultiple`: Allow multiple recipients (default: false)

#### `inviteFriendsWithTemplate(template: any, options?: InviteOptions)`
Sends a rich template invitation.

**Parameters:**
- `template`: LINE template object (carousel, buttons, etc.)
- `options`: Optional configuration

#### `inviteFriendsWithImage(imageUrl: string, previewUrl: string, text?: string, options?: InviteOptions)`
Sends an image with optional text.

**Parameters:**
- `imageUrl`: URL of the full-size image
- `previewUrl`: URL of the preview image
- `text`: Optional text message
- `options`: Optional configuration

#### `isShareTargetPickerAvailable(): boolean`
Checks if ShareTargetPicker API is available.

#### `getDefaultInviteMessage(): string`
Returns the default invitation message.

#### `getPersonalizedInviteMessage(userYield?: string, currentAPY?: number): string`
Returns a personalized message with user's yield data.

#### `createInviteCarouselTemplate(): any`
Creates a carousel template showcasing LINE Yield features.

### InviteOptions Interface

```typescript
interface InviteOptions {
  isMultiple: boolean; // Allow multiple recipients
}
```

### InviteMessage Interface

```typescript
interface InviteMessage {
  type: 'text' | 'image' | 'sticker' | 'template';
  text?: string;
  originalContentUrl?: string;
  previewImageUrl?: string;
  packageId?: string;
  stickerId?: string;
  altText?: string;
  template?: any;
}
```

## Examples

### Example 1: Basic Text Invitation

```typescript
import liff from '@line/liff';

async function inviteFriends() {
  try {
    if (!liff.isApiAvailable('shareTargetPicker')) {
      console.error('ShareTargetPicker not available');
      return;
    }

    const messages = [{
      type: 'text',
      text: 'Join me on LINE Yield! Earn yield on your Kaia-USDT safely and easily!'
    }];

    await liff.shareTargetPicker(messages, { isMultiple: false });
    console.log('Invite sent successfully');
  } catch (error) {
    console.error('Error inviting friends:', error);
  }
}
```

### Example 2: Rich Template Invitation

```typescript
const template = {
  type: 'carousel',
  columns: [
    {
      thumbnailImageUrl: 'https://example.com/image1.jpg',
      title: 'LINE Yield',
      text: 'Earn yield on your Kaia-USDT safely and easily!',
      actions: [
        {
          type: 'uri',
          label: 'Open LINE Yield',
          uri: 'https://line-yield.com'
        }
      ]
    }
  ]
};

await inviteService.inviteFriendsWithTemplate(template);
```

### Example 3: Image Invitation

```typescript
await inviteService.inviteFriendsWithImage(
  'https://example.com/full-image.jpg',
  'https://example.com/preview-image.jpg',
  'Check out LINE Yield! 🚀'
);
```

### Example 4: Multiple Recipients

```typescript
await inviteService.inviteFriendsWithText(
  'Join our LINE Yield community!',
  { isMultiple: true } // Allows groups and multiple friends
);
```

## Integration Guide

### 1. Add to Existing Component

```typescript
import { useInviteFriends } from '../hooks/useInviteFriends';

function Dashboard() {
  const { inviteFriends, isInviting } = useInviteFriends();
  
  return (
    <button onClick={() => inviteFriends()} disabled={isInviting}>
      Invite Friends
    </button>
  );
}
```

### 2. Add to Navigation Menu

```typescript
import InviteButton from '../components/InviteButton';

function Navigation() {
  return (
    <nav>
      <InviteButton variant="outline" size="sm">
        Share
      </InviteButton>
    </nav>
  );
}
```

### 3. Add to Success Page

```typescript
import InviteFriends from '../components/InviteFriends';

function SuccessPage({ userYield, currentAPY }) {
  return (
    <div>
      <h1>Transaction Successful!</h1>
      <InviteFriends 
        userYield={userYield}
        currentAPY={currentAPY}
      />
    </div>
  );
}
```

## Error Handling

The implementation includes comprehensive error handling:

- **API Availability**: Checks if ShareTargetPicker is available
- **LIFF Initialization**: Ensures LIFF is properly initialized
- **Network Errors**: Handles network and API errors
- **User Feedback**: Provides clear error messages to users

### Common Error Scenarios

1. **ShareTargetPicker Not Available**
   ```
   Error: ShareTargetPicker is not available in this environment
   ```
   - Solution: Ensure the app is running in LINE Mini App context

2. **LIFF Not Initialized**
   ```
   Error: LIFF is not initialized yet
   ```
   - Solution: Wait for LIFF initialization to complete

3. **Network Error**
   ```
   Error: Failed to invite friends: Network error
   ```
   - Solution: Check network connection and retry

## Best Practices

### 1. Message Content
- Keep messages concise and engaging
- Include emojis for visual appeal
- Personalize with user data when available
- Include clear call-to-action

### 2. User Experience
- Provide immediate feedback (loading states)
- Show success/error messages
- Allow users to customize messages
- Make the feature easily discoverable

### 3. Performance
- Check API availability before showing UI
- Handle loading states gracefully
- Provide fallback options when unavailable

### 4. Security
- Validate all user inputs
- Sanitize custom messages
- Use HTTPS for all image URLs
- Follow LINE's content guidelines

## Testing

### Manual Testing Checklist

- [ ] ShareTargetPicker is available in LINE Mini App
- [ ] Text invitations work correctly
- [ ] Template invitations display properly
- [ ] Image invitations load images
- [ ] Multiple recipients option works
- [ ] Error handling displays appropriate messages
- [ ] Success feedback is shown
- [ ] Loading states work correctly

### Test Scenarios

1. **Happy Path**: Send invitation successfully
2. **Error Handling**: Test with network issues
3. **Edge Cases**: Empty messages, invalid URLs
4. **User Experience**: Loading states, feedback messages

## Troubleshooting

### Issue: ShareTargetPicker Not Available
**Cause**: App not running in LINE Mini App context
**Solution**: Ensure the app is accessed through LINE

### Issue: Template Not Displaying
**Cause**: Invalid template structure
**Solution**: Validate template against LINE's template specifications

### Issue: Images Not Loading
**Cause**: Invalid image URLs or CORS issues
**Solution**: Use HTTPS URLs and ensure proper CORS headers

### Issue: Multiple Recipients Not Working
**Cause**: isMultiple option not set correctly
**Solution**: Ensure `{ isMultiple: true }` is passed in options

## Resources

- [LINE Mini App Documentation](https://developers.line.biz/en/docs/liff/)
- [ShareTargetPicker API Reference](https://developers.line.biz/en/reference/liff/)
- [LINE Template Messages](https://developers.line.biz/en/reference/messaging-api/#template-messages)
- [LINE Content Guidelines](https://developers.line.biz/en/docs/messaging-api/message-types/)

## Support

For issues or questions regarding this implementation:

1. Check the troubleshooting section above
2. Review LINE's official documentation
3. Test in LINE Mini App environment
4. Check browser console for error messages

---

**Note**: This implementation follows LINE's official guidelines and best practices for ShareTargetPicker usage in Mini Apps.


