import { Request, Response, NextFunction } from "express";
import { subscriptionService } from "../services/subscription.service";

interface SubscriptionInfo {
  isPro: boolean;
  planType: string | null;
  status: string | null;
  endDate: string | null;
  daysRemaining: number;
}

/**
 * Middleware to check if user has active Pro subscription
 * Use this on routes that require Pro access
 */
export const requirePro = async (req: Request, res: Response, next: NextFunction) => {
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

    if (!subscription || !subscription.isPro) {
      res.status(403).json({
        success: false,
        message: "Pro Chef subscription required. Upgrade to unlock this feature!",
        upgradeRequired: true,
      });
      return;
    }

    // Attach subscription info to request for later use
    req.subscription = subscription;
    next();
  } catch (error: any) {
    console.error("Require Pro middleware error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify subscription status.",
    });
  }
};

/**
 * Optional Pro check - doesn't block, but attaches subscription status to request
 */
export const optionalPro = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      const subscription = await subscriptionService.getUserSubscription(userId);
      req.subscription = subscription || {
        isPro: false,
        planType: null,
        status: null,
        endDate: null,
        daysRemaining: 0,
      };
    } else {
      req.subscription = {
        isPro: false,
        planType: null,
        status: null,
        endDate: null,
        daysRemaining: 0,
      };
    }

    next();
  } catch (error) {
    console.error("Optional Pro middleware error:", error);
    // Don't block, just continue without subscription info
    req.subscription = {
      isPro: false,
      planType: null,
      status: null,
      endDate: null,
      daysRemaining: 0,
    };
    next();
  }
};

// Extend Express Request type to include subscription
declare global {
  namespace Express {
    interface Request {
      subscription?: SubscriptionInfo;
    }
  }
}
