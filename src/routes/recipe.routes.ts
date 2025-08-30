import { Router } from 'express';
import { RecipeController } from '../controllers/recipe.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', RecipeController.getAllRecipes);
router.post('/', authMiddleware, RecipeController.createRecipe);

export default router;
