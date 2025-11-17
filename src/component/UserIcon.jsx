import React from 'react';
import { Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function UserIcon({ img, alt='sender icon' }) {
  return (
    <>
      {img ? (
        <Avatar src={img} alt={alt} className="user-icon" />
      ) : (
        <AccountCircleIcon className="user-icon" />
      )}
    </>
  );
}

export default UserIcon;
