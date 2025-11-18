import React from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useFirebase } from './Initializer';
import { List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const { user, firestore, darkMode } = useFirebase();
  const usersRef = collection(firestore, 'users');
  const usersQuery = query(usersRef, orderBy('displayName'));
  const [usersSnapshot] = useCollection(usersQuery);

  const users = usersSnapshot ? usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) : [];

  return (
    <Box>
      <List>
        {users.length === 0 && <Typography sx={{ p: 2 }}>No contacts found</Typography>}
        {users.map(u => {
          if (u.id === user?.uid) return null;
          return (
            <UserListItem key={u.id} u={u} />
          );
        })}
      </List>
    </Box>
  );
};

function UserListItem({ u }) {
  const navigate = useNavigate();
  return (
    <ListItemButton onClick={() => navigate(`/dm/${u.id}`)}>
      <ListItemAvatar>
        <Avatar src={u.photoURL}>{u.displayName ? u.displayName[0] : u.email?.[0]}</Avatar>
      </ListItemAvatar>
      <ListItemText primary={u.displayName || u.email} />
    </ListItemButton>
  );
}

export default Users;
