import { v4 as uuidv4 } from "uuid";
import { supabase } from "../config/supabase";
import { snap, coreApi } from "../config/midtrans";

export type PlanType = "monthly" | "yearly";
export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

export interface CreateSubscriptionParams {
  userId: string;
  planType: PlanType;
  email: string;
  phone?: string;
  name?: string;
}

export interface SubscriptionResponse {
  orderId: string;
  snapToken: string;
  redirectUrl: string;
  price: number;
  planType: PlanType;
}

export class SubscriptionService {
  private monthlyPrice = parseInt(process.env.SUBSCRIPTION_MONTHLY_PRICE || "29000");
  private yearlyPrice = parseInt(process.env.SUBSCRIPTION_YEARLY_PRICE || "1000000");

  /**
   * Create a new subscription and get payment token
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResponse> {
    const { userId, planType, email, phone, name } = params;
    
    // Generate unique order ID
    const orderId = `PRO-CHEF-${uuidv4().substring(0, 8).toUpperCase()}-${Date.now()}`;
    
    // Determine price based on plan
    const price = planType === "monthly" ? this.monthlyPrice : this.yearlyPrice;
    const duration = planType === "monthly" ? 30 : 365;
    
    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

    // Create subscription record in database
    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_type: planType,
        status: "pending",
        midtrans_order_id: orderId,
        price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

    if (insertError) {
      console.error("Failed to create subscription record:", insertError);
      throw new Error("Failed to create subscription");
    }

    // Create Midtrans payment snap token
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      customer_details: {
        email,
        phone: phone || "",
        first_name: name || "User",
      },
      enabled_payments: [
        "credit_card",
        "bca_va",
        "bri_va",
        "mandiri_va",
        "permata_va",
        "gopay",
        "gopaypaylater",
        "shopeepay",
        "qris",
        "danamon_online",
        "bca_klikpay",
        "bca_klikbca",
      ],
      callbacks: {
        finish: `${process.env.FRONTEND_URL || "http://localhost:3000"}/subscription/callback`,
      },
    };

    try {
      const snapResponse = await snap.createTransaction(parameter) as any;
      
      return {
        orderId,
        snapToken: snapResponse.token,
        redirectUrl: snapResponse.redirect_url,
        price,
        planType,
      };
    } catch (error: any) {
      console.error("Failed to create Midtrans transaction:", error);
      
      // Rollback database record
      await supabase.from("subscriptions").delete().eq("midtrans_order_id", orderId);
      
      throw new Error("Failed to create payment transaction");
    }
  }

  /**
   * Handle Midtrans webhook notification
   */
  async handleWebhookNotification(payload: any): Promise<void> {
    const { order_id, transaction_status, fraud_status, payment_type } = payload;

    console.log(`Webhook received: Order ${order_id}, Status: ${transaction_status}`);

    // Find subscription by order ID
    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("midtrans_order_id", order_id)
      .single();

    if (fetchError || !subscription) {
      console.error("Subscription not found for order:", order_id);
      throw new Error("Subscription not found");
    }

    // Don't process if already active
    if (subscription.status === "active") {
      console.log("Subscription already active, skipping");
      return;
    }

    let newStatus: SubscriptionStatus = subscription.status;

    // Determine new status based on transaction status
    switch (transaction_status) {
      case "capture":
        // For credit card
        if (fraud_status === "accept") {
          newStatus = "active";
        }
        break;
      case "settlement":
        // For bank transfer, e-wallet, etc.
        newStatus = "active";
        break;
      case "pending":
        newStatus = "pending";
        break;
      case "deny":
      case "expire":
      case "cancel":
        newStatus = "cancelled";
        break;
      case "refund":
      case "chargeback":
        newStatus = "cancelled";
        break;
    }

    // Update subscription status
    const updateData: any = {
      status: newStatus,
      midtrans_transaction_id: payload.transaction_id || null,
      payment_method: payment_type || null,
      updated_at: new Date().toISOString(),
    };

    // If activated, set the actual start date
    if (newStatus === "active" && !subscription.start_date) {
      updateData.start_date = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("midtrans_order_id", order_id);

    if (updateError) {
      console.error("Failed to update subscription status:", updateError);
      throw new Error("Failed to update subscription");
    }

    console.log(`Subscription ${order_id} updated to: ${newStatus}`);
  }

  /**
   * Check transaction status from Midtrans
   */
  async checkTransactionStatus(orderId: string): Promise<any> {
    try {
      const status = await coreApi.transactionStatus(orderId);
      return status;
    } catch (error: any) {
      console.error("Failed to check transaction status:", error);
      throw new Error("Failed to check transaction status");
    }
  }

  /**
   * Get user's current subscription status
   */
  async getUserSubscription(userId: string): Promise<{
    isPro: boolean;
    planType: string | null;
    status: string | null;
    endDate: string | null;
    daysRemaining: number;
  } | null> {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    const endDate = new Date(data.end_date);
    const now = new Date();
    const isActive = data.status === "active" && endDate > now;
    const daysRemaining = isActive
      ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      isPro: isActive,
      planType: data.plan_type,
      status: data.status,
      endDate: data.end_date,
      daysRemaining,
    };
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string, orderId: string): Promise<void> {
    // First, cancel on Midtrans side
    try {
      await coreApi.cancelTransaction(orderId);
    } catch (error: any) {
      console.log("Failed to cancel on Midtrans (may already be cancelled):", error.message);
    }

    // Update local database
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("midtrans_order_id", orderId);

    if (error) {
      throw new Error("Failed to cancel subscription");
    }
  }
}

export const subscriptionService = new SubscriptionService();
