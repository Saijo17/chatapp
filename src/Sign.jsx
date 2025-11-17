import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { useFirebase } from './Initializer';
import { Button, TextField, Container, Typography, Box, CssBaseline, Grid, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BackgroundVideo from './assets/background.mp4';
import GoogleLogo from './assets/google-logo.png';
import { Navigate } from 'react-router-dom';
import PopupMsg from './component/PopupMsg';

// Using a default theme here, but it will be overridden by the Provider's theme
const theme = createTheme();

const Sign = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const { user, auth } = useFirebase();

  useEffect(() => {
    if (user && !auth?.currentUser?.emailVerified && hasInteracted) {
      setModalMessage('A verification email has been sent to your email address. Please check your inbox and verify your email to continue.');
      setOpenModal(true);
    }
  }, [user, auth, hasInteracted]);

  const handleSignUpClick = () => {
    setIsRightPanelActive(true);
  };

  const handleSignInClick = () => {
    setIsRightPanelActive(false);
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const signUpWithEmail = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const response = await fetch("https://picsum.photos/300/300");
      const actualPhotoURL = response.url; 

      await updateProfile(user, {
        displayName: name,
        photoURL: actualPhotoURL,
      });

      await sendEmailVerification(user);
      setModalMessage('A verification email has been sent to your email address. Please check your inbox and verify your email to continue.');
      setHasInteracted(true);
      setOpenModal(true);
    } catch (error) {
      setModalMessage(error.message);
      setOpenModal(true);
      console.error("Error signing up:", error.message);
    }
  };

  const signInWithEmail = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        if (!userCredential.user.emailVerified) {
          setModalMessage('Please verify your email address before proceeding.');
          setOpenModal(true);
        } else {
          setHasInteracted(true);
        }
      })
      .catch((error) => {
        setModalMessage(error.message);
        setOpenModal(true);
        console.error("Error signing in:", error.message);
      });
  };

  if (user && auth?.currentUser?.emailVerified) {
    return <Navigate to="/chat" />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <video
          autoPlay
          loop
          muted
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
          }}
        >
          <source src={BackgroundVideo} type="video/mp4" />
        </video>
        <Container component="main" maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* UPDATED: Glassmorphism Panel Style */}
          <Paper 
            elevation={6} 
            sx={{ 
              padding: 4, 
              borderRadius: 4, // Larger border radius
              width: '100%', 
              maxWidth: '600px', 
              transition: 'transform 0.5s ease-in-out', 
              transform: isRightPanelActive ? 'scale(1.05)' : 'scale(1)', 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', // More transparent
              backdropFilter: 'blur(15px)', // Increased blur
              border: '1px solid rgba(255, 255, 255, 0.2)', // Subtle border
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'opacity 0.5s ease-in-out',
                    opacity: isRightPanelActive ? 0 : 1,
                    pointerEvents: isRightPanelActive ? 'none' : 'auto',
                  }}
                >
                  <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
                    Sign In
                  </Typography>
                  <Box component="form" noValidate sx={{ mt: 1 }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete='off'
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{
                        style: { backgroundColor: 'transparent' },
                      }}
                      InputLabelProps={{
                        style: { fontWeight: 'bold' },
                      }}
                      sx={{
                        '& .MuiAutocomplete-popupIndicator': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-clearIndicator': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-inputRoot': {
                          backgroundColor: 'transparent !important',
                        },
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete='off'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        style: { backgroundColor: 'transparent' },
                      }}
                      InputLabelProps={{
                        style: { fontWeight: 'bold' },
                      }}
                      sx={{
                        '& .MuiAutocomplete-popupIndicator': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-clearIndicator': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-inputRoot': {
                          backgroundColor: 'transparent !important',
                        },
                      }}
                    />
                    {/* UPDATED: Gradient Button Style */}
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 3,
                        mb: 2,
                        fontWeight: 'bold',
                        color: '#fff',
                        background: 'linear-gradient(45deg, #673ab7 30%, #ff4081 90%)',
                        boxShadow: '0 3px 5px 2px rgba(103, 58, 183, .3)',
                        borderRadius: '20px',
                        padding: '10px 20px',
                      }}
                      onClick={signInWithEmail}
                    >
                      Sign In
                    </Button>

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 3,
                        mb: 2,
                        fontWeight: 'bold',
                        backgroundColor: '#4caf50',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: '#388e3c',
                        },
                        borderRadius: '20px',
                        padding: '10px 20px',
                        boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                      }}
                      onClick={handleSignUpClick}
                    >
                      Sign Up
                    </Button>

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 3,
                        mb: 2,
                        fontWeight: '',
                        backgroundColor: 'white',
                        color: 'black',
                        '&:hover': {
                          backgroundColor: 'white',
                        },
                        borderRadius: '20px',
                        padding: '10px 20px',
                        boxShadow: '0 3px 5px 2px rgba(219, 68, 55, .3)',
                      }}
                      onClick={signInWithGoogle}
                    >
                      <img src={GoogleLogo} alt="Google logo" style={{ width: '20px', marginRight: '10px' }} />
                      Sign In/Up by Google
                    </Button>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'opacity 0.5s ease-in-out',
                    opacity: isRightPanelActive ? 1 : 0,
                    pointerEvents: isRightPanelActive ? 'auto' : 'none',
                  }}
                >
                  <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
                    Sign Up
                  </Typography>
                  <Box component="form" noValidate sx={{ mt: 1 }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="name"
                      label="Name"
                      name="name"
                      autoComplete='off'
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                      InputProps={{
                        style: { backgroundColor: 'transparent' },
                      }}
                      InputLabelProps={{
                        style: { fontWeight: 'bold' },
                      }}
                      sx={{
                        '& .MuiAutocomplete-popupIndicator': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-clearIndicator': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-inputRoot': {
                          backgroundColor: 'transparent !important',
                        },
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete='off'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{
                        style: { backgroundColor: 'transparent' },
                      }}
                      InputLabelProps={{
                        style: { fontWeight: 'bold' },
                      }}
                      sx={{
                        '& .MuiAutocomplete-popupIndicator': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-clearIndicator': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-inputRoot': {
                          backgroundColor: 'transparent !important',
                        },
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete='off'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        style: { backgroundColor: 'transparent' },
                      }}
InputLabelProps={{
                        style: { fontWeight: 'bold' },
                      }}
                      sx={{
                        '& .MuiAutocomplete-popupIndicator': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-clearIndicator': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiAutocomplete-inputRoot': {
                          backgroundColor: 'transparent !important',
                        },
                      }}
                    />
                    {/* UPDATED: Gradient Button Style */}
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 3,
                        mb: 2,
                        fontWeight: 'bold',
                        color: '#fff',
                        background: 'linear-gradient(45deg, #673ab7 30%, #ff4081 90%)',
                        boxShadow: '0 3px 5px 2px rgba(103, 58, 183, .3)',
                        borderRadius: '20px',
                        padding: '10px 20px',
                      }}
                      onClick={signUpWithEmail}
                    >
                      Sign Up
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 3,
                        mb: 2,
                        fontWeight: 'bold',
                        backgroundColor: '#4caf50',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: '#388e3c',
                        },
                        borderRadius: '20px',
                        padding: '10px 20px',
                        boxShadow: '0 3px 5px 2px rgba(63, 81, 181, .3)',
                      }}
                      onClick={handleSignInClick}
                    >
                      Sign In
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>

        <PopupMsg
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setHasInteracted(false);
          }}
          message={modalMessage}
        />
      </Box>
    </ThemeProvider>
  );
};

export default Sign;