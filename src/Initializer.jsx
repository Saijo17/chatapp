import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
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


const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#673ab7', 
    },
    secondary: {
      main: '#ff4081', 
    },
    background: {
      default: '#f4f7fa', 
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
    borderRadius: 12,
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9575cd', 
    },
    secondary: {
      main: '#f06292', 
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e', 
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
  const [privateNotification, setPrivateNotification] = useState(null);
  const lastNotIdRef = useRef(null);
  const [unreadMap, setUnreadMap] = useState({});
    useEffect(() => {
        if (!loading) {
            setInitialized(true);
        }
    }, [loading]);

 
    useEffect(() => {
      async function ensureUserDoc() {
        if (user) {
          try {
            await setDoc(doc(firestore, 'users', user.uid), {
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              email: user.email || '',
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          } catch (e) {
            
            console.error('Failed to create/update user doc', e);
          }
        }
      }
      ensureUserDoc();
    }, [user]);

    
    useEffect(() => {
      if (!user) {
        setPrivateNotification(null);
        lastNotIdRef.current = null;
        return;
      }

      const q = query(collection(firestore, 'private_messages'), where('to', '==', user.uid), orderBy('time', 'desc'), limit(1));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0];
          const data = d.data();
          if (data.uid === user.uid) return; 
          if (d.id !== lastNotIdRef.current) {
            lastNotIdRef.current = d.id;
            setPrivateNotification({ id: d.id, fromUid: data.uid, senderName: data.senderName || '', content: data.content || '', threadId: data.threadId || '' });
            // mark unread for that sender
            setUnreadMap(prev => ({ ...prev, [data.uid]: true }));
          }
        }
      }, (err) => console.error('private_messages listener error', err));

      return () => unsub();
    }, [user, firestore]);

    const clearPrivateNotification = () => setPrivateNotification(null);
    const markPrivateAsRead = (fromUid) => {
      setUnreadMap(prev => {
        if (!prev) return {};
        const copy = { ...prev };
        if (copy[fromUid]) delete copy[fromUid];
        return copy;
      });
    };

    return (
      <FirebaseContext.Provider value={{ user, auth, firestore, darkMode, setDarkMode, privateNotification, clearPrivateNotification, unreadMap, markPrivateAsRead }}>
            {initialized ? <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>{children}</ThemeProvider > : <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
            }}><CircularProgress size={100} /></Box>}
        </FirebaseContext.Provider>
    );
};


export const useFirebase = () => useContext(FirebaseContext);