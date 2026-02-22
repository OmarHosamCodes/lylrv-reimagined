export interface CustomerData {
  totalPoints: number;
  referralCode: string | null;
  recentActivity: PointsActivity[];
  activeCoupons: ActiveCoupon[];
}

export interface PointsActivity {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface ActiveCoupon {
  id: string;
  code: string;
  amount: number;
}

export type LoyaltyTab = "home" | "earn" | "redeem" | "history";
