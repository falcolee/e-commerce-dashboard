import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { filterMenuItems, convertToAntdMenu } from "@/utils/menu/filterMenuItems";
import type { MenuItemConfig } from "@/config/menuConfig";
import type { MenuProps } from "antd";

/**
 * Custom hook to filter menu items based on current user's permissions
 *
 * Features:
 * - Automatically detects super admin (permissions includes "*")
 * - Memoizes result to prevent unnecessary re-renders
 * - Updates when user permissions change (e.g., login, token refresh)
 *
 * @param menuConfig - Menu configuration with permission metadata
 * @returns Filtered menu items ready for Ant Design Menu component
 */
export const useFilteredMenu = (
  menuConfig: MenuItemConfig[]
): MenuProps["items"] => {
  const { hasPermission, permissions } = useAuth();

  return useMemo(() => {
    // Super admin bypass: show all menus without filtering
    const isSuperAdmin = permissions?.includes("*") ?? false;

    if (isSuperAdmin) {
      return convertToAntdMenu(menuConfig);
    }

    // Filter menu items based on user permissions
    return filterMenuItems(menuConfig, hasPermission);
  }, [menuConfig, permissions, hasPermission]);
};
