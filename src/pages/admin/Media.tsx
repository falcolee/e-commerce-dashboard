import { useState, useEffect } from 'react';
import { Card, Row, Col, Image, Button, Upload, message, Modal } from 'antd';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { Media } from '@/lib/types';

const MediaPage = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.media.list({ page: 1, page_size: 100 });
      setMedia(res.items ?? []);
    } catch (error) {
      message.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete Media',
      content: 'Are you sure you want to delete this media file?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.media.delete(id);
          message.success('Media deleted successfully');
          fetchMedia();
        } catch (error) {
          message.error('Failed to delete media');
        }
      },
    });
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    customRequest: async ({ file, onSuccess, onError }: UploadRequestOption<File>) => {
      const uploadFile = file as File & { webkitRelativePath?: string };
      try {
        await api.media.upload(uploadFile, {
          alt_text: '',
          title: uploadFile.name,
          description: uploadFile.webkitRelativePath,
        });
        message.success(`${uploadFile.name} uploaded successfully`);
        onSuccess?.(undefined, new XMLHttpRequest());
        fetchMedia();
      } catch (error) {
        message.error(`${uploadFile.name} upload failed`);
        onError?.(error as Error);
      }
    },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Media Library</h1>
        <Upload {...uploadProps}>
          <Button type="primary" icon={<UploadOutlined />}>
            Upload Media
          </Button>
        </Upload>
      </div>
      <Row gutter={[16, 16]}>
        {media && media.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              cover={
                <Image
                  alt={item.alt_text || item.title || 'Media'}
                  src={item.url}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
              }
              actions={[
                <Button type="link" danger icon={<DeleteOutlined />} key="delete" onClick={() => handleDelete(item.id)}>
                  Delete
                </Button>,
              ]}
            >
              <Card.Meta
                title={item.title}
                description={
                  <>
                    <div>{item.filename}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {(item.file_size / 1024).toFixed(2)} KB
                    </div>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MediaPage;
