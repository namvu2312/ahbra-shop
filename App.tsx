import React, { useState } from 'react';
import LoginFormComponent from './components/LoginFormComponent';
import RegisterFormComponent from './components/RegisterFormComponent';

const App: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <main className="w-full max-w-5xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Column - Image and Brand */}
        <div 
          className="hidden md:block md:w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: "url('https://picsum.photos/800/1200?random=1')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-white text-7xl font-bold font-serif tracking-wider">
              AhBra
            </h1>
          </div>
        </div>

        {/* Right Column - Form Area */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          {isLoginView ? (
            <LoginFormComponent onToggleView={toggleView} />
          ) : (
            <RegisterFormComponent onToggleView={toggleView} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
