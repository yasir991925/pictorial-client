import { useEffect, useState } from "react";

import Eventbus from "@vertx/eventbus-bridge-client.js";
import CanvasDraw from "react-canvas-draw";

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
        return messages.map((m, i) => (
            <div key={i} className="p-2 mb-2 font-mono rounded-md border-gray-800 border-2 text-gray-800">
                <div className="text-xl font-sans font-bold mb-2 break-all">{m.message}</div>
                <div className="text-xs">{m.server}</div>
                <div className="text-xs">{new Date(m.timestamp).toLocaleTimeString()}</div>
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

    const handleChangeDraw = (e) => {
        console.log(e.getSaveData());
    };

    return (
        <div className="flex flex-col p-10">
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
            />
        </div>
    );
}

export default App;
