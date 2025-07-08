'use client';

import React from 'react';

const CardManagerTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Card Manager Test Page</h1>

        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-800 mb-3">🚧 Migration In Progress</h2>
          <p className="text-yellow-700 mb-4">
            This page is temporarily simplified during the monorepo migration. The CardManager
            component will be restored once the workspace packages are fully integrated.
          </p>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sample Historical Events</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">World War II Begins</h3>
              <p className="text-sm text-gray-600">1939</p>
              <p className="text-sm mt-1">Germany invades Poland, starting World War II</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Moon Landing</h3>
              <p className="text-sm text-gray-600">1969</p>
              <p className="text-sm mt-1">Apollo 11 successfully lands on the moon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardManagerTestPage;
