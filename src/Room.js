import { useEffect, useRef, useState } from "react";

import Eventbus from "@vertx/eventbus-bridge-client.js";
import CanvasDraw from "react-canvas-draw";
import { useParams } from "react-router-dom";
import axios from "axios";
import PageError from "./PageError";

const styles = {
    border: "2px solid #000",
};

function Room() {
    const [name, setName] = useState("");
    const [user, setUser] = useState("");
    const [pageError, setPageError] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [drawState, setDrawState] = useState("");
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [eb, setEb] = useState(null);
    const [members, setMembers] = useState([]);
    const roomId = useParams().id;

    const canvasRef = useRef();

    useEffect(() => {
        axios
            .get(`/game/data/${roomId}`)
            .then((res) => {
                setMessages(res.data);
                setDataLoaded(true);
            })
            .catch((err) => {
                setPageError(err);
                console.log("url - game/id error");
            });
    }, [roomId]);

    useEffect(() => {
        if (!user) return;
        console.log("setting up eb");
        const eb = new Eventbus("/eventbus");
        setEb(eb);
        if (eb) {
            eb.enableReconnect(true);
            eb.onopen = function () {
                eb.registerHandler(roomId, { user: user }, (err, msg) => {
                    console.log("ROOM message");
                    const data = JSON.parse(msg.body);
                    if (!err) setMessages((messages) => [data, ...messages]);
                    console.log(data);
                    // if (!err) setDrawState(data.message);
                });
                const metadata = "room.metadata." + roomId;
                eb.registerHandler(metadata, (err, msg) => {
                    setMembers((old) => [...msg.body.sort((a, b) => ('' + a.attr).localeCompare(b.attr))]);
                });
            };
        }
        return () => {
            if (eb) eb.close();
        };
    }, [roomId, user]);

    const handleChange = (e) => {
        setText(e.target.value);
    };

    const renderMessages = () => {
        return messages.map((m, i) => (
            <div key={i} className="p-2 mb-2 font-mono rounded-md border-gray-800 border-2 text-gray-800">
                <div className="text-xl font-sans font-bold mb-2 break-all">{m.message}</div>
                <div className="text-xs">{m.server}</div>
                <div className="text-xs">{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
        ));
    };

    const sendMessage = () => {
        console.log("state_messages - ", messages);
        if (eb) {
            console.log("Sending message to vertx EB");
            eb.send("msg.back", { message: text, roomId: roomId }, { user: user });
            setText("");
        }
    };

    const handleChangeDraw = (e) => {
        console.log(e);
        const data = e.getSaveData();
        console.log(data);
        if (eb) {
            console.log("Sending drawing change to vertx EB");
            eb.send("msg.back", { message: data, roomId: roomId }, { user: user });
        }
    };

    const renderMembers = () => {
        return (
            <div>
				<b>Online Members</b>
                {members.map((x) => (
                    <span 
					key={x}
					className="border-2 border-green-600 rounded-md p-2 mr-2">
                        {x}
                    </span>
                ))}
            </div>
        );
    };

    if (pageError) {
        return <PageError error={pageError} />;
    }

    if (!dataLoaded) {
        return <div>Fetching Data...</div>;
    }

    if (!user) {
        return (
            <div>
                <h2>Please enter a name</h2>
                <input
                    value={name}
                    onChange={(x) => setName(x.target.value)}
                    className="border-2 rounded-md p-2 mr-2 w-3/4 outline-none focus:border-blue-600"
                />
                <button
                    onClick={(e) => setUser(name)}
                    className="font-bold py-2 px-4 border-blue-600 border-2 rounded-md hover:bg-blue-600 hover:text-white"
                >
                    Confirm
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-10">
            <span>Hi - {user}</span>
            {renderMembers()}
            <h2 className="text-2xl text-center">Room - {roomId}</h2>
            <h1 className="text-3xl text-center font-bold">Scalling web sockets</h1>
            <div className="mb-10" />
            <form onSubmit={(e) => e.preventDefault()} className="flex justify-center">
                <input
                    placeholder="message"
                    onChange={handleChange}
                    value={text}
                    className="border-2 rounded-md p-2 mr-2 w-3/4 outline-none focus:border-blue-600"
                />
                <button
                    onClick={sendMessage}
                    className="font-bold py-2 px-4 border-blue-600 border-2 rounded-md hover:bg-blue-600 hover:text-white"
                >
                    Send
                </button>
                <br />
            </form>
            <div className="mb-10" />
            <div className="grid gap-2 grid-cols-1 lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-3">{renderMessages()}</div>
            <CanvasDraw
                hideInterface
                brushRadius={5}
                lazyRadius={2}
                hideGrid
                className="border-2 rounded-md"
                onChange={handleChangeDraw}
                // saveData={drawState}
            />
        </div>
    );
}

export default Room;
