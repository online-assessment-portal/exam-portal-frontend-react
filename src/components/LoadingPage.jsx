import React from 'react';

const LoadingPage = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-5"></div>
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingPage;