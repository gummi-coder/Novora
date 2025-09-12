import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data generators
export const generateUser = () => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const generatePost = (authorId: string) => ({
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  published: true,
  authorId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const generateComment = (authorId: string, postId: string) => ({
  id: '1',
  content: 'Test comment',
  authorId,
  postId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}); 