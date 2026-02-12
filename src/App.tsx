import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PokemonMusicGame } from './game/PokemonMusicGame';
import { Home } from './Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/lobby/:lobbyId" element={<PokemonMusicGame />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
