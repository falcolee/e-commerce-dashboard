// Permission constants matching backend RBAC
export const PERMISSIONS = {
  // User permissions
  USER_LIST: 'user.list',
  USER_READ: 'user.read',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // Product permissions
  PRODUCT_LIST: 'product.list',
  PRODUCT_READ: 'product.read',
  PRODUCT_CREATE: 'product.create',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',

  // Order permissions
  ORDER_LIST: 'order.list',
  ORDER_READ: 'order.read',
  ORDER_CREATE: 'order.create',
  ORDER_UPDATE: 'order.update',
  ORDER_DELETE: 'order.delete',

  // Category permissions
  CATEGORY_LIST: 'category.list',
  CATEGORY_READ: 'category.read',
  CATEGORY_CREATE: 'category.create',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',

  // Tag permissions
  TAG_LIST: 'tag.list',
  TAG_READ: 'tag.read',
  TAG_CREATE: 'tag.create',
  TAG_UPDATE: 'tag.update',
  TAG_DELETE: 'tag.delete',

  // Attribute permissions
  ATTRIBUTE_LIST: 'attribute.list',
  ATTRIBUTE_READ: 'attribute.read',
  ATTRIBUTE_CREATE: 'attribute.create',
  ATTRIBUTE_UPDATE: 'attribute.update',
  ATTRIBUTE_DELETE: 'attribute.delete',

  // Role permissions
  ROLE_LIST: 'role.list',
  ROLE_READ: 'role.read',
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',

  // Permission permissions
  PERMISSION_LIST: 'permission.list',
  PERMISSION_READ: 'permission.read',
  PERMISSION_CREATE: 'permission.create',
  PERMISSION_UPDATE: 'permission.update',
  PERMISSION_DELETE: 'permission.delete',

  // Page permissions
  PAGE_LIST: 'page.list',
  PAGE_READ: 'page.read',
  PAGE_CREATE: 'page.create',
  PAGE_UPDATE: 'page.update',
  PAGE_DELETE: 'page.delete',

  // Media permissions
  MEDIA_LIST: 'media.list',
  MEDIA_READ: 'media.read',
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',

  // Comment permissions
  COMMENT_LIST: 'comment.list',
  COMMENT_READ: 'comment.read',
  COMMENT_CREATE: 'comment.create',
  COMMENT_UPDATE: 'comment.update',
  COMMENT_DELETE: 'comment.delete',

  // Settings permissions
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',

  // Payment Gateway permissions
  PAYMENT_GATEWAY_LIST: 'payment_gateway.list',
  PAYMENT_GATEWAY_READ: 'payment_gateway.read',
  PAYMENT_GATEWAY_UPDATE: 'payment_gateway.update',

  // Shipping Method permissions
  SHIPPING_METHOD_LIST: 'shipping_method.list',
  SHIPPING_METHOD_READ: 'shipping_method.read',
  SHIPPING_METHOD_CREATE: 'shipping_method.create',
  SHIPPING_METHOD_UPDATE: 'shipping_method.update',
  SHIPPING_METHOD_DELETE: 'shipping_method.delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
