'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api/v1';

interface Game {
  id: string;
  attempts: number[];
  isActive: boolean;
  isWon?: boolean;
  score?: number;
  targetNumber?: number;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      checkActiveGame();
    }
  }, []);

  const checkActiveGame = async () => {
    try {
      const response = await axios.get(`${API_URL}/game/active`);
      setGame(response.data.game);
    } catch (error) {
      console.error('Error checking active game:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const data = isLogin ? { email, password } : { email, password, name };
      
      const response = await axios.post(`${API_URL}${endpoint}`, data);
      
      const { tokens } = response.data;
      localStorage.setItem('accessToken', tokens.access.token);
      localStorage.setItem('refreshToken', tokens.refresh.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access.token}`;
      
      setIsAuthenticated(true);
      setMessage(isLogin ? 'Logged in successfully!' : 'Registered successfully!');
      
      // Check for active game
      checkActiveGame();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const startNewGame = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post(`${API_URL}/game/start`);
      setGame(response.data.game);
      setMessage('New game started! Guess a number between 1 and 100.');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const makeGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !guess) return;

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/game/${game.id}/guess`, {
        guess: parseInt(guess),
      });
      
      setGame(response.data.game);
      setMessage(response.data.message);
      setGuess('');
      
      if (response.data.result === 'correct') {
        setTimeout(() => {
          setGame(null);
          setMessage('');
        }, 5000);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to make guess');
    } finally {
      setLoading(false);
    }
  };

  const giveUp = async () => {
    if (!game) return;

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/game/${game.id}/giveup`);
      setMessage(response.data.message);
      setGame(null);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to give up');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setGame(null);
    setMessage('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-3xl font-bold text-center mb-6">Pick a Number</h1>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              {isLogin ? 'Login' : 'Register'}
            </h2>
            
            {!isLogin && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>
          
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-4 text-blue-500 hover:underline"
          >
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
          
          {message && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-center">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pick a Number</h1>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
        
        {!game ? (
          <div className="text-center">
            <p className="mb-6">Ready to test your luck?</p>
            <button
              onClick={startNewGame}
              disabled={loading}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start New Game'}
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4">
              I'm thinking of a number between 1 and 100. Can you guess it?
            </p>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Attempts: {game.attempts.length}
              </p>
              {game.attempts.length > 0 && (
                <p className="text-sm text-gray-600">
                  Previous guesses: {game.attempts.join(', ')}
                </p>
              )}
            </div>
            
            <form onSubmit={makeGuess} className="space-y-4">
              <input
                type="number"
                min="1"
                max="100"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess"
                className="w-full p-2 border rounded"
                disabled={loading || game.isWon}
                required
              />
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading || game.isWon}
                  className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Guessing...' : 'Guess'}
                </button>
                
                <button
                  type="button"
                  onClick={giveUp}
                  disabled={loading || game.isWon}
                  className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Give Up
                </button>
              </div>
            </form>
            
            {game.isWon && (
              <div className="mt-4 text-center">
                <p className="text-green-600 font-bold">Score: {game.score}</p>
                <button
                  onClick={startNewGame}
                  className="mt-2 text-blue-500 hover:underline"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}
        
        {message && (
          <div className={`mt-4 p-2 rounded text-center ${
            message.includes('Congratulations') ? 'bg-green-100 text-green-800' : 'bg-gray-100'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}