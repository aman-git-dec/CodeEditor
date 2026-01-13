import React, { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef('');
    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    const cleanupSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
            socketRef.current.off('connect_error');
            socketRef.current.off('connect_failed');
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                const socket = await initSocket();
                
                if (!isMounted) {
                    socket?.disconnect();
                    return;
                }

                socketRef.current = socket;

                const handleErrors = (e) => {
                    console.error('Socket error:', e);
                    toast.error('Socket connection failed');
                    if (isMounted) navigate('/');
                };

                socket.on('connect_error', handleErrors);
                socket.on('connect_failed', handleErrors);

                socket.emit(ACTIONS.JOIN, {
                    roomId,
                    username: location.state?.username,
                });

                socket.on(ACTIONS.JOINED, ({ clients: newClients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                    }
                    setClients(newClients);
                });

                socket.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => prev.filter((client) => client.socketId !== socketId));
                });

            } catch (error) {
                console.error('Socket init failed:', error);
                toast.error('Failed to connect to room');
                if (isMounted) navigate('/');
            }
        };

        init();

        return () => {
            isMounted = false;
            cleanupSocket();
        };
    }, [navigate, roomId, location.state?.username, cleanupSocket]);

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID copied');
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const leaveRoom = () => {
        cleanupSocket();
        navigate('/', { replace: true });
        window.location.href = '/';
    };

    const runCode = () => {
        if (!codeRef.current?.trim()) {
            toast.error('Please write some code first!');
            return;
        }

        setIsRunning(true);
        setOutput('');

        const console = {
            log: (...args) => setOutput(prev => prev + args.join(' ') + '\n'),
            error: (...args) => setOutput(prev => prev + 'ERROR: ' + args.join(' ') + '\n'),
            warn: (...args) => setOutput(prev => prev + 'WARN: ' + args.join(' ') + '\n')
        };

        try {
            const code = `(() => {
                ${codeRef.current}
                return "Code executed";
            })()`;

            const func = new Function('console', code);
            func(console);
            toast.success('Code executed successfully!');
        } catch (error) {
            setOutput(`Error: ${error.message}`);
            toast.error(error.message);
        } finally {
            setIsRunning(false);
        }
    };

    const clearOutput = () => setOutput('');

    if (!location.state?.username) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img className="logoImage" src="/src/assets/logo.png" alt="logo" />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>
                <div className="actionButtons">
                    <button className="btn copyBtn" onClick={copyRoomId}>
                        Copy ROOM ID
                    </button>
                    <button className="btn leaveBtn" onClick={leaveRoom}>
                        Leave
                    </button>
                </div>
            </div>

            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
                <div className="runSection">
                    <button 
                        className={`runBtn ${isRunning ? 'running' : ''}`} 
                        onClick={runCode}
                        disabled={isRunning}
                    >
                        {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                    <button 
                        className="clearBtn"
                        onClick={clearOutput}
                        disabled={isRunning || !output}
                    >
                        Clear Output
                    </button>
                </div>
                <div className="outputPane">
                    <div className="outputTitle">Output:</div>
                    <pre>{output || 'Write and run JavaScript code above to see results here...'}</pre>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;
