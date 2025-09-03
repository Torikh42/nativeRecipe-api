import "dotenv/config"; 
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import recipeRoutes from "./routes/recipe.routes";
import authRoutes from "./routes/auth.routes";

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Recipe API is running!");
});

app.use("/api/recipes", recipeRoutes);

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
