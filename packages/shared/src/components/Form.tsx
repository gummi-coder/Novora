import React from 'react';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (data: Record<string, any>) => void;
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  children,
  className = '',
  ...props
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${className}`}
      {...props}
    >
      {children}
    </form>
  );
};

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
  error,
  children
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children || (
        <input
          type={type}
          name={name}
          id={name}
          required={required}
          placeholder={placeholder}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            error ? 'border-red-500' : ''
          }`}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}; 