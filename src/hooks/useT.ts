// Simple translation hook for internationalization
// This is a placeholder implementation - replace with your i18n library of choice

export function useT() {
  return (key: string, fallback?: string) => {
    // In a real implementation, this would look up translations
    // For now, return the key or fallback
    return fallback || key;
  };
}
