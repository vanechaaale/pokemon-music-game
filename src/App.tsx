import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PokemonMusicGame } from './game/PokemonMusicGame';
import { Home } from './Home';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
function App() {
  return (
    <MantineProvider>
      <Notifications />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/lobby/:lobbyId" element={<PokemonMusicGame />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  )
}

export default App
