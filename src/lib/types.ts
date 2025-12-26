export interface Pagination {
  page: number;
  pageSize: number;  // Changed from page_size
  total: number;
  totalPages: number;  // Changed from total_pages
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  status: number;
  roles: UserRole[];
  permissions?: string[];
  meta?: UserMeta[];
  addresses?: UserAddress[];
  registered_at: string;
  last_login_at?: string;
}

export interface UserRole {
  name: string;
  display_name: string;
}

export interface UserAddress {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export interface UserMeta {
  id: number;
  user_id: number;
  meta_key: string;
  meta_value: string | number | boolean | Record<string, unknown>;
}

export interface Product {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  type: 'simple' | 'variable' | 'variant';
  status: 'draft' | 'publish' | 'archived';
  sku?: string;
  regular_price?: number;
  sale_price?: number;
  stock_quantity?: number;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  manage_stock: boolean;
  description?: string;
  short_description?: string;
  category_ids?: number[];
  tag_ids?: number[];
  attributes?: Record<string, string>;
  variants?: Product[];
  images?: Media[];
  featured_image?: string;
  gallery_images?: string[];
  categories?: Category[];
  tags?: Tag[];
  meta?: ProductMeta[];
  created_at: string;
  updated_at: string;
}

export interface ProductMeta {
  id: number;
  product_id: number;
  parent_id?: number | null;
  meta_key: string;
  meta_value: string | number | boolean | Record<string, unknown>;
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: 'select' | 'color' | 'input' | string;
  order_by: number;
  created_at: string;
  updated_at: string;
  values?: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  name?: string;
  slug?: string;
  meta?: Record<string, unknown>;
  order_by: number;
}

export interface Term {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface TermTaxonomy {
  id: number;
  term_id: number;
  taxonomy: 'product_cat' | 'product_tag' | `pa_${string}`;
  parent_id: number;
  count: number;
  children?: TermTaxonomy[];
  term?: Term;
}

export interface Order {
  id: number;
  order_key: string;
  order_status: string;
  payment_status: string;
  order_total: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  product_name: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
  variant_attributes?: Record<string, string>;
  image_url?: string;
}

export interface OrderTransaction {
  id: number;
  order_id: number;
  transaction_id: string;
  payment_gateway: string;
  transaction_type: 'payment' | 'refund' | string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  slug?: string;
  display_name: string;
  description?: string;
  is_system: boolean;
  users_count?: number;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: 'draft' | 'publish' | 'pending' | 'private';
  type: 'page' | 'post';
  comment_status: 'open' | 'closed';
  parent_id?: number | null;
  template?: string | null;
  menu_order?: number;
  featured_media_id?: number;
  author_id: number;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: number;
  filename: string;
  filepath: string;
  mime_type: string;
  file_size: number;
  url: string;
  alt_text?: string;
  title?: string;
  uploaded_at: string;
}

export interface Comment {
  id: number;
  object_type: 'product' | 'post' | string;
  object_id: number;
  product_id?: number;
  post_id?: number;
  product_name?: string;
  post_title?: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  parent_id?: number;
  created_at: string;
}

export interface PaymentGateway {
  id: number;
  gateway_id: string;
  title: string;
  enabled: boolean;
  description?: string;
  supports_refunds?: boolean;
  supports_subscriptions?: boolean;
  menu_order?: number;
  config: Record<string, string | number | boolean | null | undefined>;
  created_at?: string;
  updated_at?: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percentage';
  amount: number;
  description?: string | null;
  date_expires?: string | null;
  usage_limit?: number | null;
  usage_count: number;
  minimum_amount?: number | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CouponListResponse {
  coupons: Coupon[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CreateCouponRequest {
  code: string;
  type: 'fixed' | 'percentage';
  amount: number;
  description?: string;
  date_expires?: string;
  usage_limit?: number;
  minimum_amount?: number;
  active: boolean;
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {}

export interface Setting {
	key: string;
	value: string | number | boolean | Record<string, unknown>;
	group?: string;
	updated_at?: string;
}

export interface Category {
  id: number;
  term_id: number;
  name: string;
  slug: string;
  parent_id?: number;
  description?: string;
  count?: number;
  menu_order?: number;
  image_url?: string;
  children?: Category[];
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: number;
  term_id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  created_at?: string;
  updated_at?: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthLogin {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Order Shipment types
export interface OrderShipment {
  id: number;
  order_id: number;
  tracking_number: string;
  carrier: string;
  status: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

// Shipping Method types
export interface ShippingMethod {
  id: number;
  name: string;
  code: string;
  enabled: boolean;
  description?: string;
  pricing_type: 'flat_rate' | 'weight_based' | 'price_based' | string;
  base_cost: number;
  additional_cost_per_unit?: number;
  min_order_amount?: number;
  max_order_amount?: number;
  enabled_regions?: string[];
  cost?: number;
  created_at: string;
  updated_at: string;
}

export interface MediaMeta {
  alt_text?: string;
  title: string;
  description?: string;
}

// Token Log types
export interface TokenLog {
  id: number;
  user_id: number;
  token_type: 'access' | 'refresh';
  token_jti: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  expires_at: string;
  is_blacklisted: boolean;
  blacklisted_at?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    display_name: string;
  };
}

export interface TokenLogFilters {
  user_id?: number;
  token_type?: 'access' | 'refresh';
  is_blacklisted?: boolean;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface TokenLogStatistics {
  total_tokens: number;
  active_tokens: number;
  blacklisted_tokens: number;
  expired_tokens: number;
  access_tokens: number;
  refresh_tokens: number;
  tokens_by_user: Array<{
    user_id: number;
    username: string;
    token_count: number;
  }>;
  recent_tokens: TokenLog[];
}

export interface BlacklistTokenRequest {
  token_jti: string;
  reason?: string;
}

export interface BlacklistUserTokensRequest {
  user_id: number;
  reason?: string;
  token_type?: 'access' | 'refresh' | 'all';
}

// Request DTOs
export interface CreateProductRequest {
  name: string;
  slug?: string;
  type: 'simple' | 'variable';
  status: 'draft' | 'publish' | 'archived';
  sku?: string;
  regular_price?: number;
  sale_price?: number;
  stock_quantity?: number;
  manage_stock: boolean;
  description?: string;
  short_description?: string;
  category_ids?: number[];
  tag_ids?: number[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

// Flash Sale Types
export interface FlashSaleCampaign {
  id: number;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  products?: FlashSaleProduct[];
}

export interface FlashSaleProduct {
  id: number;
  flash_sale_id: number;
  product_id: number;
  product_name: string;
  sale_price: number;
  stock: number;
  sold: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFlashSaleCampaignRequest {
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  time_range: [string, string];
}

export interface UpdateFlashSaleCampaignRequest extends Partial<CreateFlashSaleCampaignRequest> {
  id: number;
}

export interface CreateFlashSaleProductRequest {
  product_id: number;
  sale_price: number;
  stock: number;
}

export interface UpdateFlashSaleProductRequest extends Partial<CreateFlashSaleProductRequest> {
  id: number;
}

// Email Management Types
export interface EmailLog {
  id: number;
  receiver: string;
  type: string;
  status: string;
  retry_count: number;
  error_message?: string;
  ip?: string;
  user_id?: number;
  username?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
}

export interface EmailStats {
  total_sent: number;
  total_failed: number;
  total_pending: number;
  success_rate: number;
  total_emails: number;
}

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_security: string;
  from_email: string;
  from_name: string;
  enabled: boolean;
  tested: boolean;
  last_test_at?: string;
}

export interface EmailTemplate {
  template_key: string;
  name: string;
  subject: string;
  content: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLogFilters {
  receiver?: string;
  type?: string;
  status?: string;
  user_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface TestEmailRequest {
  to: string;
}

export interface EmailSettingsRequest {
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_security?: string;
  from_email?: string;
  from_name?: string;
  enabled?: boolean;
}

export interface EmailTemplateRequest {
  subject?: string;
  content?: string;
  enabled?: boolean;
}

export interface DeleteOldEmailLogsRequest {
  older_than_days: number;
}

// Points types
export interface UserPoints {
  id: number;
  user_id: number;
  current_balance: number;
  total_earned: number;
  total_spent: number;
  last_earned_at?: string;
  last_spent_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  transactions?: PointsTransaction[];
}

export interface PointsTransaction {
  id: number;
  user_id: number;
  transaction_type: 'earn' | 'spend' | 'expire' | 'admin_adjust' | 'refund';
  points: number;
  balance_before: number;
  balance_after: number;
  source_type?: 'registration' | 'purchase' | 'review' | 'birthday' | 'promotion' | 'refund' | 'admin' | 'expire';
  source_id?: number;
  description: string;
  reference_id: string;
  expires_at?: string;
  created_at: string;
  created_by?: number;
  user?: User;
  creator?: User;
}

export interface PointsRule {
  id: number;
  rule_type: 'purchase_rate' | 'registration_bonus' | 'review_bonus' | 'birthday_bonus' | 'first_purchase';
  rule_name: string;
  description?: string;
  points_value?: number;
  rate_value?: number;
  min_amount?: number;
  max_points?: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  conditions: string;
  created_at: string;
  updated_at: string;
}

export interface PointsProduct {
  id: number;
  product_id: number;
  points_required: number;
  is_active: boolean;
  max_quantity_per_user?: number;
  stock_quantity?: number;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface PointsStats {
  total_users: number;
  active_users: number;
  total_points_issued: number;
  total_points_redeemed: number;
  average_balance: number;
  top_earners: Array<{
    user_id: number;
    username: string;
    total_earned: number;
    current_balance: number;
  }>;
}

export interface AdjustPointsRequest {
  user_id: number;
  points: number;
  description: string;
  transaction_type: 'admin_adjust';
}

export interface CreatePointsRuleRequest {
  rule_type: 'purchase_rate' | 'registration_bonus' | 'review_bonus' | 'birthday_bonus' | 'first_purchase';
  rule_name: string;
  description?: string;
  points_value?: number;
  rate_value?: number;
  min_amount?: number;
  max_points?: number;
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string;
  conditions?: string;
}

export interface UpdatePointsRuleRequest {
  rule_name?: string;
  description?: string;
  points_value?: number;
  rate_value?: number;
  min_amount?: number;
  max_points?: number;
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string;
  conditions?: string;
}

export interface CreatePointsProductRequest {
  product_id: number;
  points_required: number;
  is_active?: boolean;
  max_quantity_per_user?: number;
  stock_quantity?: number;
  valid_from?: string;
  valid_until?: string;
}
