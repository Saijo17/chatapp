import React from 'react';
import { Modal, Backdrop, Fade, Box, Typography, Button } from '@mui/material';

const PopupMsg = ({ open, onClose, message }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Message
          </Typography>
          <Typography sx={{ mb: 3 }}>
            {message}
          </Typography>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              fontWeight: 'bold',
              backgroundColor: '#3f51b5',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#303f9f',
              },
              borderRadius: '20px',
              padding: '10px 20px',
            }}
          >
            Close
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default PopupMsg;
