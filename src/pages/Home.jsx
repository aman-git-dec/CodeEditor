import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");

    const CreateNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        console.log(id);
        toast.success("Created a new room");
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error("ROOM ID & username is required");
            return;
        }        
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    }

    const handleInputEnter = (e) => {
        if(e.code === 'Enter'){
            joinRoom();
        }    
    }

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <img className="homePageLogo" src="/src/assets/logo.png" alt="" />
                <h4 className="mainLabel">Paste your Room ID here</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        placeholder="Room ID"
                        className="inputBox"
                        onChange={(e)=>setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />

                    <input
                        type="text"
                        placeholder="Name"
                        className="inputBox"
                        onChange={(e)=>setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />

                    <button className="btn joinBtn" onClick={joinRoom}>Join</button>

                    <span className="createInfo">
                        If you don't have an invite, then create&nbsp;
                        <a onClick={CreateNewRoom} className="createNewBtn">
                            new room
                        </a>
                    </span>
                </div>
            </div>

            <div className="builtByFooter">
                Built by{" "}
                <a
                    href="https://github.com/aman-git-dec"
                    target="_blank"
                    rel="noreferrer"
                >
                    Aman Singh Rawat
                </a>
            </div>
        </div>
    );
};

export default Home;
