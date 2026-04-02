// src/server.ts (optional for local dev)
import app from "./app";

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/docs`);
});