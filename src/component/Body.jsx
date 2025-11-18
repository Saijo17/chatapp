import { useRef, useEffect } from "react";
import { Box } from "@mui/material";
import Message from "./Message";

function Body(props) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [props.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
    {/* UPDATED: Background pattern added */}
    <Box 
      sx={{
        height:{xs:'85vh', lg:'86vh'},
        flexGrow: 1,
        overflowY: "auto",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        backgroundColor: props.darkMode ? '#222' : '#f0f0f0',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm-15-20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM0 60v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM15 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {props.messages && props.messages.map((mes, index) => {
        return(
        <Message
          key={index}
          docId={mes.id}
          sender={mes.sender}
          senderName={mes.senderName || "Unknown"}
          content={mes.content}
          time={mes.time}
          darkMode={props.darkMode}
          currentUser={props.currentUser}
          uid={mes.uid}
          collectionName={props.collectionName}
        />);
})}
      <div ref={messagesEndRef} />
    </Box>
    </>
  );
}

export default Body;