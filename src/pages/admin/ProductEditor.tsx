import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Form, Button, Space, message, Spin, Modal } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { Product, Category, Tag } from '@/lib/types';

// Left Column Components
import ProductTitleSection from '@/components/product-editor/ProductTitleSection';
import ProductImagesSection from '@/components/product-editor/ProductImagesSection';
import ProductDescriptionSection from '@/components/product-editor/ProductDescriptionSection';
import ProductPricingSection from '@/components/product-editor/ProductPricingSection';
import ProductInventorySection from '@/components/product-editor/ProductInventorySection';
import ProductShippingSection from '@/components/product-editor/ProductShippingSection';
import ProductAttributesSection from '@/components/product-editor/ProductAttributesSection';
import ProductVariationsSection from '@/components/product-editor/ProductVariationsSection';

// Right Column Components
import ProductTypeBox from '@/components/product-editor/ProductTypeBox';
import ProductStatusBox from '@/components/product-editor/ProductStatusBox';
import ProductCategoriesBox from '@/components/product-editor/ProductCategoriesBox';
import ProductTagsBox from '@/components/product-editor/ProductTagsBox';
import ProductAttributesBox from '@/components/product-editor/ProductAttributesBox';
import ProductInfoBox from '@/components/product-editor/ProductInfoBox';

const { Content } = Layout;

type ProductDetail = Product & {
  categories?: Category[];
  tags?: Tag[];
};

const normalizeTaxonomyIds = (ids?: Array<number | string>): number[] => {
  if (!Array.isArray(ids)) return [];
  return ids
    .map((value) => {
      if (typeof value === 'number') return value;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    })
    .filter((value): value is number => value !== null);
};

const ProductEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [productType, setProductType] = useState<'simple' | 'variable'>('simple');
  const [hasVariations, setHasVariations] = useState(false);
  const [imageData, setImageData] = useState<{ featured_image?: string; gallery_images?: string[] }>({});

  useEffect(() => {
    if (!id) {
      form.setFieldsValue({
        status: 'draft',
        manage_stock: false,
        stock_status: 'instock',
        category_ids: [],
        tag_ids: [],
      });
    }
  }, [id, form]);

  const loadProduct = useCallback(async (productId: number) => {
    setLoading(true);
    try {
      const response = await api.products.get(productId);
      const productData = response as ProductDetail;
      const nextType: 'simple' | 'variable' =
        productData.type === 'variable' ? 'variable' : 'simple';
      setProduct(productData);
      setProductType(nextType);
      setHasVariations(Boolean(productData.variants && productData.variants.length > 0));

      const categoryIds =
        productData.categories?.map((category) => category.term_id ?? category.id) ?? [];
      const tagIds = productData.tags?.map((tag) => tag.term_id ?? tag.id) ?? [];

      // Set image data separately
      setImageData({
        featured_image: productData.featured_image || undefined,
        gallery_images: productData.gallery_images || undefined,
      });

      form.setFieldsValue({
        ...productData,
        category_ids: categoryIds,
        tag_ids: tagIds,
        attributes: productData.attributes || {},
        // Don't set image fields in form since they're handled separately
        featured_image: undefined,
        gallery_images: undefined,
      });
    } catch (error) {
      message.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  }, [form, navigate]);

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id, 10));
    }
  }, [id, loadProduct]);



  const handleTypeChange = (newType: 'simple' | 'variable') => {
    if (productType === 'variable' && newType === 'simple' && hasVariations) {
      Modal.warning({
        title: 'Cannot Switch Type',
        content: 'This product has variations. Please delete all variations before switching to Simple product.',
      });
      return;
    }

    if (productType === 'simple' && newType === 'variable') {
      Modal.confirm({
        title: 'Switch to Variable Product?',
        content: 'Switching to a variable product will allow you to create variations. Continue?',
        onOk: () => {
          setProductType(newType);
          form.setFieldValue('type', newType);
        },
      });
      return;
    }

    setProductType(newType);
    form.setFieldValue('type', newType);
  };

  const handleSave = async (publish = false) => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const categoryIds = normalizeTaxonomyIds(values.category_ids);
      const tagIds = normalizeTaxonomyIds(values.tag_ids);
      const status = publish ? 'publish' : values.status || 'draft';

      const basePayload = {
        ...values,
        status,
        category_ids: categoryIds,
        tag_ids: tagIds,
        manage_stock: values.manage_stock ?? false,
        // Include image data
        featured_image: imageData.featured_image,
        gallery_images: imageData.gallery_images || [],
      };

      if (id) {
        const { type: _type, ...updatePayload } = basePayload;
        await api.products.update(parseInt(id, 10), updatePayload);
        message.success('Product updated successfully');
        return;
      }

      if (productType === 'variable') {
        const variablePayload = {
          name: basePayload.name,
          slug: basePayload.slug,
          status: basePayload.status,
          description: basePayload.description,
          short_description: basePayload.short_description,
          featured_image: basePayload.featured_image,
          gallery_images: basePayload.gallery_images || [],
          category_ids: basePayload.category_ids,
          tag_ids: basePayload.tag_ids,
          meta: basePayload.meta || {},
        };
        const response = await api.products.createVariable(variablePayload);
        message.success('Product created successfully');
        navigate(`/admin/products/${response.id}/edit`);
        return;
      }

      const simplePayload = {
        name: basePayload.name,
        slug: basePayload.slug,
        status: basePayload.status,
        description: basePayload.description,
        short_description: basePayload.short_description,
        sku: basePayload.sku,
        regular_price: basePayload.regular_price,
        sale_price: basePayload.sale_price,
        manage_stock: basePayload.manage_stock,
        stock_quantity: basePayload.stock_quantity,
        stock_status: basePayload.stock_status,
        featured_image: basePayload.featured_image,
        gallery_images: basePayload.gallery_images || [],
        weight: basePayload.weight,
        length: basePayload.length,
        width: basePayload.width,
        height: basePayload.height,
        category_ids: basePayload.category_ids,
        tag_ids: basePayload.tag_ids,
        meta: basePayload.meta || {},
      };
      const response = await api.products.createSimple(simplePayload);
      message.success('Product created successfully');
      navigate(`/admin/products/${response.id}/edit`);
    } catch (err) {
      const hasValidationErrors = Boolean((err as { errorFields?: unknown[] })?.errorFields);
      if (hasValidationErrors) {
        message.error('Please fill in all required fields');
      } else {
        const apiMessage =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        message.error(apiMessage || 'Failed to save product');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-6 py-3">
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/products')}
            >
              Back to Products
            </Button>
            <span className="text-lg font-semibold text-foreground">
              {id ? 'Edit Product' : 'New Product'}
            </span>
          </Space>
          <Space>
            <Button onClick={() => handleSave(false)} loading={saving}>
              Save Draft
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => handleSave(true)}
              loading={saving}
            >
              Publish
            </Button>
          </Space>
        </div>
      </div>

      {/* Main Content */}
      <Content className="p-6">
        <Form
          form={form}
          layout="vertical"
          className="flex gap-6"
          initialValues={{
            status: 'draft',
            manage_stock: false,
            stock_status: 'instock',
            category_ids: [],
            tag_ids: [],
          }}
        >
          {/* Left Column - Main Content (70%) */}
          <div className="flex-[7] space-y-6">
            <ProductTitleSection />
            <ProductImagesSection
              initialValues={imageData}
              onChange={setImageData}
            />
            <ProductDescriptionSection />
            <ProductPricingSection productType={productType} />
            <ProductInventorySection productType={productType} />
            <ProductShippingSection />
            <ProductAttributesSection productType={productType} />
            {productType === 'variable' && (
              <ProductVariationsSection
                productId={id ? parseInt(id) : undefined}
                onVariationsChange={(hasVars) => setHasVariations(hasVars)}
              />
            )}
          </div>

          {/* Right Column - Meta Boxes (30%) */}
          <div className="flex-[3] space-y-4 sticky top-20 h-fit">
            <ProductTypeBox
              value={productType}
              onChange={handleTypeChange}
              disabled={hasVariations && productType === 'variable'}
            />
            <ProductStatusBox />
            <ProductCategoriesBox />
            <ProductTagsBox />
            <ProductAttributesBox />
            <ProductInfoBox product={product} />
          </div>
        </Form>
      </Content>
    </Layout>
  );
};

export default ProductEditor;
