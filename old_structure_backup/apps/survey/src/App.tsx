import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Surveys from './pages/Surveys';
import CreateSurvey from './pages/CreateSurvey';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="surveys/create" element={<CreateSurvey />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App; 