import { AppShell, Group, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  return (
    <AppShell.Header>
      <Group h="100%" px="md">
        <Text
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/home")}
          fw={500}
        >
          Pokemon Music Quiz
        </Text>
      </Group>
    </AppShell.Header>
  );
}

export default Header;
