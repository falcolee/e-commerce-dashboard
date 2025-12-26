import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, Button, theme } from "antd";
import {
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import type { MenuProps } from "antd";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useFilteredMenu } from "@/hooks/useFilteredMenu";
import { menuConfig } from "@/config/menuConfig";
import { useAuth } from "@/contexts/AuthContext";
import md5 from "crypto-js/md5";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, admin } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Use filtered menu based on user permissions
  const menuItems = useFilteredMenu(menuConfig);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: async () => {
        await logout();
        navigate("/login");
      },
    },
  ];

  const displayName = admin?.display_name || admin?.username;

  let avatarContent: React.ReactNode;
  if (admin?.email) {
    const hash = md5(admin.email.trim().toLowerCase()).toString();
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}`;
    avatarContent = <Avatar src={gravatarUrl} />;
  } else if (displayName) {
    avatarContent = <Avatar>{displayName.charAt(0).toUpperCase()}</Avatar>;
  } else {
    avatarContent = <Avatar icon={<UserOutlined />} />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: collapsed ? "20px" : "24px",
            fontWeight: "bold",
            color: "#1890ff",
          }}
        >
          {collapsed ? "EA" : "E-Admin"}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <ThemeToggle />
            <Badge count={5} offset={[-5, 5]}>
              <BellOutlined style={{ fontSize: "18px", cursor: "pointer" }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                {avatarContent}
                <span>{displayName}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
