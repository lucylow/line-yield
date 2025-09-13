import React from 'react';
import { useFormWithUnsavedChanges } from '@/hooks/useFormWithUnsavedChanges';
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  message: '',
};

export const ExampleFormWithUnsavedChanges: React.FC = () => {
  const {
    values,
    updateValue,
    submitForm,
    saveForm,
    isSubmitting,
    hasUnsavedChanges,
    showConfirmDialog,
    confirmLeave,
    cancelLeave,
    handleActionWithConfirmation,
    navigateWithConfirmation,
  } = useFormWithUnsavedChanges({
    initialValues: initialFormData,
    onSubmit: async (formData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', formData);
      alert('Form submitted successfully!');
    },
    onSave: async (formData) => {
      // Simulate auto-save
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Form auto-saved:', formData);
    },
    message: "You have unsaved changes. Are you sure you want to leave?",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const handleSave = async () => {
    await saveForm();
  };

  const handleReset = () => {
    handleActionWithConfirmation(() => {
      // Reset form logic here
      updateValue('name', '');
      updateValue('email', '');
      updateValue('message', '');
    });
  };

  const handleNavigateAway = () => {
    const success = navigateWithConfirmation('/dashboard');
    if (success) {
      console.log('Navigation successful');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Form with Unsaved Changes Protection</CardTitle>
          {hasUnsavedChanges && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              ⚠️ You have unsaved changes
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => updateValue('name', e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => updateValue('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={values.message}
                onChange={(e) => updateValue('message', e.target.value)}
                placeholder="Enter your message"
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSave}
                disabled={isSubmitting || !hasUnsavedChanges}
              >
                Save Draft
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleNavigateAway}
                disabled={isSubmitting}
              >
                Navigate Away
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <UnsavedChangesDialog
        isOpen={showConfirmDialog}
        onClose={cancelLeave}
        onConfirm={confirmLeave}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        confirmText="Leave"
        cancelText="Stay"
      />
    </div>
  );
};

