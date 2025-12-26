import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { LoginOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 16 }}>
          E-Commerce Admin
        </h1>
        <p style={{ fontSize: 24, marginBottom: 32, opacity: 0.9 }}>
          Powerful dashboard for managing your online store
        </p>
        <Link to={admin ? "/admin" : "/login"}>
          <Button type="primary" size="large" icon={<LoginOutlined />}>
            {admin ? "Go to Admin Dashboard" : "Login to Dashboard"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
