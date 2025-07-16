import React from 'react';
import { useUser } from '../contexts/UserContext';
import LoginPage from './LoginPage';
import NewWorkoutForm from '../components/NewWorkoutForm';

export default function Home() {
  const { user, logout } = useUser();

  return (
    <div>
      {user ? (
        <>
          <NewWorkoutForm />
        </>
      ) : (
        <LoginPage />
      )}
    </div>
  );
}