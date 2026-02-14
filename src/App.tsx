import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PokemonMusicQuiz } from './game/PokemonMusicQuiz';
import { Home } from './Home';
import { Notifications } from '@mantine/notifications';
function App() {
  return (
      <BrowserRouter>
            <Notifications />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lobby/:lobbyId" element={<PokemonMusicQuiz />} />
          </Routes>
        
      </BrowserRouter>
  )
}

export default App
