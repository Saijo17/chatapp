import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import Sign from './Sign.jsx';
import Chat from "./Chat.jsx";
import { FirebaseProvider } from './Initializer.jsx';
import Call from './Call.jsx';
import Users from './Users.jsx';
import PrivateChat from './PrivateChat.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FirebaseProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Sign />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/users' element={<Users />} />
          <Route path='/dm/:otherUid' element={<PrivateChat />} />
          <Route path='/call' element={<Call />} />
        </Routes>
      </Router>
    </FirebaseProvider>
  </React.StrictMode>
);
