import { useCallback, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import sanitizeHtml, { IOptions } from 'sanitize-html';
import { message } from 'antd';

import { cn } from '@/lib/utils';
import api from '@/lib/api';

import 'react-quill/dist/quill.snow.css';

export interface WysiwygEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

const sanitizeConfig: IOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'p',
    'br',
    'strong',
    'em',
    'u',
    'ins',
    'a',
    'img',
    'ul',
    'ol',
    'li',
    'span',
  ],
  allowedAttributes: {
    '*': ['style', 'class'],
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
  },
  allowedStyles: {
    '*': {
      color: [/^#[0-9a-f]{3,6}$/i, /^rgb\(/],
      'text-align': [/^left$/, /^right$/, /^center$/],
    },
  },
};

const stripHtml = (html: string): string =>
  sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, ' ')
    .trim();

const sanitizeValue = (value: string): string => {
  if (!value) {
    return '';
  }

  const clean = sanitizeHtml(value, sanitizeConfig).trim();
  if (!clean) {
    return '';
  }

  return stripHtml(clean).length === 0 ? '' : clean;
};

const WysiwygEditor = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  maxLength,
  className,
}: WysiwygEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const mediaItem = await api.media.upload(file, {
          alt_text: '',
          title: file.name,
          description: file.webkitRelativePath,
        });
        const imageUrl = mediaItem.url;

        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', imageUrl);
          quill.setSelection(range.index + 1, 0);
        }
      } catch (error) {
        message.error('Failed to upload image');
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const formats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'list',
      'bullet',
      'color',
      'link',
      'image',
    ],
    []
  );

  const handleChange = useCallback(
    (content: string) => {
      const sanitized = sanitizeValue(content);
      onChange?.(sanitized);
    },
    [onChange]
  );

  const safeValue = value ?? '';
  const sanitizedForCount = useMemo(() => sanitizeValue(safeValue), [safeValue]);
  const characterCount = useMemo(() => stripHtml(sanitizedForCount).length, [sanitizedForCount]);
  const isOverLimit = typeof maxLength === 'number' && characterCount > maxLength;

  return (
    <div
      className={cn(
        'wysiwyg-editor rounded-md border border-gray-200 bg-white text-sm shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30',
        disabled && 'opacity-60',
      )}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        readOnly={disabled}
        value={safeValue}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        className={cn('wysiwyg-editor__input', className)}
      />
      {typeof maxLength === 'number' && (
        <div className={cn('px-3 pb-2 text-right text-xs text-gray-500', isOverLimit && 'text-red-500')}>
          {characterCount} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default WysiwygEditor;
