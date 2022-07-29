import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const [text, setText] = useState("");

    const createRoom = () => {
        axios
            .post("/game")
            .then((res) => {
                console.log(res);
                const gameId = res.data;
				window.location.href = "/game/" + gameId // !TODO this need fix
            })
            .catch((err) => {
                console.log(err);
            });
    };
    const joinRoom = () => {};

    return (
        <div>
            <h1 className="text-5xl text-center mb-10">Welcome to Pictonary</h1>
            <div className="flex justify-center">
                <button
                    onClick={createRoom}
                    className="font-bold transition-all py-2 px-4 border-blue-600 border-2 rounded-md hover:bg-blue-600 hover:text-white"
                >
                    Create Room
                </button>
            </div>
            <div className="m-10" />
            <div className="flex justify-center">
                <input
                    placeholder="room ID"
                    onChange={(e) => setText(e.target.value)}
                    value={text}
                    className="border-2 rounded-md p-2 mr-2 w-3/4 outline-none focus:border-blue-600"
                />
                <button
                    onClick={joinRoom}
                    className="font-bold transition-all py-2 px-4 border-blue-600 border-2 rounded-md hover:bg-blue-600 hover:text-white"
                >
                    Join Room
                </button>
            </div>
        </div>
    );
}

export default Home;
