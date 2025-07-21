import React from 'react';
import ARViewer from './components/ARViewer';
import ThirdWebProviderWrapper from './providers/ThirdWebProvider';
import './App.css';

function App() {
  return (
    <ThirdWebProviderWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <ARViewer />
      </div>
    </ThirdWebProviderWrapper>
  );
}

export default App;