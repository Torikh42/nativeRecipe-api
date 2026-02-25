# NativeRecipe Backend API 🚀

This is the TypeScript backend for the NativeRecipe application, providing high-performance APIs for recipe management, authentication, AI-powered chef features, and **Pro Chef Subscription**.

## ✨ Features

-   **Authentication**: Secure JWT-based signup and login system.
-   **Recipe Management**: Complete CRUD operations for recipes and ingredients.
-   **AI Chef (Magic Chef)**: Generate creative and detailed recipes from a list of ingredients using Google Gemini AI.
-   **Pro Chef Subscription**: Premium subscription with Midtrans payment integration (BCA, Mandiri, BRI, QRIS, GoPay, etc.).
-   **Storage**: Integrated with **Cloudflare R2** for efficient and cost-effective image hosting.
-   **Database**: Real-time data management with **Supabase (PostgreSQL)**.

## 🛠 Tech Stack

-   **Runtime**: [Bun](https://bun.sh/) (Fast all-in-one JavaScript runtime)
-   **Framework**: Express.js with TypeScript
-   **Database**: Supabase
-   **AI Engine**: Google Generative AI (Gemini)
-   **Storage**: Cloudflare R2 (S3 Compatible)
-   **Payment**: Midtrans (Indonesia payment gateway)
-   **Validation**: Zod
-   **Middleware**: Helmet, CORS, Morgan

## 🚀 Getting Started

### Prerequisites

-   Bun installed (recommended) or Node.js
-   Supabase Account & Project
-   Cloudflare R2 Bucket
-   Google Gemini API Key
-   Midtrans Account (for payment features)

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

    # Midtrans (Payment)
    MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY
    MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY
    MIDTRANS_IS_PRODUCTION=false

    # Subscription Plans (in IDR)
    SUBSCRIPTION_MONTHLY_PRICE=29000
    SUBSCRIPTION_YEARLY_PRICE=1000000
    ```

4.  **Database Migration**: Run the SQL migration in Supabase:
    -   Open [Supabase Dashboard](https://supabase.com/dashboard)
    -   Go to **SQL Editor**
    -   Run the contents of `supabase_migration.sql`

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
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/generate-recipe` | Generate a recipe from ingredients |

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/logout` | User logout |

### 📖 Recipes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/recipes` | Get all public recipes | Public |
| `GET` | `/api/recipes/mine` | Get user's own recipes | Protected |
| `GET` | `/api/recipes/:id` | Get recipe details | Public |
| `POST` | `/api/recipes` | Create a new recipe | Protected |
| `PUT` | `/api/recipes/:id` | Update a recipe | Protected |
| `DELETE` | `/api/recipes/:id` | Delete a recipe | Protected |

### 💎 Pro Chef Subscription
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/subscription/plans` | Get available subscription plans | Public |
| `POST` | `/api/subscription/create` | Create subscription & get payment token | Protected |
| `GET` | `/api/subscription/status` | Get user's subscription status | Protected |
| `POST` | `/api/subscription/cancel` | Cancel a subscription | Protected |
| `GET` | `/api/subscription/check/:orderId` | Check transaction status | Protected |
| `POST` | `/api/subscription/webhook` | Midtrans webhook notification | Public |

## 💎 Pro Chef Subscription

### Subscription Plans

| Plan | Price | Duration | Features |
|------|-------|----------|----------|
| **Monthly** | Rp 29.000 | 30 days | Unlimited AI recipes, Premium recipes, PDF download, Ad-free |
| **Yearly** | Rp 290.000 | 365 days | All monthly features + **Save 17%** |

### Payment Methods (via Midtrans)

-   🏦 **Bank Transfer**: BCA, Mandiri, BRI, Permata, DANAMON
-   💳 **Credit Card**: Visa, Mastercard, JCB
-   📱 **E-Wallet**: GoPay, OVO, Dana, ShopeePay
-   📲 **QRIS**: Scan QR code for any e-wallet
-   🏪 **Retail**: Alfamart, Indomaret

### Testing (Sandbox Mode)

**Credit Card Test:**
```
Card Number: 4811 1111 1111 1142
Expiry: 12/2030 (any future date)
CVV: 123
```

**BCA Virtual Account Test:**
```
Virtual Account Number: Will be generated by Midtrans
```

### Webhook Configuration

For local development, use [ngrok](https://ngrok.com/) to expose your webhook:

1.  Install ngrok: `npm install -g ngrok`
2.  Run: `ngrok http 3001`
3.  Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4.  Configure in Midtrans Dashboard: **Settings → Configuration → Payment Notification URL**
    ```
    https://your-ngrok-url.ngrok.io/api/subscription/webhook
    ```

### Example: Create Subscription

```bash
# Get subscription plans
curl http://localhost:3001/api/subscription/plans

# Create subscription (requires auth token)
curl -X POST http://localhost:3001/api/subscription/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planType": "monthly",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "081234567890"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Subscription created successfully. Please complete payment.",
  "data": {
    "orderId": "PRO-CHEF-ABC12345-1234567890",
    "snapToken": "abc123def456...",
    "redirectUrl": "https://app.midtrans.com/snap/v2/...",
    "price": 29000,
    "planType": "monthly"
  }
}
```

### Protecting Routes (Pro-only Features)

Use the `requirePro` middleware to protect premium routes:

```typescript
import { requirePro } from "./middleware/subscription.middleware";

router.get(
  "/premium-content",
  authMiddleware,
  requirePro,
  PremiumController.getContent
);
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database & service configurations
│   │   ├── supabase.ts
│   │   ├── cloudinary.ts
│   │   ├── r2.ts
│   │   └── midtrans.ts      # Midtrans payment config
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── recipe.controller.ts
│   │   ├── ai.controller.ts
│   │   └── subscription.controller.ts  # Subscription logic
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── recipe.service.ts
│   │   ├── ai.service.ts
│   │   └── subscription.service.ts     # Midtrans integration
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   └── subscription.middleware.ts  # Pro access check
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── recipe.routes.ts
│   │   ├── ai.routes.ts
│   │   └── subscription.routes.ts      # Subscription endpoints
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
├── supabase_migration.sql  # Database schema
└── .env.example
```

## 🔒 Security Notes

-   Never commit `.env` file to version control
-   Use strong JWT_SECRET (min 32 characters)
-   Enable signature verification for Midtrans webhooks in production
-   Set `MIDTRANS_IS_PRODUCTION=true` when going live

## 📚 Additional Resources

-   [Midtrans Documentation](https://docs.midtrans.com/)
-   [Supabase Documentation](https://supabase.com/docs)
-   [Bun Documentation](https://bun.sh/docs)
-   [Express.js Documentation](https://expressjs.com/)

## 🐛 Troubleshooting

### Midtrans Error: "undefined is not a constructor"
-   Make sure you're using the correct Midtrans server key format
-   Check that `midtrans-client` is installed: `bun install midtrans-client`

### Webhook Not Receiving Notifications
-   Ensure your server is publicly accessible (use ngrok for local dev)
-   Verify webhook URL is correctly configured in Midtrans Dashboard
-   Check server logs for incoming POST requests

### Subscription Not Activating
-   Verify Midtrans credentials in `.env`
-   Check if webhook is receiving `settlement` or `capture` events
-   Ensure database policies allow user to update their subscription

---