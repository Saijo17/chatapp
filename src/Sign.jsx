

import React, { useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

import { useFirebase } from "./Initializer";
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  CssBaseline,
  Grid,
  Paper,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import BackgroundVideo from "./assets/background.mp4";
import GoogleLogo from "./assets/google-logo.png";
import { Navigate } from "react-router-dom";
import PopupMsg from "./component/PopupMsg";

const theme = createTheme();

const Sign = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);


  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const { user, auth } = useFirebase();


  useEffect(() => {
    if (user && !auth?.currentUser?.emailVerified && hasInteracted) {
      setModalMessage(
        "A verification email has been sent to your email. Please verify before continuing."
      );
      setOpenModal(true);
    }
  }, [user, auth, hasInteracted]);

  const handleSignUpClick = () => setIsRightPanelActive(true);
  const handleSignInClick = () => setIsRightPanelActive(false);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((err) => {
      setModalMessage(err.message);
      setOpenModal(true);
    });
  };

  const signUpWithEmail = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpEmail,
        signUpPassword
      );

      const currentUser = userCredential.user;

      const response = await fetch("https://picsum.photos/300/300");
      const actualPhotoURL = response.url;

      await updateProfile(currentUser, {
        displayName: signUpName,
        photoURL: actualPhotoURL,
      });

      await sendEmailVerification(currentUser);

      setModalMessage(
        "A verification email has been sent. Please check your inbox."
      );
      setHasInteracted(true);
      setOpenModal(true);
    } catch (err) {
      setModalMessage(err.message);
      setOpenModal(true);
    }
  };

  const signInWithEmail = () => {
    signInWithEmailAndPassword(auth, signInEmail, signInPassword)
      .then((userCredential) => {
        if (!userCredential.user.emailVerified) {
          setModalMessage("Please verify your email before signing in.");
          setOpenModal(true);
        } else {
          setHasInteracted(true);
        }
      })
      .catch((err) => {
        setModalMessage(err.message);
        setOpenModal(true);
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
          position: "relative",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {}
        <video
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        >
          <source src={BackgroundVideo} type="video/mp4" />
        </video>

        <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center" }}>
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              borderRadius: 4,
              width: "100%",
              maxWidth: "600px",
              transition: "0.5s",
              transform: isRightPanelActive ? "scale(1.05)" : "scale(1)",
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Grid container spacing={2}>
              {}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    opacity: isRightPanelActive ? 0 : 1,
                    pointerEvents: isRightPanelActive ? "none" : "auto",
                    transition: "0.5s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    Sign In
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      required
                      id="signin-email"
                      label="Email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      autoComplete="off"
                    />

                    <TextField
                      fullWidth
                      required
                      id="signin-password"
                      label="Password"
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      autoComplete="off"
                      sx={{ mt: 2 }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3 }}
                      onClick={signInWithEmail}
                    >
                      Sign In
                    </Button>

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 2, backgroundColor: "#4caf50" }}
                      onClick={handleSignUpClick}
                    >
                      Switch to Sign Up
                    </Button>

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 2, backgroundColor: "white", color: "black" }}
                      onClick={signInWithGoogle}
                    >
                      <img
                        src={GoogleLogo}
                        alt="Google"
                        style={{ width: "20px", marginRight: "10px" }}
                      />
                      Login with Google
                    </Button>
                  </Box>
                </Box>
              </Grid>

              {/* SIGN UP */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    opacity: isRightPanelActive ? 1 : 0,
                    pointerEvents: isRightPanelActive ? "auto" : "none",
                    transition: "0.5s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    Sign Up
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      required
                      id="signup-name"
                      label="Name"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      autoComplete="off"
                    />

                    <TextField
                      fullWidth
                      required
                      id="signup-email"
                      label="Email"
                      sx={{ mt: 2 }}
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      autoComplete="off"
                    />

                    <TextField
                      fullWidth
                      required
                      id="signup-password"
                      type="password"
                      label="Password"
                      sx={{ mt: 2 }}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      autoComplete="off"
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3 }}
                      onClick={signUpWithEmail}
                    >
                      Create Account
                    </Button>

                    <Button
                      fullWidth
                      sx={{ mt: 2, backgroundColor: "#4caf50" }}
                      variant="contained"
                      onClick={handleSignInClick}
                    >
                      Back to Sign In
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