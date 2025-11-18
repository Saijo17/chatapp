import React, { useState } from "react";
import { Box, Typography, IconButton, Menu, MenuItem, Fade } from "@mui/material"; // Import Fade
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UserIcon from "./UserIcon";
import { doc, deleteDoc } from "firebase/firestore";
import { useFirebase } from "../Initializer";

function Message(props) {
  const { firestore, user } = useFirebase();
  
  const isSenderPresent = props.currentUser.uid !== props.uid;
  const alignLeft = isSenderPresent;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReply = () => {
    handleMenuClose();
    console.log("Reply to:", props.content);
  };

  const navigate = useNavigate();
  const handleDirectMessage = () => {
    handleMenuClose();
    if (props.uid) {
      navigate(`/dm/${props.uid}`);
    }
  };

  const handleDelete = async() => {
    handleMenuClose();
    const docRef = doc(firestore, "messages", props.docId);
    await deleteDoc(docRef);
    console.log(props);
    console.log("Delete message:", props.docId);
  };

  // UPDATED: New color scheme logic
  const incomingMsgBg = props.darkMode ? '#303030' : '#ffffff';
  const outgoingMsgBg = props.darkMode ? '#673ab7' : '#d1c4e9'; // Using theme colors
  const outgoingMsgColor = props.darkMode ? '#ffffff' : '#121212';

  return (
    // UPDATED: Wrap in <Fade> for animation
    <Fade in={true}>
      <Box
        sx={{
          display: 'flex',
          margin: '10px',
          alignItems: 'flex-start',
          marginBottom: 2,
          justifyContent: alignLeft ? 'flex-start' : 'flex-end',
        }}
      >
        {isSenderPresent && <UserIcon img={props.sender} sx={{ width: 32, height: 32, marginRight: 1 }} />}

        <Box
          sx={{
            // UPDATED: Bubble styles
            backgroundColor: alignLeft ? incomingMsgBg : outgoingMsgBg,
            color: alignLeft ? (props.darkMode ? '#fff' : '#000') : outgoingMsgColor,
            padding: 1.5,
            borderRadius: alignLeft 
              ? '20px 20px 20px 5px' 
              : '20px 20px 5px 20px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            maxWidth: '70%',
            position: 'relative',
          }}
        >
          {isSenderPresent && (
            <Typography
              variant="subtitle2"
              component="p"
              sx={{ fontWeight: 'bold', marginBottom: 0.5, color: props.darkMode ? '#fff' : '#000' }}
            >
              {props.senderName || "Unknown"}
            </Typography>
          )}

          <Typography variant="body1" component="p" sx={{ margin: 0, wordWrap: 'break-word' }}>
            {props.content}
          </Typography>

          <Typography variant="caption" component="footer" sx={{ fontSize: 12, color: '#777' }}>
            {props.time}
          </Typography>

          <IconButton
            aria-label="more"
            aria-controls="message-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              color: 'inherit', // Inherit color from parent
            }}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            id="message-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {isSenderPresent && <MenuItem onClick={handleDirectMessage}>Message privately</MenuItem>}
            <MenuItem onClick={handleReply}>Reply</MenuItem>
            {props.uid===user.uid && <MenuItem onClick={handleDelete}>Delete</MenuItem>}
          </Menu>
        </Box>

        {!isSenderPresent && <UserIcon img={props.sender} sx={{ width: 32, height: 32, marginLeft: 1 }} />}
      </Box>
    </Fade>
  );
}

export default Message;