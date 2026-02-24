export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[] | null;
  verified: boolean;
  createdAt: string;
  type?: string;
}

export interface ReviewsMeta {
  total: number;
  averageRating: number;
  ratingDistribution: number[];
}

export interface ReviewFormData {
  rating: number;
  title: string;
  body: string;
  images: File[];
}

export type ReviewsTabs = "reviews" | "questions" | "write";
export type ReviewsTab = ReviewsTabs;

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

export interface ClientConfigTheme {
  color: string;
  mainButtonIcon: string;
  buttonTextColor: string;
  secondaryButtonIcon: string;
  buttonBackgroundColor: string;
}

export interface ClientConfigLanguage {
  local: string;
  direction: "ltr" | "rtl";
}

export interface EarnSection {
  title: string;
  earnAmount: string;
  description: string;
}

export interface ConfigVariable {
  name: string;
  value: string;
}

export interface Interaction {
  trigger: string;
  pointsGained: number;
}

export interface Condition {
  status: string;
  maxAmount: number;
  minAmount: number;
  pointsGained: number;
}

export interface WidgetClientConfig {
  theme: ClientConfigTheme;
  language: ClientConfigLanguage;
  localizations: Record<string, Record<string, string>>;
  earnSections: EarnSection[];
  variables: ConfigVariable[];
  interactions: Interaction[];
  conditions: Condition[];
}

export interface UserDetails {
  isLoggedIn: boolean;
  email?: string | null;
  name?: string | null;
  points?: number;
  referralCode?: string | null;
}

export interface WidgetContext {
  product?: {
    id: number;
    hasPurchased: boolean;
  } | null;
}

export interface WidgetConfig {
  enabled: boolean;
  widgets: string[];
  styles: {
    primaryColor?: string;
    position: "left" | "right";
  };
  apiKey?: string;
  shop?: string;
  clientId?: string;
  clientConfig?: WidgetClientConfig | null;
  user?: UserDetails;
  context?: WidgetContext;
}

export interface WidgetModule {
  mount: (container: HTMLElement, config: WidgetConfig) => void;
}

export interface WidgetTheme {
  primaryColor: string;
  textColor: string;
  position: "left" | "right";
  isRTL: boolean;
}

export interface WidgetConfigResponse extends WidgetConfig {}

export interface CustomerResponse {
  exists: boolean;
  customer: CustomerData | null;
}

export interface ReviewsResponse {
  reviews: Review[];
  meta: ReviewsMeta;
}

export interface CustomerRequest {
  shop: string;
  email: string;
}

export interface ReviewsRequest {
  shop: string;
  type?: "website" | "product";
  productId?: number;
  limit?: number;
  offset?: number;
}
