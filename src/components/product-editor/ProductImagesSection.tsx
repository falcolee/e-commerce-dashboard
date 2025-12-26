import { Card, Upload, Image, Space, Button, message } from 'antd';
import { PlusOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface';
import api from '@/lib/api';

interface ProductImagesSectionProps {
  initialValues?: {
    featured_image?: string;
    gallery_images?: string[];
  };
  onChange?: (values: { featured_image?: string; gallery_images?: string[] }) => void;
}

const ProductImagesSection: React.FC<ProductImagesSectionProps> = ({
  initialValues,
  onChange
}) => {
  const [featuredImage, setFeaturedImage] = useState<UploadFile | null>(null);
  const [galleryImages, setGalleryImages] = useState<UploadFile[]>([]);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const featuredObjectUrlRef = useRef<string>();

  // Initialize with existing product data
  useEffect(() => {
    if (initialValues?.featured_image) {
      setFeaturedPreview(initialValues.featured_image);
      setFeaturedImage({
        uid: '-1',
        name: 'featured-image',
        status: 'done',
        url: initialValues.featured_image,
      });
    }

    if (initialValues?.gallery_images && initialValues.gallery_images.length > 0) {
      const initialGalleryImages: UploadFile[] = initialValues.gallery_images.map((url, index) => ({
        uid: `-${index + 2}`,
        name: `gallery-image-${index}`,
        status: 'done',
        url,
      }));
      setGalleryImages(initialGalleryImages);
    }
  }, [initialValues]);

  useEffect(() => {
    if (featuredObjectUrlRef.current) {
      URL.revokeObjectURL(featuredObjectUrlRef.current);
      featuredObjectUrlRef.current = undefined;
    }

    if (!featuredImage) {
      setFeaturedPreview(null);
      return;
    }

    if (featuredImage.url) {
      setFeaturedPreview(featuredImage.url);
      return;
    }

    if (featuredImage.thumbUrl) {
      setFeaturedPreview(featuredImage.thumbUrl);
      return;
    }

    if (featuredImage.originFileObj) {
      const objectUrl = URL.createObjectURL(featuredImage.originFileObj as Blob);
      featuredObjectUrlRef.current = objectUrl;
      setFeaturedPreview(objectUrl);
      return;
    }

    setFeaturedPreview(null);
  }, [featuredImage]);

  useEffect(() => () => {
    if (featuredObjectUrlRef.current) {
      URL.revokeObjectURL(featuredObjectUrlRef.current);
    }
  }, []);

  // Update form values when images change
  useEffect(() => {
    const featuredImageUrl = featuredImage?.url || '';
    const galleryImageUrls = galleryImages
      .filter(img => img.url)
      .map(img => img.url as string);

    onChange?.({
      featured_image: featuredImageUrl || undefined,
      gallery_images: galleryImageUrls.length > 0 ? galleryImageUrls : undefined,
    });
  }, [featuredImage, galleryImages, onChange]);

  const handleUpload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const response = await api.media.upload(file, {
        title: file.name,
        alt_text: file.name,
      });
      return response.url;
    } catch (error) {
      message.error('Failed to upload image');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFeaturedUpload = async (file: File) => {
    try {
      const url = await handleUpload(file);
      const uploadFile: UploadFile = {
        uid: `-${Date.now()}`,
        name: file.name,
        status: 'done',
        url,
      };
      setFeaturedImage(uploadFile);
      message.success('Featured image uploaded successfully');
    } catch (error) {
      // Error already handled in handleUpload
    }
  };

  const handleGalleryUpload = async (file: File) => {
    try {
      const url = await handleUpload(file);
      const uploadFile: UploadFile = {
        uid: `-${Date.now()}-${Math.random()}`,
        name: file.name,
        status: 'done',
        url,
      };
      setGalleryImages(prev => [...prev, uploadFile]);
      message.success('Gallery image uploaded successfully');
    } catch (error) {
      // Error already handled in handleUpload
    }
  };

  const handleFeaturedChange = ({ file }: UploadChangeParam<UploadFile>) => {
    if (file.status === 'removed') {
      setFeaturedImage(null);
      setFeaturedPreview(null);
      return;
    }

    if (file.originFileObj && file.status !== 'done') {
      handleFeaturedUpload(file.originFileObj as File);
    }
  };

  const handleGalleryChange = ({ fileList }: UploadChangeParam<UploadFile>) => {
    // Filter out removed files and process new uploads
    const validFiles = fileList.filter(file => {
      if (file.status === 'removed') {
        return false;
      }
      if (file.originFileObj && file.status !== 'done') {
        // Handle new upload
        handleGalleryUpload(file.originFileObj as File);
        return false; // Will be added after successful upload
      }
      return true;
    });
    setGalleryImages(validFiles);
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Card title="Product Images" className="shadow-sm">
      <Space direction="vertical" size="large" className="w-full">
        {/* Featured Image */}
        <div>
          <div className="text-sm font-medium mb-2">Featured Image</div>
          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleFeaturedChange}
            disabled={uploading}
          >
            {featuredPreview ? (
              <div className="relative group">
                <Image
                  src={featuredPreview}
                  alt="Featured"
                  preview={false}
                  className="w-full h-full object-cover"
                />
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFeaturedImage(null);
                    setFeaturedPreview(null);
                  }}
                />
              </div>
            ) : (
              uploadButton
            )}
          </Upload>
        </div>

        {/* Gallery Images */}
        <div>
          <div className="text-sm font-medium mb-2">Product Gallery</div>
          <Upload
            listType="picture-card"
            fileList={galleryImages}
            beforeUpload={() => false}
            onChange={handleGalleryChange}
            multiple
            disabled={uploading}
          >
            {galleryImages.length >= 8 ? null : uploadButton}
          </Upload>
        </div>
      </Space>
    </Card>
  );
};

export default ProductImagesSection;
