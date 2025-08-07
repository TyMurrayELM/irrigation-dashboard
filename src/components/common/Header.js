import React from 'react';
import { AlertCircle, Shield } from 'lucide-react';

function Header({ currentUser, onSignIn, onSignOut }) {
  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Irrigation Control Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage our landscaping irrigation schedules
          </p>
        </div>
        <div className="sm:text-right">
          {currentUser ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-sm sm:text-right">
                <div className="flex items-center gap-2 sm:justify-end">
                  <p className="font-medium text-gray-800">{currentUser.name}</p>
                  {currentUser.isAdmin && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs sm:text-sm">{currentUser.email}</p>
              </div>
              {currentUser.picture && (
                <img 
                  src={currentUser.picture} 
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              )}
              <button
                onClick={onSignOut}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-h-[40px]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm min-h-[44px] w-full sm:w-auto"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          )}
        </div>
      </div>
      
      {!currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mt-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs sm:text-sm">
              Please sign in with Google to track changes and updates to irrigation schedules.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default Header;