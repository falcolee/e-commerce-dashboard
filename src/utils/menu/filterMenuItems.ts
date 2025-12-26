import type { MenuProps } from "antd";
import type { MenuItemConfig } from "@/config/menuConfig";

/**
 * Filters menu items based on user permissions with recursive support for nested menus
 *
 * Logic:
 * 1. For items with children: recursively filter children, hide parent if no children visible
 * 2. For leaf items: check if user has ANY of the required permissions
 * 3. Items with empty permissions array are always visible
 *
 * @param items - Menu configuration items
 * @param hasPermission - Permission checking function from AuthContext
 * @returns Filtered menu items in Ant Design MenuProps format
 */
export const filterMenuItems = (
  items: MenuItemConfig[],
  hasPermission: (required: string | string[]) => boolean
): MenuProps["items"] => {
  return items
    .map((item) => {
      // Handle parent menus with children
      if (item.children && item.children.length > 0) {
        // Recursively filter children
        const filteredChildren = filterMenuItems(item.children, hasPermission);

        // Hide parent if no children are visible
        if (!filteredChildren || filteredChildren.length === 0) {
          return null;
        }

        // Return parent with filtered children
        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: filteredChildren,
        };
      }

      // Handle leaf menu items
      const permissions = item.permissions ?? [];

      // No permissions required = always visible (e.g., Dashboard)
      if (permissions.length === 0) {
        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
        };
      }

      // Check if user has ANY of the required permissions
      // hasPermission returns true if user has "*" (super admin) or any listed permission
      const hasAccess = hasPermission(permissions);

      return hasAccess
        ? {
            key: item.key,
            icon: item.icon,
            label: item.label,
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

/**
 * Converts full menu config to Ant Design menu format without filtering
 * Used for super admin users who see all menus
 *
 * @param items - Menu configuration items
 * @returns All menu items in Ant Design MenuProps format
 */
export const convertToAntdMenu = (
  items: MenuItemConfig[]
): MenuProps["items"] => {
  return items.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    children: item.children ? convertToAntdMenu(item.children) : undefined,
  }));
};
