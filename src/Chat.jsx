import { Navigate } from 'react-router-dom';
import Heading from './component/Heading';
import Foot from './component/Foot';
import Body from './component/Body';
import Box from '@mui/material/Box';
import { collection, orderBy, query, limit, addDoc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useFirebase } from './Initializer';
import { CssBaseline } from '@mui/material';
import { useEffect, useState } from 'react';
const Chat = () => {
  const { user, auth, firestore, darkMode, setDarkMode } = useFirebase();
  const messagesRef = collection(firestore, 'messages');
  const messagesQuery = query(messagesRef, orderBy('time', 'asc'), limit(13));
  const [messagesSnapshot] = useCollection(messagesQuery);
  const [messages, setMessages] = useState([]);

  useEffect(()=>{
    if (messagesSnapshot){
      const messages = messagesSnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id };
      });
      setMessages(messages);
    }
  },[messagesSnapshot]);

  const sendMessage = async (message) => {
    if (user) {
      //console.log(user);
      //console.log(user.email.split('@')[0]);
      await addDoc(messagesRef, {
        content: message,
        time: new Date().toISOString(),
        uid: user.uid,
        senderName: user.displayName|| user.email.split('@')[0],
        sender: user.photoURL
      });
    }
  };

  const signOut = () => {
    auth.signOut();
  };
  return (
    <>
      {(user && auth.currentUser.emailVerified) ? <>
        <CssBaseline />
        <Box>
          <Heading
            setDarkMode={setDarkMode}
            darkMode={darkMode}
            userImg={user.photoURL}
            userName={user.displayName}    /* CHANGED   PART   FOR     NAME*/
            userSignOut={signOut}
          />
          <Body messages={messages} darkMode={darkMode} currentUser={user} />
          <Foot sendMsg={sendMessage} />
          <Box sx={{ height: '50px' }} />
        </Box>
      </ > : <Navigate to="/" />}
    </>
  );
};

export default Chat;
