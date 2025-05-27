import React from 'react';

interface FormProps {
  onSubmit: (data: any) => void;
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ onSubmit, children }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {children}
    </form>
  );
}; 