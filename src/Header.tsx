import { AppShell, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  return (
    <AppShell.Header>
      <Text
        style={{
          cursor: "pointer",
          float: "left",
          paddingLeft: "1rem",
        }}
        onClick={() => navigate("/")}
        fw={500}
      >
        Pokémon Music Quiz
      </Text>
    </AppShell.Header>
  );
}

export default Header;
