import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import ProductEditor from "./pages/admin/ProductEditor";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import MediaPage from "./pages/admin/Media";
import Posts from "./pages/admin/Posts";
import Pages from "./pages/admin/Pages";
import Roles from "./pages/admin/Roles";
import Permissions from "./pages/admin/Permissions";
import Attributes from "./pages/admin/Attributes";
import Settings from "./pages/admin/Settings";
import Categories from "./pages/admin/Categories";
import Tags from "./pages/admin/Tags";
import PaymentGateways from "./pages/admin/PaymentGateways";
import Shipments from "./pages/admin/Shipments";
import ShippingMethods from "./pages/admin/ShippingMethods";
import Comments from "./pages/admin/Comments";
import Coupons from "./pages/admin/Coupons";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  return admin ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductEditor />} />
            <Route path="products/:id/edit" element={<ProductEditor />} />
            <Route path="categories" element={<Categories />} />
            <Route path="tags" element={<Tags />} />
            <Route path="orders" element={<Orders />} />
            <Route path="shipments" element={<Shipments />} />
            <Route path="customers" element={<Customers />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="posts" element={<Posts />} />
            <Route path="pages" element={<Pages />} />
            <Route path="roles" element={<Roles />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="attributes" element={<Attributes />} />
            <Route path="payment-gateways" element={<PaymentGateways />} />
            <Route path="shipping-methods" element={<ShippingMethods />} />
            <Route path="comments" element={<Comments />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
