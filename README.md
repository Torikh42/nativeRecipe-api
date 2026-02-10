# NativeRecipe Backend API 🚀

This is the TypeScript backend for the NativeRecipe application, providing high-performance APIs for recipe management, authentication, and AI-powered chef features.

## ✨ Features

-   **Authentication**: Secure JWT-based signup and login system.
-   **Recipe Management**: Complete CRUD operations for recipes and ingredients.
-   **AI Chef (Magic Chef)**: Generate creative and detailed recipes from a list of ingredients using Google Gemini AI.
-   **Storage**: Integrated with **Cloudflare R2** for efficient and cost-effective image hosting.
-   **Database**: Real-time data management with **Supabase (PostgreSQL)**.

## 🛠 Tech Stack

-   **Runtime**: [Bun](https://bun.sh/) (Fast all-in-one JavaScript runtime)
-   **Framework**: Express.js with TypeScript
-   **Database**: Supabase
-   **AI Engine**: Google Generative AI (Gemini)
-   **Storage**: Cloudflare R2 (S3 Compatible)
-   **Validation**: Zod
-   **Middleware**: Helmet, CORS, Morgan

## 🚀 Getting Started

### Prerequisites

-   Bun installed (recommended) or Node.js
-   Supabase Account & Project
-   Cloudflare R2 Bucket
-   Google Gemini API Key

### Installation

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Configure environment variables by creating a `.env` file:
    ```env
    PORT=3001
    JWT_SECRET=your_jwt_secret

    # Supabase
    SUPABASE_URL=your_supabase_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_KEY=your_service_role_key

    # Cloudflare R2
    R2_ACCOUNT_ID=your_account_id
    R2_ACCESS_KEY_ID=your_access_key
    R2_SECRET_ACCESS_KEY=your_secret_key
    R2_BUCKET_NAME=your_bucket_name
    R2_PUBLIC_URL=your_public_r2_url

    # AI
    GOOGLE_GENERATIVE_AI_RECIPE_API_KEY=your_gemini_api_key
    ```

### Running the Server

-   **Development mode** (with hot reload):
    ```bash
    bun dev
    ```
-   **Production mode**:
    ```bash
    bun start
    ```

## 📡 API Endpoints

### 🍳 AI Chef
-   `POST /api/ai/generate-recipe` - Generate a recipe from ingredients.

### 🔐 Authentication
-   `POST /api/auth/signup` - Register a new user.
-   `POST /api/auth/login` - User login.

### 📖 Recipes
-   `GET /api/recipes` - Get all public recipes.
-   `GET /api/recipes/mine` - Get user's own recipes (Protected).
-   `GET /api/recipes/:id` - Get recipe details.
-   `POST /api/recipes` - Create a new recipe (Protected, supports image upload).
-   `PUT /api/recipes/:id` - Update a recipe (Protected).
-   `DELETE /api/recipes/:id` - Delete a recipe (Protected).