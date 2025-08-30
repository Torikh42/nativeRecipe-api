import express from "express";
import cors from "cors";
import recipeRoutes from "./routes/recipe.routes";
import authRoutes from "./routes/auth.routes";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware Sederhana
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Recipe API is running!");
});

// Gunakan prefix /api untuk semua rute resep
app.use("/api/recipes", recipeRoutes);

// Gunakan prefix /api untuk semua rute otentikasi
app.use("/api/auth", authRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
