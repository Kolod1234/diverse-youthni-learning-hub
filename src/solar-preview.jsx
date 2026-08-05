import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import SolarSystem3D from './components/lesson/SolarSystem3D.jsx';

createRoot(document.getElementById('root')).render(
  <main className="mx-auto max-w-[1500px] bg-white p-6">
    <SolarSystem3D />
  </main>
);
