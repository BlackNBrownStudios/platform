'use client';

import Link from 'next/link';
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSharedAuth } from '../../hooks/useSharedAuth';

const Header: React.FC = () => {
  const { styles, theme } = useTheme();
  const authState = useSharedAuth();
  const isAuthenticated = authState.user !== null;

  return (
    <header
      className="px-4 py-3 shadow-md"
      style={{
        backgroundColor: styles.surface,
        color: styles.text,
      }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold" style={{ color: styles.primary }}>
          History Time
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link
                href="/"
                className="hover:opacity-80 transition-opacity"
                style={{ color: styles.text }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/game"
                className="hover:opacity-80 transition-opacity"
                style={{ color: styles.text }}
              >
                Play
              </Link>
            </li>
            <li>
              <Link
                href="/leaderboard"
                className="hover:opacity-80 transition-opacity"
                style={{ color: styles.text }}
              >
                Leaderboard
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:opacity-80 transition-opacity"
                style={{ color: styles.text }}
              >
                About
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link
                  href="/profile"
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: styles.primary }}
                >
                  Profile
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/settings"
                className="hover:opacity-80 transition-opacity"
                style={{ color: styles.text }}
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
