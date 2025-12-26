import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, message, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { ShippingMethod } from '@/lib/types';
import MethodCard from '@/components/shipping/MethodCard';
import MethodForm, { ShippingMethodFormValues } from '@/components/shipping/MethodForm';

const ShippingMethods = () => {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await api.shippingMethods.list();
      setMethods(res || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load shipping methods';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedMethod(null);
    setModalVisible(true);
  };

  const handleEdit = (method: ShippingMethod) => {
    setSelectedMethod(method);
    setModalVisible(true);
  };

  const handleToggle = async (method: ShippingMethod) => {
    Modal.confirm({
      title: `${method.enabled ? 'Disable' : 'Enable'} Shipping Method`,
      content: `Are you sure you want to ${method.enabled ? 'disable' : 'enable'} ${method.name}?`,
      okText: method.enabled ? 'Disable' : 'Enable',
      okType: method.enabled ? 'danger' : 'primary',
      onOk: async () => {
        try {
          await api.shippingMethods.update(method.id, {
            enabled: !method.enabled,
          });
          message.success(`${method.name} ${method.enabled ? 'disabled' : 'enabled'} successfully`);
          fetchMethods();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to toggle method';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleDelete = (method: ShippingMethod) => {
    Modal.confirm({
      title: 'Delete Shipping Method',
      content: `Are you sure you want to delete "${method.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.shippingMethods.delete(method.id);
          message.success(`${method.name} deleted successfully`);
          fetchMethods();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete method';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleSave = async (values: ShippingMethodFormValues) => {
    try {
      if (selectedMethod) {
        await api.shippingMethods.update(selectedMethod.id, values);
        message.success('Shipping method updated successfully');
        setModalVisible(false);
        setSelectedMethod(null);
        fetchMethods();
      } else {
        await api.shippingMethods.create(values);
        message.success('Shipping method created successfully');
        setModalVisible(false);
        fetchMethods();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save shipping method';
      message.error(errorMessage);
      throw error;
    }
  };

  const enabledMethods = methods.filter(m => m.enabled);
  const disabledMethods = methods.filter(m => !m.enabled);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Shipping Methods</h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>
            Manage shipping methods and pricing rules
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={fetchMethods} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Method
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Enabled Methods */}
          {enabledMethods.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>Enabled Methods</h2>
              <Row gutter={[16, 16]}>
                {enabledMethods.map((method) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={method.id}>
                    <MethodCard
                      method={method}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Disabled Methods */}
          {disabledMethods.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>Disabled Methods</h2>
              <Row gutter={[16, 16]}>
                {disabledMethods.map((method) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={method.id}>
                    <MethodCard
                      method={method}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {methods.length === 0 && (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ fontSize: 16, color: '#999', marginBottom: 16 }}>No shipping methods available</p>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  Create First Method
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={`${selectedMethod ? 'Edit' : 'Create'} Shipping Method`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedMethod(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <MethodForm
          method={selectedMethod || undefined}
          onSave={handleSave}
          onCancel={() => {
            setModalVisible(false);
            setSelectedMethod(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default ShippingMethods;
