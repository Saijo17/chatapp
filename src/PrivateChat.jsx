import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, orderBy, addDoc, doc, getDoc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Typography, Box, CircularProgress, Link } from '@mui/material';
import { useFirebase } from './Initializer';
import Body from './component/Body';
import Foot from './component/Foot';
import Heading from './component/Heading';

function getThreadId(a, b) {
  return [a, b].sort().join('_');
}

const PrivateChat = () => {
  const { otherUid } = useParams();
  const { user, auth, firestore, darkMode, setDarkMode, markPrivateAsRead } = useFirebase();

  if (!user) return null;

  const threadId = getThreadId(user.uid, otherUid);
  const messagesRef = collection(firestore, 'private_messages');
  const messagesQuery = query(messagesRef, where('threadId', '==', threadId), orderBy('time', 'asc'));
  const [messagesSnapshot, loading, error] = useCollection(messagesQuery);

  const messages = messagesSnapshot ? messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) : [];

  const [otherName, setOtherName] = useState('Private Chat');

  useEffect(() => {
    let mounted = true;
    async function fetchOther() {
      try {
        const ref = doc(firestore, 'users', otherUid);
        const snap = await getDoc(ref);
        if (mounted && snap.exists()) {
          const data = snap.data();
          setOtherName(data.displayName || data.email || 'Private Chat');
        }
      } catch (err) {
        console.error('Failed to load other user', err);
      }
    }
    if (otherUid) fetchOther();
    return () => { mounted = false; };
  }, [otherUid, firestore]);

  const sendMessage = async (message) => {
    if (!message || !message.trim()) return;
    try {
      await addDoc(messagesRef, {
        threadId,
        content: message,
        time: new Date().toISOString(),
        uid: user.uid,
        senderName: user.displayName || user.email.split('@')[0],
        sender: user.photoURL || '',
        to: otherUid,
      });
    } catch (err) {
      console.error('Failed to send private message', err);
      alert('Failed to send message: ' + (err.message || err));
    }
  };

  // mark this thread as read when opening the chat
  React.useEffect(() => {
    if (markPrivateAsRead && otherUid) markPrivateAsRead(otherUid);
  }, [otherUid, markPrivateAsRead]);

  return (
    <>
      <Heading setDarkMode={setDarkMode} darkMode={darkMode} userImg={user.photoURL} userName={user.displayName} userSignOut={() => auth.signOut()} title={otherName} />
      <Box sx={{ minHeight: '70vh' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ textAlign: 'center', mt: 4, px: 2 }}>
            <Typography color="error" sx={{ mb: 1 }}>Failed to load messages.</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              {error.message}
            </Typography>
            {/* If Firestore needs a composite index it provides a URL in the error message. Show it as a link if present. */}
            {typeof error.message === 'string' && error.message.includes('https://') && (
              <Link href={error.message.match(/https:\/\/[^)\s]+/g)[0]} target="_blank" rel="noreferrer">Create required Firestore index</Link>
            )}
          </Box>
        )}

        {!loading && !error && (
          messages.length === 0 ? (
            <Typography sx={{ textAlign: 'center', mt: 6 }}>* No messages yet *</Typography>
          ) : (
            <Body messages={messages} darkMode={darkMode} currentUser={user} collectionName={'private_messages'} />
          )
        )}
      </Box>
      <Foot sendMsg={sendMessage} />
    </>
  );
};

export default PrivateChat;
