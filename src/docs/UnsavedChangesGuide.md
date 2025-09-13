# Unsaved Changes Protection Guide

This guide explains how to implement confirmation dialogs when users try to leave without saving their data.

## Overview

The unsaved changes protection system consists of several components and hooks that work together to:

1. **Detect unsaved changes** in forms and user input
2. **Show confirmation dialogs** when users try to leave
3. **Handle browser navigation** (back button, refresh, close tab)
4. **Handle programmatic navigation** (React Router navigation)
5. **Provide customizable messages** and callbacks

## Components

### 1. `useUnsavedChanges` Hook

A low-level hook that handles browser events and provides navigation protection.

```typescript
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

const MyComponent = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { navigateWithConfirmation } = useUnsavedChanges({
    hasUnsavedChanges,
    message: "You have unsaved changes. Are you sure you want to leave?",
    onConfirmLeave: () => {
      // Reset form or perform cleanup
      setHasUnsavedChanges(false);
    },
    onCancelLeave: () => {
      // User cancelled leaving, do nothing
    },
  });

  return (
    <div>
      {/* Your form content */}
      <button onClick={() => navigateWithConfirmation('/dashboard')}>
        Go to Dashboard
      </button>
    </div>
  );
};
```

### 2. `useFormWithUnsavedChanges` Hook

A higher-level hook specifically designed for forms that provides:

- Form state management
- Unsaved changes detection
- Auto-save functionality
- Confirmation dialog handling

```typescript
import { useFormWithUnsavedChanges } from '@/hooks/useFormWithUnsavedChanges';

const MyForm = () => {
  const {
    values,
    updateValue,
    submitForm,
    saveForm,
    hasUnsavedChanges,
    showConfirmDialog,
    confirmLeave,
    cancelLeave,
    handleActionWithConfirmation,
  } = useFormWithUnsavedChanges({
    initialValues: { name: '', email: '' },
    onSubmit: async (values) => {
      // Submit form logic
      await api.submitForm(values);
    },
    onSave: async (values) => {
      // Auto-save logic
      await api.saveDraft(values);
    },
  });

  return (
    <form onSubmit={submitForm}>
      <input
        value={values.name}
        onChange={(e) => updateValue('name', e.target.value)}
      />
      <input
        value={values.email}
        onChange={(e) => updateValue('email', e.target.value)}
      />
      
      <button type="submit">Submit</button>
      <button type="button" onClick={saveForm}>Save Draft</button>
      
      <button 
        type="button" 
        onClick={() => handleActionWithConfirmation(() => {
          // Reset form
          updateValue('name', '');
          updateValue('email', '');
        })}
      >
        Reset
      </button>
    </form>
  );
};
```

### 3. `UnsavedChangesDialog` Component

A reusable dialog component for showing confirmation messages.

```typescript
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';

const MyComponent = () => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      {/* Your content */}
      
      <UnsavedChangesDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={() => {
          // Handle confirmation
          setShowDialog(false);
        }}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        confirmText="Leave"
        cancelText="Stay"
      />
    </>
  );
};
```

### 4. `RouteGuard` Component

A component that wraps your app and provides route-level protection.

```typescript
import { RouteGuard } from '@/components/RouteGuard';

const App = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  return (
    <RouteGuard
      hasUnsavedChanges={hasUnsavedChanges}
      message="You have unsaved changes. Are you sure you want to leave?"
      onConfirmLeave={() => {
        // Handle cleanup when user confirms leaving
        setHasUnsavedChanges(false);
      }}
    >
      {/* Your app content */}
    </RouteGuard>
  );
};
```

## Usage Examples

### Example 1: Simple Form with Unsaved Changes

```typescript
import React from 'react';
import { useFormWithUnsavedChanges } from '@/hooks/useFormWithUnsavedChanges';
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';

const SimpleForm = () => {
  const {
    values,
    updateValue,
    submitForm,
    hasUnsavedChanges,
    showConfirmDialog,
    confirmLeave,
    cancelLeave,
  } = useFormWithUnsavedChanges({
    initialValues: { name: '', email: '' },
    onSubmit: async (values) => {
      console.log('Submitting:', values);
    },
  });

  return (
    <>
      <form onSubmit={submitForm}>
        <input
          value={values.name}
          onChange={(e) => updateValue('name', e.target.value)}
          placeholder="Name"
        />
        <input
          value={values.email}
          onChange={(e) => updateValue('email', e.target.value)}
          placeholder="Email"
        />
        <button type="submit">Submit</button>
      </form>

      <UnsavedChangesDialog
        isOpen={showConfirmDialog}
        onClose={cancelLeave}
        onConfirm={confirmLeave}
      />
    </>
  );
};
```

### Example 2: Transaction Modal with Protection

```typescript
import React from 'react';
import { TransactionModalWithUnsavedChanges } from '@/components/TransactionModalWithUnsavedChanges';

const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (amount: string) => {
    // Handle transaction submission
    console.log('Submitting transaction:', amount);
  };

  return (
    <TransactionModalWithUnsavedChanges
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      type="deposit"
      onSubmit={handleSubmit}
      maxAmount="1000"
      isLoading={false}
      currentApy={0.085}
    />
  );
};
```

### Example 3: App-Level Route Protection

```typescript
import React from 'react';
import { RouteGuard } from '@/components/RouteGuard';
import { useFormWithUnsavedChanges } from '@/hooks/useFormWithUnsavedChanges';

const App = () => {
  const { hasUnsavedChanges } = useFormWithUnsavedChanges({
    initialValues: { data: '' },
    onSubmit: async () => {},
  });

  return (
    <RouteGuard
      hasUnsavedChanges={hasUnsavedChanges}
      message="You have unsaved changes. Are you sure you want to leave?"
    >
      {/* Your app content */}
    </RouteGuard>
  );
};
```

## Customization Options

### Custom Messages

You can customize the confirmation messages:

```typescript
const { navigateWithConfirmation } = useUnsavedChanges({
  hasUnsavedChanges,
  message: "You have entered transaction data. Are you sure you want to leave?",
  onConfirmLeave: () => {
    // Custom cleanup logic
  },
});
```

### Custom Dialog Styling

The `UnsavedChangesDialog` component uses the existing UI components and can be styled:

```typescript
<UnsavedChangesDialog
  isOpen={showDialog}
  onClose={onClose}
  onConfirm={onConfirm}
  title="Custom Title"
  message="Custom message for the user"
  confirmText="Yes, Leave"
  cancelText="No, Stay"
/>
```

### Custom Unsaved Changes Detection

You can provide custom logic for detecting unsaved changes:

```typescript
const { hasUnsavedChanges } = useFormWithUnsavedChanges({
  initialValues: { name: '', email: '' },
  onSubmit: async () => {},
  isDirty: (values, initial) => {
    // Custom logic to determine if form is dirty
    return values.name !== initial.name || values.email !== initial.email;
  },
});
```

## Best Practices

1. **Use the appropriate hook**: Use `useFormWithUnsavedChanges` for forms, `useUnsavedChanges` for custom scenarios.

2. **Provide clear messages**: Make sure your confirmation messages are clear and specific to the context.

3. **Handle cleanup**: Always provide cleanup logic in `onConfirmLeave` to reset form state.

4. **Test edge cases**: Test browser back button, page refresh, and programmatic navigation.

5. **Consider UX**: Don't overuse unsaved changes protection - only use it when data loss would be problematic.

## Browser Compatibility

The unsaved changes protection works with:

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **React Router**: All versions that support hooks

## Limitations

1. **beforeunload event**: Some browsers may not show custom messages in the beforeunload dialog.
2. **Mobile browsers**: Some mobile browsers may not trigger beforeunload events consistently.
3. **SPA navigation**: The protection works best with React Router navigation.

## Troubleshooting

### Common Issues

1. **Dialog not showing**: Make sure `hasUnsavedChanges` is properly set to `true`.
2. **Navigation not working**: Check that you're using `navigateWithConfirmation` for programmatic navigation.
3. **Memory leaks**: Make sure to clean up event listeners in useEffect cleanup.

### Debug Tips

```typescript
// Add logging to debug unsaved changes detection
const { hasUnsavedChanges } = useFormWithUnsavedChanges({
  initialValues: { data: '' },
  onSubmit: async () => {},
  isDirty: (values, initial) => {
    const isDirty = values.data !== initial.data;
    console.log('Form is dirty:', isDirty, { values, initial });
    return isDirty;
  },
});
```

