import React, { useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function Foot(props) {
  const [message, setMessage] = useState("");

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      props.sendMsg(message);
      setMessage("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: '10px 20px',
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <TextField
        sx={{
          width: '80%',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderRadius: '20px',
            },
          },
        }}
        placeholder="Type your message..."
        variant="outlined"
        size="small"
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown}
      />
      <IconButton
        sx={{
          padding: '10px',
        }}
        onClick={handleSendMessage}
        disabled={!message.trim()}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}

export default Foot;
