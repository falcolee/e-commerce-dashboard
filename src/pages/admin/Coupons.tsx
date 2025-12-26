import React, { useMemo, useState } from "react";
import { Card, Table, Button, Space, Tag, Input, Modal, Form, DatePicker, InputNumber, Select, message, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Coupon, CreateCouponRequest, UpdateCouponRequest } from "@/lib/types";
import { getErrorMessage } from "@/lib/error";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Coupons: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { data: couponList, isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => api.coupons.list({ page: 1, page_size: 100 }),
  });
  const coupons = useMemo(() => couponList?.coupons ?? [], [couponList]);

  const createMutation = useMutation({
    mutationFn: (data: CreateCouponRequest) => api.coupons.create(data),
    onSuccess: () => {
      message.success("Coupon created successfully");
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, "Failed to create coupon"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCouponRequest }) =>
      api.coupons.update(id, data),
    onSuccess: () => {
      message.success("Coupon updated successfully");
      setIsModalVisible(false);
      setEditingCoupon(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, "Failed to update coupon"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.coupons.delete(id),
    onSuccess: () => {
      message.success("Coupon deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, "Failed to delete coupon"));
    },
  });

  const handleCreate = () => {
    setEditingCoupon(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    form.setFieldsValue(coupon);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = async (values: CreateCouponRequest | UpdateCouponRequest) => {
    try {
      if (editingCoupon) {
        updateMutation.mutate({ id: editingCoupon.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const getStatusColor = (active: boolean) => {
    return active ? "green" : "red";
  };

  const columns: ColumnsType<Coupon> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: string | number | boolean, record) =>
        record.code.toLowerCase().includes(value.toString().toLowerCase()),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record) => 
        record.type === "percentage" ? `${amount}%` : `$${amount}`,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (active: boolean) => (
        <Tag color={getStatusColor(active)}>
          {active ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Usage",
      dataIndex: "usage_count",
      key: "usage_count",
      render: (count: number, record) => 
        `${count} / ${record.usage_limit || "∞"}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this coupon?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title="Coupon Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create Coupon
          </Button>
        }
      >
        <div className="mb-4">
          <Input
            placeholder="Search coupons..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            total: couponList?.total,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      <Modal
        title={editingCoupon ? "Edit Coupon" : "Create Coupon"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCoupon(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: "fixed",
            active: true,
          }}
        >
          <Form.Item
            name="code"
            label="Coupon Code"
            rules={[{ required: true, message: "Please enter coupon code" }]}
          >
            <Input placeholder="Enter coupon code" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter coupon description" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Discount Type"
            rules={[{ required: true, message: "Please select discount type" }]}
          >
            <Select placeholder="Select discount type">
              <Option value="fixed">Fixed Amount</Option>
              <Option value="percentage">Percentage</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Discount Amount"
            rules={[{ required: true, message: "Please enter discount amount" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter discount amount"
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="minimum_amount"
            label="Minimum Order Amount"
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter minimum order amount"
              min={0}
              formatter={(value) => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="usage_limit"
            label="Usage Limit"
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter usage limit (leave empty for unlimited)"
              min={1}
            />
          </Form.Item>

          <Form.Item
            name="active"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingCoupon ? "Update" : "Create"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingCoupon(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Coupons;
