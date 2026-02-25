import { Request, Response } from "express";
import { subscriptionService, type PlanType } from "../services/subscription.service";
import { supabase } from "../config/supabase";

export class SubscriptionController {
  /**
   * Create a new subscription and return payment token
   * POST /api/subscription/create
   */
  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized. Please login first.",
        });
        return;
      }

      const { planType, email, phone, name } = req.body;

      // Validate plan type
      if (!planType || !["monthly", "yearly"].includes(planType)) {
        res.status(400).json({
          success: false,
          message: "Invalid plan type. Choose 'monthly' or 'yearly'.",
        });
        return;
      }

      // Get user email from database if not provided
      let userEmail = email;
      let userName = name;
      let userPhone = phone;

      if (!userEmail || !userName) {
        const { data: userData } = await supabase
          .from("User")
          .select("email, full_name")
          .eq("id", userId)
          .single();

        if (userData) {
          userEmail = userEmail || userData.email;
          userName = userName || userData.full_name;
        }
      }

      if (!userEmail) {
        res.status(400).json({
          success: false,
          message: "Email is required for subscription.",
        });
        return;
      }

      // Check if user already has an active subscription
      const existingSubscription = await subscriptionService.getUserSubscription(userId);
      if (existingSubscription?.isPro) {
        res.status(400).json({
          success: false,
          message: "You already have an active Pro subscription.",
          subscription: existingSubscription,
        });
        return;
      }

      // Create subscription
      const result = await subscriptionService.createSubscription({
        userId,
        planType: planType as PlanType,
        email: userEmail,
        phone: userPhone,
        name: userName,
      });

      res.status(201).json({
        success: true,
        message: "Subscription created successfully. Please complete payment.",
        data: result,
      });
    } catch (error: any) {
      console.error("Create subscription error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create subscription.",
      });
    }
  }

  /**
   * Get current user's subscription status
   * GET /api/subscription/status
   */
  async getSubscriptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized. Please login first.",
        });
        return;
      }

      const subscription = await subscriptionService.getUserSubscription(userId);

      if (!subscription) {
        res.status(200).json({
          success: true,
          data: {
            isPro: false,
            planType: null,
            status: null,
            endDate: null,
            daysRemaining: 0,
            message: "No subscription found. Upgrade to Pro Chef for unlimited access!",
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error: any) {
      console.error("Get subscription status error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get subscription status.",
      });
    }
  }

  /**
   * Handle Midtrans webhook notification
   * POST /api/subscription/webhook
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      // Verify the notification signature (optional but recommended)
      // You can add signature verification here using req.headers

      await subscriptionService.handleWebhookNotification(payload);

      res.status(200).json({
        success: true,
        message: "Webhook processed successfully.",
      });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process webhook.",
      });
    }
  }

  /**
   * Check transaction status
   * GET /api/subscription/check/:orderId
   */
  async checkTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: "Order ID is required.",
        });
        return;
      }

      const status = await subscriptionService.checkTransactionStatus(orderId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      console.error("Check transaction error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to check transaction status.",
      });
    }
  }

  /**
   * Cancel subscription
   * POST /api/subscription/cancel
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { orderId } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized. Please login first.",
        });
        return;
      }

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: "Order ID is required.",
        });
        return;
      }

      await subscriptionService.cancelSubscription(userId, orderId);

      res.status(200).json({
        success: true,
        message: "Subscription cancelled successfully.",
      });
    } catch (error: any) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to cancel subscription.",
      });
    }
  }

  /**
   * Get subscription plans
   * GET /api/subscription/plans
   */
  async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const monthlyPrice = parseInt(process.env.SUBSCRIPTION_MONTHLY_PRICE || "29000");
      const yearlyPrice = parseInt(process.env.SUBSCRIPTION_YEARLY_PRICE || "1000000");

      res.status(200).json({
        success: true,
        data: {
          plans: [
            {
              id: "monthly",
              name: "Pro Chef Monthly",
              price: monthlyPrice,
              currency: "IDR",
              duration: 30,
              durationUnit: "days",
              features: [
                "Unlimited AI Recipe Generation",
                "Access to Premium Recipes",
                "Download Recipe as PDF",
                "Ad-free Experience",
                "Priority Support",
              ],
              savings: 0,
            },
            {
              id: "yearly",
              name: "Pro Chef Yearly",
              price: yearlyPrice,
              currency: "IDR",
              duration: 365,
              durationUnit: "days",
              features: [
                "Unlimited AI Recipe Generation",
                "Access to Premium Recipes",
                "Download Recipe as PDF",
                "Ad-free Experience",
                "Priority Support",
              ],
              savings: Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100),
              popular: true,
            },
          ],
        },
      });
    } catch (error: any) {
      console.error("Get plans error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get plans.",
      });
    }
  }
}

export const subscriptionController = new SubscriptionController();
