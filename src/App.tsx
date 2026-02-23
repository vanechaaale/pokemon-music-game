import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PokemonMusicQuiz } from "./game/PokemonMusicQuiz";
import { Home } from "./Home";
import { Notifications } from "@mantine/notifications";
import { AppShell } from "@mantine/core";
import { Header } from "./Header";
function App() {
  return (
    <BrowserRouter>
      <AppShell
        styles={{
          main: {
            paddingTop: "3rem",
          },
        }}
      >
        <Header />
        <AppShell.Main>
          <Notifications />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lobby/:lobbyId" element={<PokemonMusicQuiz />} />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
