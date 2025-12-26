import { ReactNode } from "react";
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileOutlined,
  SettingOutlined,
  AppstoreOutlined,
  PlusOutlined,
  BgColorsOutlined,
  FolderOutlined,
  TagsOutlined,
  CarOutlined,
  CreditCardOutlined,
  TeamOutlined,
  KeyOutlined,
  CommentOutlined,
  RocketOutlined,
  BarChartOutlined,
  BookOutlined,
  FileTextOutlined as FileTextIcon,
  FolderOpenOutlined,
  TagOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

/**
 * Menu item configuration with permission metadata
 *
 * @property key - Unique identifier (used for routing and selection)
 * @property icon - Ant Design icon component
 * @property label - Display text for menu item
 * @property permissions - Array of permissions (ANY match grants access)
 *                         Empty array = always visible to authenticated users
 * @property children - Nested menu items (for parent menus)
 */
export interface MenuItemConfig {
  key: string;
  icon?: ReactNode;
  label: string;
  permissions?: string[];
  children?: MenuItemConfig[];
}

/**
 * Complete menu configuration for admin dashboard
 *
 * Permission Mapping Rules:
 * - Dashboard: No permission required (always visible)
 * - Products section: product.list, product.create, attribute.list
 * - Orders & Shipping: order.list, order_shipment.read
 * - Customers: user.list
 * - Media: media.list
 * - Post & Page section: post.list, taxonomy.list
 * - Payment Gateways: payment_gateway.read
 * - System section: role.list, permission.list, setting.read
 */
export const menuConfig: MenuItemConfig[] = [
  {
    key: "/admin",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    permissions: [], // Always visible to authenticated users
  },
  {
    key: "products",
    icon: <ShoppingOutlined />,
    label: "Products",
    permissions: [], // Parent menu: visibility determined by children
    children: [
      {
        key: "/admin/products",
        icon: <AppstoreOutlined />,
        label: "All Products",
        permissions: ["product.list"], // Maps to: GET /admin/products
      },
      {
        key: "/admin/products/new",
        icon: <PlusOutlined />,
        label: "Add New",
        permissions: ["product.create"], // Maps to: POST /admin/products/simple or /variable
      },
      {
        key: "/admin/attributes",
        icon: <BgColorsOutlined />,
        label: "Attributes",
        permissions: ["attribute.list"], // Maps to: GET /admin/attributes
      },
      {
        key: "/admin/categories",
        icon: <FolderOpenOutlined />,
        label: "Categories",
        permissions: ["taxonomy.list"], // Maps to: GET /admin/categories
      },
      {
        key: "/admin/tags",
        icon: <TagOutlined />,
        label: "Tags",
        permissions: ["taxonomy.list"], // Maps to: GET /admin/tags
      },
      ],
  },
  {
    key: "orders",
    icon: <ShoppingCartOutlined />,
    label: "Orders & Shipping",
    permissions: [], // Parent menu: visibility determined by children
    children: [
      {
        key: "/admin/orders",
        icon: <ShoppingCartOutlined />,
        label: "Orders",
        permissions: ["order.list"], // Maps to: GET /admin/orders
      },
      {
        key: "/admin/orders/stats",
        icon: <BarChartOutlined />,
        label: "Order Statistics",
        permissions: ["order.stats"], // Maps to: GET /admin/orders/stats
      },
      {
        key: "/admin/shipments",
        icon: <CarOutlined />,
        label: "Shipments",
        permissions: ["order_shipment.read"], // Maps to: GET /admin/order-shipments
      },
      {
        key: "/admin/shipping-methods",
        icon: <RocketOutlined />,
        label: "Shipping Methods",
        permissions: ["shipping_method.list"], // Maps to: GET /admin/shipping-methods
      },
    ],
  },
  {
    key: "/admin/customers",
    icon: <UserOutlined />,
    label: "Customers",
    permissions: ["user.list"], // Maps to: GET /admin/users
  },
  {
    key: "media",
    icon: <FileImageOutlined />,
    label: "Media",
    permissions: [], // Parent menu: visibility determined by children
    children: [
      {
        key: "/admin/media",
        icon: <AppstoreOutlined />,
        label: "Library",
        permissions: ["media.list"],
      }
    ],
  },
  {
    key: "content",
    icon: <BookOutlined />,
    label: "Post & Page",
    permissions: [], // Parent menu: visibility determined by children
    children: [
      {
        key: "/admin/posts",
        icon: <FileTextIcon />,
        label: "Articles",
        permissions: ["post.list"], // Maps to: GET /admin/posts
      },
      {
        key: "/admin/pages",
        icon: <FileOutlined />,
        label: "Pages",
        permissions: ["post.list"], // Maps to: GET /admin/posts
      },
    ],
  },
  {
    key: "/admin/comments",
    icon: <CommentOutlined />,
    label: "Comments",
    permissions: ["comment.list"],
  },
  {
    key: "/admin/payment-gateways",
    icon: <CreditCardOutlined />,
    label: "Payment Gateways",
    permissions: ["payment_gateway.read"], // Maps to: GET /admin/payment-gateways
  },
  {
    key: "marketing",
    icon: <ThunderboltOutlined />,
    label: "Marketing",
    permissions: [], // Parent menu: visibility determined by children
    children: [
      {
        key: "/admin/coupons",
        icon: <TagOutlined />,
        label: "Coupons",
        permissions: ["coupon.list"], // Maps to: GET /admin/coupons
      }
    ],
  },
  {
    key: "system",
    icon: <SettingOutlined />,
    label: "System",
    permissions: [], // Parent menu: visibility determined by children
    children: [
      {
        key: "/admin/roles",
        icon: <TeamOutlined />,
        label: "Roles",
        permissions: ["role.list"], // Maps to: GET /admin/roles
      },
      {
        key: "/admin/permissions",
        icon: <KeyOutlined />,
        label: "Permissions",
        permissions: ["permission.list"], // Maps to: GET /admin/permissions
      },
      {
        key: "/admin/settings",
        icon: <SettingOutlined />,
        label: "Settings",
        permissions: ["setting.read"], // Maps to: GET /admin/settings
      },
    ],
  },
];
