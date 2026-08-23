import React from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { UserProvider } from './context/UserContext.jsx';

export default function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}

