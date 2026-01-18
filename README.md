# NativeRecipe Backend API

This is the Express.js backend for the NativeRecipe application, providing APIs for recipe management, authentication, and AI-powered features.

## Features

-   **Authentication**: JWT-based Signup and Login.
-   **Recipe Management**: CRUD operations for Recipes and Ingredients.
-   **Magic Chef (AI)**: Generate creative recipes from a list of ingredients using OpenRouter (Gemini/DeepSeek/Llama).
-   **Image Upload**: Integrated with Cloudinary.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: Supabase (PostgreSQL)
-   **AI**: OpenRouter API (DeepSeek R1)
-   **Language**: TypeScript

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   Supabase Account
-   OpenRouter API Key (for AI features)

### Installation

1.  Clone the repository and go to `backend` folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory (see `.env.example` or below):
    ```env
    PORT=3001
    SUPABASE_URL=your_supabase_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_KEY=your_service_role_key
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    OPENROUTER_API_KEY=your_openrouter_api_key
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## API Endpoints

### AI Chef
-   `POST /api/ai/generate-recipe`
    -   Body: `{ "ingredients": ["egg", "milk", "cheese"] }`
    -   Response: JSON object with title, description, ingredients, and instructions.

### Auth
-   `POST /api/auth/signup`
-   `POST /api/auth/login`

### Recipes
-   `GET /api/recipes`
-   `POST /api/recipes` (Protected)
-   `GET /api/recipes/:id`
