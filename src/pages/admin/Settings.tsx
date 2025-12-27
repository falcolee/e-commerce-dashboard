import { useCallback, useState, useEffect } from "react";
import { Tabs, Form, Input, Button, Switch, Select, Card } from "antd";
import type { EmailSettings } from "@/lib/types";
import { SaveOutlined } from "@ant-design/icons";
import api from "@/lib/api";
import { message } from "@/lib/antdApp";

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Load general settings
      const res = await api.settings.list();
      const settingsMap = Array.isArray(res)
        ? res.reduce(
            (
              acc: Record<string, unknown>,
              item: { key: string; value: unknown },
            ) => {
              acc[item.key] = item.value;
              return acc;
            },
            {} as Record<string, unknown>,
          )
        : (res as Record<string, unknown>);

      // Load email settings (API returns structured EmailSettings)
      const emailSettings = await api.email.getSettings();

      form.setFieldsValue({ ...settingsMap, ...emailSettings });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load settings";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onFinish = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      await api.settings.update(values);
      // Persist email settings if present
      const emailPayload: Partial<EmailSettings> = {
        smtp_host: values.smtp_host as string,
        smtp_port: values.smtp_port as number,
        smtp_username: values.smtp_username as string,
        smtp_security: values.smtp_security as string,
        from_email: values.from_email as string,
        from_name: values.from_name as string,
        enabled: values.enabled as boolean,
      };
      if (emailPayload.smtp_host || emailPayload.from_email) {
        await api.email.updateSettings(emailPayload);
      }
      message.success("Settings saved successfully!");
    } catch (error) {
      message.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const testEmail = async () => {
    try {
      const email = form.getFieldValue('from_email') || 'test@example.com';
      await api.email.test({ to: email });
      message.success('Test email sent successfully!');
    } catch (error) {
      message.error('Failed to send test email');
    }
  };

  const items = [
    {
      key: "general",
      label: "General",
      children: (
        <>
          <Form.Item name="site_title" label="Site Title">
            <Input placeholder="E-Commerce Store" />
          </Form.Item>
          <Form.Item name="site_tagline" label="Tagline">
            <Input placeholder="Your one-stop shop" />
          </Form.Item>
          <Form.Item name="admin_email" label="Admin Email">
            <Input type="email" placeholder="admin@example.com" />
          </Form.Item>
          <Form.Item name="timezone" label="Timezone">
            <Select placeholder="UTC">
              <Select.Option value="UTC">UTC</Select.Option>
              <Select.Option value="America/New_York">
                America/New York
              </Select.Option>
              <Select.Option value="Europe/London">Europe/London</Select.Option>
            </Select>
          </Form.Item>
        </>
      ),
    },
    {
      key: "email",
      label: "Email",
      children: (
        <>
          <Form.Item name="smtp_host" label="SMTP Host">
            <Input placeholder="smtp.example.com" />
          </Form.Item>
          <Form.Item name="smtp_port" label="SMTP Port">
            <Input type="number" placeholder="587" />
          </Form.Item>
          <Form.Item name="smtp_username" label="SMTP Username">
            <Input placeholder="user@example.com" />
          </Form.Item>
          <Form.Item name="smtp_password" label="SMTP Password">
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item name="smtp_security" label="SMTP Security">
            <Select placeholder="TLS">
              <Select.Option value="TLS">TLS</Select.Option>
              <Select.Option value="SSL">SSL</Select.Option>
              <Select.Option value="STARTTLS">STARTTLS</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="from_email" label="From Email">
            <Input type="email" placeholder="no-reply@example.com" />
          </Form.Item>
          <Form.Item name="from_name" label="From Name">
            <Input placeholder="PP Shop" />
          </Form.Item>
          <Form.Item
            name="enabled"
            label="Email Enabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      ),
    },
    {
      key: "products",
      label: "Products",
      children: (
        <>
          <Form.Item name="currency" label="Currency">
            <Select placeholder="USD">
              <Select.Option value="USD">USD ($)</Select.Option>
              <Select.Option value="EUR">EUR (€)</Select.Option>
              <Select.Option value="GBP">GBP (£)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="stock_notifications"
            label="Low Stock Notifications"
            valuePropName="checked"
          >
            <Switch defaultChecked />
          </Form.Item>
          <Form.Item name="low_stock_threshold" label="Low Stock Threshold">
            <Input type="number" />
          </Form.Item>
        </>
      ),
    },
    {
      key: "shipping",
      label: "Shipping",
      children: (
        <>
          <Form.Item
            name="enable_shipping"
            label="Enable Shipping"
            valuePropName="checked"
          >
            <Switch defaultChecked />
          </Form.Item>
          <Form.Item name="shipping_cost" label="Default Shipping Cost">
            <Input type="number" prefix="$" />
          </Form.Item>
          <Form.Item
            name="free_shipping_threshold"
            label="Free Shipping Threshold"
          >
            <Input type="number" prefix="$" />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Settings</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          site_title: "E-Commerce Store",
          site_tagline: "Your one-stop shop",
          admin_email: "admin@example.com",
          timezone: "UTC",
          currency: "USD",
          stock_notifications: true,
          low_stock_threshold: 10,
          enable_shipping: true,
          shipping_cost: 10,
          free_shipping_threshold: 100,
          enable_stripe: true,
          enable_paypal: false,
          smtp_security: "TLS",
          enabled: false,
        }}
      >
        <Tabs
          items={items.map((item) => ({
            ...item,
            children: (
              <Card>
                {item.children}
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                  >
                    Save Changes
                  </Button>
                </Form.Item>
              </Card>
            ),
          }))}
        />
      </Form>
    </div>
  );
};

export default Settings;
