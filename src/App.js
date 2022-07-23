import { useEffect, useRef, useState } from "react";
import "./App.css";

import Eventbus from "@vertx/eventbus-bridge-client.js";

function App() {
    const [eb, setEb] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const mesRef = useRef([]);

    useEffect(() => {
        const eb = new Eventbus("/eventbus");
        eb.enableReconnect(true);
        setEb(eb);

        if (eb) {
            eb.onopen = function () {
                eb.registerHandler("msg", (err, msg) => {
                    mesRef.current = [...mesRef.current, JSON.parse(msg.body)];
                    if (!err) setMessages([...mesRef.current]);
                });
            };
        }

        console.log("render");
    }, []);

    const handleChange = (e) => {
        setText(e.target.value);
    };

    const renderMessages = () => {
        return messages.sort((a, b) => b.timestamp - a.timestamp).map((m, i) => (
            <div key={i} className="mbox">
				<div>{m.server}</div>
				<div>{m.message}</div>
				<div>{m.timestamp}</div>
            </div>
        ));
    };

    const sendMessage = () => {
        if (eb) {
            eb.send("msg-back", text);
            setText("");
        }
    };

    return (
        <div className="App">
            <h1>Scalling web sockets</h1>
            <form onSubmit={(e) => e.preventDefault()}>
                <input onChange={handleChange} value={text} />
                <button onClick={sendMessage}>Send</button>
                <br />
            </form>
            <div className="container">{renderMessages()}</div>
        </div>
    );
}

export default App;
