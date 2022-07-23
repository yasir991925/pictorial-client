import { useEffect, useRef, useState } from "react";
import "./App.css";

import Eventbus from "@vertx/eventbus-bridge-client.js";

function App() {
    const [eb, setEb] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    useEffect(() => {
        console.log("render");
        const eb = new Eventbus("/eventbus");
        eb.enableReconnect(true);

        if (eb) {
            console.log("eb");
            eb.onopen = function () {
                console.log("function");
                eb.registerHandler("msg", (err, msg) => {
                    console.log("message");
                    const data = JSON.parse(msg.body);
                    if (!err) setMessages((messages) => [data, ...messages]);
                });
            };
        }

        setEb(eb);
        return () => {
            eb.close();
        };
    }, []);

    const handleChange = (e) => {
        setText(e.target.value);
    };

    const renderMessages = () => {
        return messages
            // .sort((a, b) => b.timestamp - a.timestamp)
            .map((m, i) => (
                <div key={i} className="mbox">
                    <div>{m.server}</div>
                    <div>{m.message}</div>
                    <div>{new Date(m.timestamp).toLocaleTimeString()}</div>
                </div>
            ));
    };

    const sendMessage = () => {
        console.log(messages);
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
