import { Router } from "express";
import { subscriptionController } from "../controllers/subscription.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @route   GET /api/subscription/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
router.get("/plans", subscriptionController.getPlans);

/**
 * @route   POST /api/subscription/create
 * @desc    Create a new subscription and get payment token
 * @access  Private
 */
router.post("/create", authMiddleware, subscriptionController.createSubscription);

/**
 * @route   GET /api/subscription/status
 * @desc    Get current user's subscription status
 * @access  Private
 */
router.get("/status", authMiddleware, subscriptionController.getSubscriptionStatus);

/**
 * @route   POST /api/subscription/cancel
 * @desc    Cancel a subscription
 * @access  Private
 */
router.post("/cancel", authMiddleware, subscriptionController.cancelSubscription);

/**
 * @route   GET /api/subscription/check/:orderId
 * @desc    Check transaction status from Midtrans
 * @access  Private
 */
router.get("/check/:orderId", authMiddleware, subscriptionController.checkTransaction);

/**
 * @route   POST /api/subscription/webhook
 * @desc    Midtrans webhook notification endpoint
 * @access  Public (secured by signature verification in production)
 */
router.post("/webhook", subscriptionController.handleWebhook);

export default router;
