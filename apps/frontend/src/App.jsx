import React from 'react';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px 32px',
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 13,
        marginTop: 40
      }}>
        SYNOVA AI Insurance Agent Platform • Autonomous Multi-Insurer Aggregation & Dynamic Ranking Engine
      </footer>
    </div>
  );
}
