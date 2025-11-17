import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@fontsource/inter'; // Import the font

const firebaseConfig = {
  apiKey: "AIzaSyBx7SefNWANAJfqT-QLFnjqdp4paUY_4Jk",
  authDomain: "chat-app-5839a.firebaseapp.com",
  projectId: "chat-app-5839a",
  storageBucket: "chat-app-5839a.firebasestorage.app",
  messagingSenderId: "78899181860",
  appId: "1:78899181860:web:591cb4119c83c63b0f1bb1",
  measurementId: "G-MKV0RKEHLP"
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const FirebaseContext = createContext();

// NEW: Updated Light Theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#673ab7', // A deep purple
    },
    secondary: {
      main: '#ff4081', // A vibrant pink
    },
    background: {
      default: '#f4f7fa', // A very light, soft gray
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // More rounded borders
  },
});

// NEW: Updated Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9575cd', // Lighter purple for dark mode
    },
    secondary: {
      main: '#f06292', // Lighter pink
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e', // A slightly lighter "paper" color
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});


function getDarkModeValue() {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        const cok_val = cookies[i].split('=');
        if (cok_val[0] === 'color') {
            return cok_val[1] === 'dark';
        }
    }
    return false;
}

export const FirebaseProvider = ({ children }) => {
    const [user, loading, error] = useAuthState(auth);
    const [initialized, setInitialized] = useState(false);
    const [darkMode, setDarkMode] = useState(getDarkModeValue());
    useEffect(() => {
        if (!loading) {
            setInitialized(true);
        }
    }, [loading]);

    return (
        <FirebaseContext.Provider value={{ user, auth, firestore, darkMode, setDarkMode }}>
            {initialized ? <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>{children}</ThemeProvider > : <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}><CircularProgress size={100} /></Box>}
        </FirebaseContext.Provider>
    );
};

// Custom hook to use Firebase context
export const useFirebase = () => useContext(FirebaseContext);