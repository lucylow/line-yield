import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileFormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  helperText?: string;
  maxLength?: number;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url';
  className?: string;
}

export const MobileFormField: React.FC<MobileFormFieldProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  required = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  helperText,
  maxLength,
  autoComplete,
  inputMode,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getInputClasses = () => {
    return cn(
      'w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      icon && iconPosition === 'left' ? 'pl-12' : '',
      icon && iconPosition === 'right' ? 'pr-12' : '',
      isPassword ? 'pr-12' : '',
      hasError 
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
        : hasSuccess
          ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
          : isFocused
            ? 'border-emerald-500 focus:ring-emerald-500'
            : 'border-gray-200 focus:border-emerald-500'
    );
  };

  const getLabelClasses = () => {
    return cn(
      'block text-sm font-medium mb-2 transition-colors duration-200',
      hasError ? 'text-red-600' : hasSuccess ? 'text-green-600' : 'text-gray-700'
    );
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className={getLabelClasses()}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        {/* Input */}
        <input
          ref={inputRef}
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled || loading}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={getInputClasses()}
        />
        
        {/* Right Icon / Password Toggle */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {loading && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
          
          {isPassword && (
            <button
              type="button"
              onClick={handlePasswordToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={disabled || loading}
            >
              {isPasswordVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          
          {icon && iconPosition === 'right' && !isPassword && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </div>
      
      {/* Helper Text / Error Message */}
      <div className="flex items-start gap-2">
        {hasError && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
        {hasSuccess && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />}
        
        <div className="flex-1">
          {hasError && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {hasSuccess && !hasError && (
            <p className="text-sm text-green-600">Looks good!</p>
          )}
          {helperText && !hasError && !hasSuccess && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface MobileFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  className?: string;
  loading?: boolean;
}

export const MobileForm: React.FC<MobileFormProps> = ({
  children,
  onSubmit,
  className = '',
  loading = false
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      onSubmit(data);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
    >
      {children}
    </form>
  );
};

interface MobileFormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFormActions: React.FC<MobileFormActionsProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={cn('flex gap-3 pt-4', className)}>
      {children}
    </div>
  );
};

export default MobileFormField;
