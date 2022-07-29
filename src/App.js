import { Routes, Route } from "react-router-dom";
import Room from "./Room";
import Home from "./Home";

function App() {
    return (
        <div className="p-10">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="game/:id" element={<Room />} />
            </Routes>
        </div>
    );
}

export default App;
