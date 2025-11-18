import { useRef, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useFirebase } from './Initializer';
import { CssBaseline } from '@mui/material';
import Heading from './component/Heading';
import { collection, updateDoc, addDoc, getDoc, onSnapshot, doc, setDoc } from 'firebase/firestore';
import CallEndIcon from '@mui/icons-material/CallEnd';
import CallIcon from '@mui/icons-material/Call';
import AddIcCallIcon from '@mui/icons-material/AddIcCall';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { Navigate } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

function initializeId() {
    let url = new URL(window.location);
    let room_id = url.searchParams.get('id')
    if (room_id) {
        return room_id
    }
}
function updateURL(new_id) {
    let url = new URL(window.location);
    url.searchParams.set('id', new_id);
    window.history.pushState({}, '', url);
}

const Call = () => {
    const [otherName, setOtherName] = useState('')
    const [id, setId] = useState(initializeId())
    const { user, auth, firestore, darkMode, setDarkMode } = useFirebase();
    const [isInCall, setIsInCall] = useState(false)
    const [muted, setMuted] = useState(false);
    const webcamVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const webCamOn = async () => {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            remoteStream = new MediaStream();
            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            });
            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remoteStream.addTrack(track);
                });
            };
            if (webcamVideoRef.current && remoteVideoRef.current) {
                webcamVideoRef.current.srcObject = localStream;
                remoteVideoRef.current.srcObject = remoteStream;
            }
        }
        catch {
            console.log('error setting webcam and mic')
        }
    };
    async function createCall() {
        setIsInCall(true);
        await webCamOn();
        const callDoc = doc(collection(firestore, 'calls'));
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');

        setId(callDoc.id);
        updateURL(callDoc.id)
        pc.onicecandidate = (event) => {
            event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
        };

        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
            caller: user.displayName
        };

        await setDoc(callDoc, { offer });

        onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (data.answer) {
                data.answer.receiver && setOtherName(data.answer.receiver)
            }
            if (!pc.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                pc.setRemoteDescription(answerDescription);
            }
        });

        onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.addIceCandidate(candidate);
                }
            });
        });
    };

    async function answerCall() {
        setIsInCall(true);
        await webCamOn();
        const callId = id;
        const callDoc = doc(collection(firestore, 'calls'), callId);
        const answerCandidates = collection(callDoc, 'answerCandidates');
        const offerCandidates = collection(callDoc, 'offerCandidates');

        pc.onicecandidate = (event) => {
            event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
        };

        const callData = (await getDoc(callDoc)).data();

        const offerDescription = callData.offer;
        setOtherName(callData.offer.caller)
        await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
            receiver: user.displayName
        };

        await updateDoc(callDoc, { answer });

        onSnapshot(offerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    pc.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
    };

    const signOut = () => {
        auth.signOut();
    };

    return (
        <>{user ? <><CssBaseline />
            {/* UPDATED: Container set to 100vh and overflow hidden */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                maxHeight: '100vh',
                overflow: 'hidden',
            }}>
                <Heading
                    title="video call"
                    userImg={user.photoURL}
                    setDarkMode={setDarkMode}
                    darkMode={darkMode}
                    userName={user.displayName}
                    userSignOut={signOut}
                />

                {/* UPDATED: New PiP Layout */}
                {isInCall ? (
                    <Box sx={{
                        flexGrow: 1,
                        position: 'relative',
                        backgroundColor: '#000',
                    }}>
                        {/* Remote Video (Main Screen) */}
                        <Box
                            component="video"
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                position: 'absolute', 
                                top: '20px', 
                                left: '20px', 
                                color: 'white',
                                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                            }}>
                            {otherName || 'Remote User'}
                        </Typography>

                        {/* Local Video (Picture-in-Picture) */}
                        <Box
                            component="video"
                            ref={webcamVideoRef}
                            autoPlay
                            playsInline
                            muted
                            sx={{
                                position: 'absolute',
                                bottom: '20px',
                                right: '20px',
                                width: { xs: '120px', sm: '200px' },
                                borderRadius: 2,
                                border: '2px solid rgba(255,255,255,0.5)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)'
                                }
                            }}
                        />
                        
                        {/*  */}
                        <Box sx={{ 
                            position: 'absolute', 
                            bottom: '20px', 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <Button 
                                onClick={() => navigator.clipboard.writeText(window.location.href)}
                                sx={{ color: 'white', background: 'rgba(255,255,255,0.2)', mb: 2, textTransform: 'none' }}
                            >
                                {id} <ContentCopyIcon sx={{ ml: 1, fontSize: '16px' }} />
                            </Button>
                                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                    <Button
                                                                        onClick={() => {
                                                                            // toggle mute
                                                                            const newMuted = !muted;
                                                                            try {
                                                                                if (localStream) {
                                                                                    localStream.getAudioTracks().forEach(t => t.enabled = !newMuted);
                                                                                }
                                                                            } catch (e) {
                                                                                console.error('Failed to toggle mute', e);
                                                                            }
                                                                            setMuted(newMuted);
                                                                        }}
                                                                        variant="contained"
                                                                        sx={{ borderRadius: '50px', padding: '10px 16px', background: 'rgba(255,255,255,0.15)', color: 'white' }}
                                                                    >
                                                                        {muted ? <MicOffIcon /> : <MicIcon />}
                                                                    </Button>

                                                                    <Button 
                                                                        onClick={() => window.location.href = "/call"} 
                                                                        variant="contained"
                                                                        color="error"
                                                                        sx={{ borderRadius: '50px', padding: '12px 24px' }}
                                                                    >
                                                                        <CallEndIcon />
                                                                    </Button>
                                                                </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ margin: 5, textAlign: 'center', display: 'flex', flexDirection: 'column', width: '50vw', justifyContent: 'space-around', height: '50vh', marginX: 'auto' }}>
                        <TextField value={id || ''} onChange={(e) => setId(e.target.value)} variant="outlined" size="small" label='Call ID' />
                        <Button onClick={createCall} variant="contained" color="primary" sx={{ mr: 2, padding: 1.5 }}><AddIcCallIcon sx={{mr: 1}} /> Create Call</Button>
                        <Button onClick={answerCall} variant="contained" color="secondary" sx={{ mr: 2, padding: 1.5 }} disabled={!id}><CallIcon sx={{mr: 1}} /> Answer Call</Button>
                    </Box>
                )}
            </Box>
        </> : <Navigate to="/" />}
        </>
    );
} 

export default Call;