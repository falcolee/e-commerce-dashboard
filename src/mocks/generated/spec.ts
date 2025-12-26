/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 *
 * Generated from: docs/swagger.json
 * Run: python3 scripts/generate_mocks.py
 */

import type { MockSpec } from "../types";

export const mockSpec: MockSpec = {
  "basePath": "/api/v1",
  "definitions": {
    "admin.HealthResponse": {
      "properties": {
        "services": {
          "additionalProperties": {
            "type": "string"
          },
          "type": "object"
        },
        "status": {
          "type": "string"
        },
        "timestamp": {
          "type": "string"
        },
        "uptime": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "admin.batchMetaRequest": {
      "properties": {
        "meta": {
          "additionalProperties": true,
          "type": "object"
        }
      },
      "required": [
        "meta"
      ],
      "type": "object"
    },
    "admin.metaValueRequest": {
      "properties": {
        "value": {
          "type": "string"
        }
      },
      "required": [
        "value"
      ],
      "type": "object"
    },
    "domain.Setting": {
      "properties": {
        "autoload": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "option_group": {
          "type": "string"
        },
        "option_name": {
          "type": "string"
        },
        "option_value": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "request.AssignPermissionsRequest": {
      "properties": {
        "permission_ids": {
          "items": {
            "type": "integer"
          },
          "minItems": 1,
          "type": "array"
        }
      },
      "required": [
        "permission_ids"
      ],
      "type": "object"
    },
    "request.BatchUpdateCouponStatusRequest": {
      "properties": {
        "active": {
          "type": "boolean"
        },
        "ids": {
          "items": {
            "type": "integer"
          },
          "minItems": 1,
          "type": "array"
        }
      },
      "required": [
        "active",
        "ids"
      ],
      "type": "object"
    },
    "request.BatchUpdateProductStatusRequest": {
      "properties": {
        "product_ids": {
          "items": {
            "type": "integer"
          },
          "minItems": 1,
          "type": "array"
        },
        "status": {
          "enum": [
            "draft",
            "publish",
            "private"
          ],
          "type": "string"
        }
      },
      "required": [
        "product_ids",
        "status"
      ],
      "type": "object"
    },
    "request.BatchUpdateStockRequest": {
      "properties": {
        "updates": {
          "items": {
            "$ref": "#/definitions/request.StockUpdate"
          },
          "minItems": 1,
          "type": "array"
        }
      },
      "required": [
        "updates"
      ],
      "type": "object"
    },
    "request.BlacklistTokenRequest": {
      "properties": {
        "reason": {
          "maxLength": 255,
          "type": "string"
        }
      },
      "required": [
        "reason"
      ],
      "type": "object"
    },
    "request.CreateAddressRequest": {
      "properties": {
        "address_1": {
          "type": "string"
        },
        "address_2": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "company": {
          "type": "string"
        },
        "country": {
          "description": "ISO 3166-1 alpha-2",
          "type": "string"
        },
        "first_name": {
          "type": "string"
        },
        "is_default": {
          "type": "boolean"
        },
        "last_name": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        },
        "postcode": {
          "type": "string"
        },
        "state": {
          "type": "string"
        }
      },
      "required": [
        "address_1",
        "city",
        "first_name",
        "phone"
      ],
      "type": "object"
    },
    "request.CreateAttributeRequest": {
      "properties": {
        "name": {
          "description": "Will be prefixed with \"pa_\" if not present",
          "minLength": 2,
          "type": "string"
        },
        "order_by": {
          "description": "Default: 0",
          "minimum": 0,
          "type": "integer"
        },
        "slug": {
          "description": "Optional URL-friendly identifier",
          "type": "string"
        },
        "type": {
          "enum": [
            "select",
            "color",
            "input"
          ],
          "type": "string"
        }
      },
      "required": [
        "name"
      ],
      "type": "object"
    },
    "request.CreateAttributeValueRequest": {
      "properties": {
        "order_by": {
          "minimum": 0,
          "type": "integer"
        },
        "value": {
          "type": "string"
        }
      },
      "required": [
        "value"
      ],
      "type": "object"
    },
    "request.CreateCategoryRequest": {
      "properties": {
        "description": {
          "type": "string"
        },
        "image_url": {
          "maxLength": 512,
          "type": "string"
        },
        "menu_order": {
          "minimum": 0,
          "type": "integer"
        },
        "name": {
          "maxLength": 200,
          "minLength": 1,
          "type": "string"
        },
        "parent_id": {
          "type": "integer"
        },
        "slug": {
          "maxLength": 200,
          "type": "string"
        },
        "taxonomy": {
          "enum": [
            "product_cat",
            "post_cat",
            "page_cat"
          ],
          "type": "string"
        }
      },
      "required": [
        "name"
      ],
      "type": "object"
    },
    "request.CreateCouponRequest": {
      "properties": {
        "active": {
          "type": "boolean"
        },
        "amount": {
          "type": "number"
        },
        "code": {
          "maxLength": 20,
          "minLength": 3,
          "type": "string"
        },
        "date_expires": {
          "type": "string"
        },
        "description": {
          "maxLength": 500,
          "type": "string"
        },
        "minimum_amount": {
          "type": "number"
        },
        "type": {
          "enum": [
            "fixed",
            "percentage"
          ],
          "type": "string"
        },
        "usage_limit": {
          "type": "integer"
        }
      },
      "required": [
        "amount",
        "code",
        "type"
      ],
      "type": "object"
    },
    "request.CreateOrderShipmentRequest": {
      "properties": {
        "carrier": {
          "maxLength": 100,
          "type": "string"
        },
        "notes": {
          "type": "string"
        },
        "order_id": {
          "type": "integer"
        },
        "tracking_number": {
          "maxLength": 100,
          "type": "string"
        },
        "update_order_status": {
          "description": "if true, order status will be updated to shipped automatically",
          "type": "boolean"
        }
      },
      "required": [
        "carrier",
        "order_id",
        "tracking_number"
      ],
      "type": "object"
    },
    "request.CreatePermissionRequest": {
      "properties": {
        "action": {
          "maxLength": 50,
          "minLength": 2,
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "display_name": {
          "maxLength": 100,
          "minLength": 2,
          "type": "string"
        },
        "name": {
          "maxLength": 100,
          "minLength": 2,
          "type": "string"
        },
        "resource": {
          "maxLength": 50,
          "minLength": 2,
          "type": "string"
        }
      },
      "required": [
        "action",
        "display_name",
        "name",
        "resource"
      ],
      "type": "object"
    },
    "request.CreatePostRequest": {
      "properties": {
        "comment_status": {
          "enum": [
            "open",
            "closed"
          ],
          "type": "string"
        },
        "content": {
          "type": "string"
        },
        "excerpt": {
          "type": "string"
        },
        "menu_order": {
          "type": "integer"
        },
        "parent_id": {
          "type": "integer"
        },
        "slug": {
          "type": "string"
        },
        "status": {
          "enum": [
            "publish",
            "draft",
            "pending",
            "private"
          ],
          "type": "string"
        },
        "template": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "type": {
          "enum": [
            "page",
            "post"
          ],
          "type": "string"
        }
      },
      "required": [
        "comment_status",
        "slug",
        "status",
        "title",
        "type"
      ],
      "type": "object"
    },
    "request.CreateRoleRequest": {
      "properties": {
        "description": {
          "type": "string"
        },
        "display_name": {
          "maxLength": 100,
          "minLength": 2,
          "type": "string"
        },
        "name": {
          "maxLength": 50,
          "minLength": 2,
          "type": "string"
        }
      },
      "required": [
        "display_name",
        "name"
      ],
      "type": "object"
    },
    "request.CreateShippingMethodRequest": {
      "properties": {
        "base_cost": {
          "minimum": 0,
          "type": "number"
        },
        "code": {
          "maxLength": 50,
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "enabled": {
          "type": "boolean"
        },
        "free_shipping_threshold": {
          "minimum": 0,
          "type": "number"
        },
        "sort_order": {
          "type": "integer"
        },
        "title": {
          "maxLength": 100,
          "type": "string"
        }
      },
      "required": [
        "code",
        "title"
      ],
      "type": "object"
    },
    "request.CreateSimpleProductRequest": {
      "properties": {
        "category_ids": {
          "items": {
            "type": "integer"
          },
          "type": "array"
        },
        "description": {
          "example": "High-performance laptop with advanced features",
          "type": "string"
        },
        "featured_image": {
          "example": "/uploads/laptop-main.jpg",
          "type": "string"
        },
        "gallery_images": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "manage_stock": {
          "example": true,
          "type": "boolean"
        },
        "meta": {
          "additionalProperties": true,
          "type": "object"
        },
        "name": {
          "example": "Laptop Pro 15",
          "maxLength": 200,
          "minLength": 1,
          "type": "string"
        },
        "regular_price": {
          "example": 1299.99,
          "type": "number"
        },
        "sale_price": {
          "example": 1199.99,
          "type": "number"
        },
        "short_description": {
          "example": "15-inch laptop for professionals",
          "type": "string"
        },
        "sku": {
          "example": "LAP-001",
          "maxLength": 100,
          "minLength": 1,
          "type": "string"
        },
        "slug": {
          "example": "laptop-pro-15",
          "maxLength": 200,
          "type": "string"
        },
        "status": {
          "enum": [
            "draft",
            "publish",
            "private"
          ],
          "example": "draft",
          "type": "string"
        },
        "stock_quantity": {
          "example": 50,
          "minimum": 0,
          "type": "integer"
        },
        "stock_status": {
          "enum": [
            "instock",
            "outofstock",
            "onbackorder"
          ],
          "example": "instock",
          "type": "string"
        },
        "tag_ids": {
          "items": {
            "type": "integer"
          },
          "type": "array"
        }
      },
      "required": [
        "name",
        "regular_price",
        "sku",
        "status",
        "stock_status"
      ],
      "type": "object"
    },
    "request.CreateTagRequest": {
      "properties": {
        "description": {
          "type": "string"
        },
        "name": {
          "maxLength": 200,
          "minLength": 1,
          "type": "string"
        },
        "slug": {
          "maxLength": 200,
          "type": "string"
        }
      },
      "required": [
        "name"
      ],
      "type": "object"
    },
    "request.CreateUserRequest": {
      "properties": {
        "display_name": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "meta": {
          "additionalProperties": true,
          "description": "Optional, additional metadata",
          "type": "object"
        },
        "password": {
          "minLength": 6,
          "type": "string"
        },
        "role": {
          "description": "Optional, defaults to []",
          "type": "string"
        },
        "status": {
          "description": "Optional, defaults to 0",
          "type": "integer"
        },
        "username": {
          "maxLength": 60,
          "minLength": 3,
          "type": "string"
        }
      },
      "required": [
        "display_name",
        "password",
        "username"
      ],
      "type": "object"
    },
    "request.CreateVariableProductRequest": {
      "properties": {
        "category_ids": {
          "items": {
            "type": "integer"
          },
          "type": "array"
        },
        "description": {
          "example": "High-quality cotton t-shirt collection",
          "type": "string"
        },
        "featured_image": {
          "example": "/uploads/tshirt-main.jpg",
          "type": "string"
        },
        "gallery_images": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "meta": {
          "additionalProperties": true,
          "type": "object"
        },
        "name": {
          "example": "T-Shirt Collection",
          "maxLength": 200,
          "minLength": 1,
          "type": "string"
        },
        "short_description": {
          "example": "Premium cotton t-shirts",
          "type": "string"
        },
        "slug": {
          "example": "t-shirt-collection",
          "maxLength": 200,
          "type": "string"
        },
        "status": {
          "enum": [
            "draft",
            "publish",
            "private"
          ],
          "example": "draft",
          "type": "string"
        },
        "tag_ids": {
          "items": {
            "type": "integer"
          },
          "type": "array"
        }
      },
      "required": [
        "name",
        "status"
      ],
      "type": "object"
    },
    "request.CreateVariantRequest": {
      "properties": {
        "attributes": {
          "additionalProperties": {
            "type": "string"
          },
          "type": "object"
        },
        "featured_image": {
          "example": "/uploads/tshirt-red-m.jpg",
          "type": "string"
        },
        "manage_stock": {
          "example": true,
          "type": "boolean"
        },
        "name": {
          "example": "T-Shirt - Red M",
          "maxLength": 200,
          "minLength": 1,
          "type": "string"
        },
        "regular_price": {
          "example": 29.99,
          "type": "number"
        },
        "sale_price": {
          "example": 24.99,
          "type": "number"
        },
        "sku": {
          "example": "TSH-RED-M",
          "maxLength": 100,
          "minLength": 1,
          "type": "string"
        },
        "stock_quantity": {
          "example": 100,
          "minimum": 0,
          "type": "integer"
        },
        "stock_status": {
          "enum": [
            "instock",
            "outofstock",
            "onbackorder"
          ],
          "example": "instock",
          "type": "string"
        }
      },
      "required": [
        "attributes",
        "name",
        "regular_price",
        "sku",
        "stock_status"
      ],
      "type": "object"
    },
    "request.DeleteOldEmailLogsRequest": {
      "properties": {
        "older_than_days": {
          "minimum": 1,
          "type": "integer"
        }
      },
      "required": [
        "older_than_days"
      ],
      "type": "object"
    },
    "request.EmailSettingsRequest": {
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "from_email": {
          "type": "string"
        },
        "from_name": {
          "type": "string"
        },
        "smtp_host": {
          "type": "string"
        },
        "smtp_password": {
          "type": "string"
        },
        "smtp_port": {
          "type": "integer"
        },
        "smtp_security": {
          "enum": [
            "none",
            "tls",
            "ssl"
          ],
          "type": "string"
        },
        "smtp_username": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "request.EmailTemplateRequest": {
      "properties": {
        "content": {
          "type": "string"
        },
        "enabled": {
          "type": "boolean"
        },
        "subject": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "request.LoginRequest": {
      "properties": {
        "password": {
          "type": "string"
        },
        "username": {
          "type": "string"
        }
      },
      "required": [
        "password",
        "username"
      ],
      "type": "object"
    },
    "request.RefreshTokenRequest": {
      "properties": {
        "refresh_token": {
          "type": "string"
        }
      },
      "required": [
        "refresh_token"
      ],
      "type": "object"
    },
    "request.RegisterRequest": {
      "properties": {
        "email": {
          "type": "string"
        },
        "full_name": {
          "type": "string"
        },
        "password": {
          "minLength": 6,
          "type": "string"
        },
        "username": {
          "type": "string"
        }
      },
      "required": [
        "email",
        "full_name",
        "password",
        "username"
      ],
      "type": "object"
    },
    "request.RemovePermissionsRequest": {
      "properties": {
        "permission_ids": {
          "items": {
            "type": "integer"
          },
          "minItems": 1,
          "type": "array"
        }
      },
      "required": [
        "permission_ids"
      ],
      "type": "object"
    },
    "request.ResetPasswordRequest": {
      "properties": {
        "email": {
          "type": "string"
        }
      },
      "required": [
        "email"
      ],
      "type": "object"
    },
    "request.StockUpdate": {
      "properties": {
        "product_id": {
          "example": 1,
          "type": "integer"
        },
        "quantity": {
          "example": 100,
          "type": "integer"
        },
        "stock_status": {
          "enum": [
            "instock",
            "outofstock",
            "onbackorder"
          ],
          "example": "instock",
          "type": "string"
        }
      },
      "required": [
        "product_id",
        "quantity",
        "stock_status"
      ],
      "type": "object"
    },
    "request.TestEmailRequest": {
      "properties": {
        "to": {
          "type": "string"
        }
      },
      "required": [
        "to"
      ],
      "type": "object"
    },
    "request.ToggleCouponStatusRequest": {
      "properties": {
        "active": {
          "type": "boolean"
        }
      },
      "required": [
        "active"
      ],
      "type": "object"
    },
    "request.TokenLogFilters": {
      "properties": {
        "created_from": {
          "description": "YYYY-MM-DD format",
          "type": "string"
        },
        "created_to": {
          "description": "YYYY-MM-DD format",
          "type": "string"
        },
        "ip_address": {
          "type": "string"
        },
        "is_blacklisted": {
          "type": "boolean"
        },
        "search": {
          "description": "Search by username/email",
          "type": "string"
        },
        "token_type": {
          "enum": [
            "access",
            "refresh"
          ],
          "type": "string"
        },
        "user_id": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "request.UpdateAddressRequest": {
      "properties": {
        "address_1": {
          "type": "string"
        },
        "address_2": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "company": {
          "type": "string"
        },
        "country": {
          "type": "string"
        },
        "first_name": {
          "type": "string"
        },
        "is_default": {
          "type": "boolean"
        },
        "last_name": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        },
        "postcode": {
          "type": "string"
        },
        "state": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "request.UpdateAttributeRequest": {
      "properties": {
        "order_by": {
          "minimum": 0,
          "type": "integer"
        },
        "slug": {
          "type": "string"
        },
        "type": {
          "enum": [
            "select",
            "color",
            "input"
          ],
          "type": "string"
        }
      },
      "type": "object"
    },
    "request.UpdateAttributeValueRequest": {
      "properties": {
        "order_by": {
          "minimum": 0,
          "type": "integer"
        },
        "value": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "request.UpdateCategoryRequest": {
      "properties": {
        "description": {
          "type": "string"
        },
        "image_url": {
          "maxLength": 512,
          "type": "string"
        },
        "menu_order": {
          "minimum": 0,
          "type": "integer"
        },
        "name": {
          "maxLength": 200,
          "minLength": 1,
          "type": "string"
        },
        "parent_id": {
          "type": "integer"
        },
        "slug": {
          "maxLength": 200,
          "type": "string"
        }
      },
      "type": "object"
    },
    "request.UpdateCouponRequest": {
      "properties": {
        "active": {
          "type": "boolean"
        },
        "amount": {
          "type": "number"
        },
        "code": {
          "maxLength": 20,
          "minLength": 3,
          "type": "string"
        },
        "date_expires": {
          "type": "string"
        },
        "description": {
          "maxLength": 500,
          "type": "string"
        },
        "minimum_amount": {
          "type": "number"
        },
        "type": {
          "enum": [
            "fixed",
            "percentage"
          ],
          "type": "string"
        },
        "usage_limit": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "request.UpdateGatewayRequest": {
      "properties": {
        "config": {
          "additionalProperties": true,
          "type": "object"
        },
        "priority": {
          "example": 10,
          "minimum": 0,
          "type": "integer"
        },
        "title": {
          "example": "WeChat Pay",
          "maxLength": 200,
          "minLength": 1,
          "type": "string"
        }
      },
      "required": [
        "config"
      ],
      "type": "object"
    },
    "request.UpdateOrderShipmentRequest": {
      "properties": {
        "carrier": {
          "maxLength": 100,
          "type": "string"
        },
        "notes": {
          "type": "string"
        },
        "tracking_number": {
          "maxLength": 100,
          "type": "string"
        }
      },
      "required": [
        "carrier",
        "tracking_number"
      ],
      "type": "object"
    },
    "request.UpdateOrderStatusRequest": {
      "properties": {
        "status": {
          "example": "processing",
          "type": "string"
        }
      },
      "required": [
        "status"
      ],
      "type": "object"
    },
    "request.UpdatePermissionRequest": {
      "properties": {
        "description": {
          "type": "string"
        },
        "display_name": {
          "maxLength": 100,
          "minLength": 2,
          "type": "string"
        }
      },
      "required": [
        "display_name"
      ],
      "type": "object"
    },
    "request.UpdatePostRequest": {
      "properties": {
        "comment_status": {
          "enum": [
            "open",
            "closed"
          ],
          "type": "string"
        },
        "content": {
          "type": "string"
        },
        "excerpt": {
          "type": "string"
        },
        "menu_order": {
          "type": "integer"
        },
        "parent_id": {
          "type": "integer"
        },
        "slug": {
          "type": "string"
        },
        "status": {
          "enum": [
            "publish",
            "draft",
            "pending",
            "private"
          ],
          "type": "string"
        },
        "template": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "type": {
          "enum": [
            "page",
            "post"
          ],
          "type": "string"
        }
      },
      "type": "object"
    },
    "request.UpdateProductRequest": {
      "properties": {
        "category_ids": {
          "items": {
            "type": "integer"
          },
          "type": "array"
        },
        "description": {
          "type": "string"
        },
        "featured_image": {
          "type": "string"
        },
        "gallery_images": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "manage_stock": {
          "type": "boolean"
        },
        "meta": {
          "additionalProperties": true,
          "type": "object"
        },
        "name": {
          "maxLength": 200,
          "minLength": 1,
          "type": "string"
        },
        "regular_price": {
          "type": "number"
        },
        "sale_price": {
          "type": "number"
        },
        "short_description": {
          "type": "string"
        },
        "sku": {
          "maxLength": 100,
          "minLength": 1,
          "type": "string"
        },
        "slug": {
          "maxLength": 200,
          "type": "string"
        },
        "status": {
          "enum": [
            "draft",
            "publish",
            "private"
          ],
          "type": "string"
        },
        "stock_quantity": {
          "minimum": 0,
          "type": "integer"
        },
        "stock_status": {
          "enum": [
            "instock",
            "outofstock",
            "onbackorder"
          ],
          "type": "string"
        },
        "tag_ids": {
          "items": {
            "type": "integer"
          },
          "type": "array"
        }
      },
      "type": "object"
    },
    "request.UpdateRoleRequest": {
      "properties": {
        "description": {
          "type": "string"
        },
        "display_name": {
          "maxLength": 100,
          "minLength": 2,
          "type": "string"
        }
      },
      "required": [
        "display_name"
      ],
      "type": "object"
    },
    "request.UpdateShippingMethodRequest": {
      "properties": {
        "base_cost": {
          "minimum": 0,
          "type": "number"
        },
        "description": {
          "type": "string"
        },
        "enabled": {
          "type": "boolean"
        },
        "free_shipping_threshold": {
          "minimum": 0,
          "type": "number"
        },
        "sort_order": {
          "type": "integer"
        },
        "title": {
          "maxLength": 100,
          "type": "string"
        }
      },
      "required": [
        "title"
      ],
      "type": "object"
    },
    "request.UpdateTagRequest": {
      "properties": {
        "description": {
          "type": "string"
        },
        "name": {
          "maxLength": 200,
          "minLength": 1,
          "type": "string"
        },
        "slug": {
          "maxLength": 200,
          "type": "string"
        }
      },
      "type": "object"
    },
    "request.UpdateUserRequest": {
      "properties": {
        "display_name": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "meta": {
          "additionalProperties": true,
          "type": "object"
        },
        "password": {
          "minLength": 6,
          "type": "string"
        },
        "role": {
          "type": "string"
        },
        "status": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "request.UpdateVariantRequest": {
      "properties": {
        "attributes": {
          "additionalProperties": {
            "type": "string"
          },
          "type": "object"
        },
        "featured_image": {
          "type": "string"
        },
        "manage_stock": {
          "type": "boolean"
        },
        "name": {
          "maxLength": 200,
          "minLength": 1,
          "type": "string"
        },
        "regular_price": {
          "type": "number"
        },
        "sale_price": {
          "type": "number"
        },
        "sku": {
          "maxLength": 100,
          "minLength": 1,
          "type": "string"
        },
        "stock_quantity": {
          "minimum": 0,
          "type": "integer"
        },
        "stock_status": {
          "enum": [
            "instock",
            "outofstock",
            "onbackorder"
          ],
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.AddressResponse": {
      "properties": {
        "address_1": {
          "type": "string"
        },
        "address_2": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "company": {
          "type": "string"
        },
        "country": {
          "type": "string"
        },
        "first_name": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "is_default": {
          "type": "boolean"
        },
        "last_name": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        },
        "postcode": {
          "type": "string"
        },
        "state": {
          "type": "string"
        },
        "user_id": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.AttributeDetailResponse": {
      "properties": {
        "created_at": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "name": {
          "type": "string"
        },
        "order_by": {
          "type": "integer"
        },
        "slug": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "values": {
          "items": {
            "$ref": "#/definitions/response.AttributeValueResponse"
          },
          "type": "array"
        }
      },
      "type": "object"
    },
    "response.AttributeResponse": {
      "properties": {
        "created_at": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "name": {
          "type": "string"
        },
        "order_by": {
          "type": "integer"
        },
        "slug": {
          "type": "string"
        },
        "type": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.AttributeValueResponse": {
      "properties": {
        "attribute_id": {
          "type": "integer"
        },
        "id": {
          "type": "integer"
        },
        "order_by": {
          "type": "integer"
        },
        "value": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.AvailableProvidersResponse": {
      "properties": {
        "providers": {
          "items": {
            "$ref": "#/definitions/response.ProviderMetadataResponse"
          },
          "type": "array"
        }
      },
      "type": "object"
    },
    "response.BatchUpdateCouponStatusResponse": {
      "properties": {
        "count": {
          "type": "integer"
        },
        "coupon_ids": {
          "items": {
            "type": "integer"
          },
          "type": "array"
        },
        "message": {
          "type": "string"
        },
        "status": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.CouponListResponse": {
      "properties": {
        "coupons": {
          "items": {
            "$ref": "#/definitions/response.CouponResponse"
          },
          "type": "array"
        },
        "has_next": {
          "type": "boolean"
        },
        "has_previous": {
          "type": "boolean"
        },
        "page": {
          "type": "integer"
        },
        "page_size": {
          "type": "integer"
        },
        "total": {
          "type": "integer"
        },
        "total_pages": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.CouponResponse": {
      "properties": {
        "active": {
          "type": "boolean"
        },
        "amount": {
          "type": "number"
        },
        "code": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        },
        "date_expires": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "minimum_amount": {
          "type": "number"
        },
        "type": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        },
        "usage_count": {
          "type": "integer"
        },
        "usage_limit": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.CouponStatsResponse": {
      "properties": {
        "active": {
          "type": "boolean"
        },
        "amount": {
          "type": "number"
        },
        "code": {
          "type": "string"
        },
        "coupon_id": {
          "type": "integer"
        },
        "date_expires": {
          "type": "string"
        },
        "last_used_at": {
          "type": "string"
        },
        "total_usage": {
          "type": "integer"
        },
        "type": {
          "type": "string"
        },
        "unique_users": {
          "type": "integer"
        },
        "usage_by_date": {
          "items": {
            "$ref": "#/definitions/response.UsageByDate"
          },
          "type": "array"
        },
        "usage_count": {
          "type": "integer"
        },
        "usage_limit": {
          "type": "integer"
        },
        "usage_remaining": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.CouponUsageHistoryResponse": {
      "properties": {
        "coupon_id": {
          "type": "integer"
        },
        "id": {
          "type": "integer"
        },
        "order_id": {
          "type": "integer"
        },
        "used_at": {
          "type": "string"
        },
        "user_id": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.EmailLogResponse": {
      "properties": {
        "created_at": {
          "type": "string"
        },
        "error_message": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "ip": {
          "type": "string"
        },
        "receiver": {
          "type": "string"
        },
        "retry_count": {
          "type": "integer"
        },
        "sent_at": {
          "type": "string"
        },
        "status": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        },
        "user_email": {
          "type": "string"
        },
        "user_id": {
          "type": "integer"
        },
        "username": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.EmailSettingsResponse": {
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "from_email": {
          "type": "string"
        },
        "from_name": {
          "type": "string"
        },
        "last_test_at": {
          "type": "string"
        },
        "smtp_host": {
          "type": "string"
        },
        "smtp_port": {
          "type": "integer"
        },
        "smtp_security": {
          "type": "string"
        },
        "smtp_username": {
          "type": "string"
        },
        "tested": {
          "type": "boolean"
        }
      },
      "type": "object"
    },
    "response.EmailStatsResponse": {
      "properties": {
        "success_rate": {
          "type": "number"
        },
        "total_emails": {
          "type": "integer"
        },
        "total_failed": {
          "type": "integer"
        },
        "total_pending": {
          "type": "integer"
        },
        "total_sent": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.EmailTemplateResponse": {
      "properties": {
        "content": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        },
        "enabled": {
          "type": "boolean"
        },
        "name": {
          "type": "string"
        },
        "subject": {
          "type": "string"
        },
        "template_key": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.EmailTemplatesResponse": {
      "properties": {
        "templates": {
          "items": {
            "$ref": "#/definitions/response.EmailTemplateResponse"
          },
          "type": "array"
        },
        "total": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.GatewayListResponse": {
      "properties": {
        "items": {
          "items": {
            "$ref": "#/definitions/response.GatewayResponse"
          },
          "type": "array"
        },
        "pagination": {
          "$ref": "#/definitions/response.PaginationResponse"
        }
      },
      "type": "object"
    },
    "response.GatewayResponse": {
      "properties": {
        "config": {
          "additionalProperties": true,
          "type": "object"
        },
        "created_at": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "enabled": {
          "type": "boolean"
        },
        "gateway_id": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "menu_order": {
          "type": "integer"
        },
        "supports_refunds": {
          "type": "boolean"
        },
        "supports_subscriptions": {
          "type": "boolean"
        },
        "title": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.LoginResponse": {
      "properties": {
        "access_token": {
          "type": "string"
        },
        "expires_in": {
          "type": "integer"
        },
        "refresh_token": {
          "type": "string"
        },
        "token_type": {
          "type": "string"
        },
        "user": {
          "$ref": "#/definitions/response.LoginUserResponse"
        }
      },
      "type": "object"
    },
    "response.LoginUserResponse": {
      "properties": {
        "display_name": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "last_login_at": {
          "type": "string"
        },
        "permissions": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "registered_at": {
          "type": "string"
        },
        "role": {
          "$ref": "#/definitions/response.UserRole"
        },
        "status": {
          "type": "integer"
        },
        "username": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.MediaResponse": {
      "properties": {
        "alt_text": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "file_size": {
          "type": "integer"
        },
        "filename": {
          "type": "string"
        },
        "filepath": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "mime_type": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "uploaded_at": {
          "type": "string"
        },
        "url": {
          "type": "string"
        },
        "user": {
          "$ref": "#/definitions/response.UserResponse"
        }
      },
      "type": "object"
    },
    "response.MetaResponse": {
      "properties": {
        "id": {
          "type": "integer"
        },
        "meta_key": {
          "type": "string"
        },
        "meta_value": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.OrderDetailResponse": {
      "properties": {
        "admin_note": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        },
        "currency": {
          "type": "string"
        },
        "customer_note": {
          "type": "string"
        },
        "date_completed": {
          "type": "string"
        },
        "date_paid": {
          "type": "string"
        },
        "discount_amount": {
          "type": "number"
        },
        "id": {
          "type": "integer"
        },
        "ip_address": {
          "type": "string"
        },
        "items": {
          "items": {
            "$ref": "#/definitions/response.OrderItemResponse"
          },
          "type": "array"
        },
        "order_key": {
          "type": "string"
        },
        "order_status": {
          "type": "string"
        },
        "order_total": {
          "type": "number"
        },
        "payment_gateway": {
          "type": "string"
        },
        "payment_gateway_title": {
          "type": "string"
        },
        "payment_status": {
          "type": "string"
        },
        "session_id": {
          "type": "string"
        },
        "shipping_address_1": {
          "type": "string"
        },
        "shipping_address_2": {
          "type": "string"
        },
        "shipping_city": {
          "type": "string"
        },
        "shipping_company": {
          "type": "string"
        },
        "shipping_cost": {
          "type": "number"
        },
        "shipping_country": {
          "type": "string"
        },
        "shipping_email": {
          "type": "string"
        },
        "shipping_full_name": {
          "type": "string"
        },
        "shipping_method_code": {
          "type": "string"
        },
        "shipping_phone": {
          "type": "string"
        },
        "shipping_postcode": {
          "type": "string"
        },
        "shipping_state": {
          "type": "string"
        },
        "subtotal": {
          "type": "number"
        },
        "tax_amount": {
          "type": "number"
        },
        "updated_at": {
          "type": "string"
        },
        "user_id": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.OrderItemResponse": {
      "properties": {
        "id": {
          "type": "integer"
        },
        "image_url": {
          "type": "string"
        },
        "price_per_item": {
          "type": "number"
        },
        "product_id": {
          "type": "integer"
        },
        "product_name": {
          "type": "string"
        },
        "quantity": {
          "type": "integer"
        },
        "total_price": {
          "type": "number"
        }
      },
      "type": "object"
    },
    "response.OrderResponse": {
      "properties": {
        "created_at": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "order_key": {
          "type": "string"
        },
        "order_status": {
          "type": "string"
        },
        "order_total": {
          "type": "number"
        },
        "payment_status": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.OrderShipmentResponse": {
      "properties": {
        "carrier": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "notes": {
          "type": "string"
        },
        "order_id": {
          "type": "integer"
        },
        "shipped_at": {
          "type": "string"
        },
        "tracking_number": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.OrderStatsResponse": {
      "properties": {
        "completed_orders": {
          "type": "integer"
        },
        "pending_orders": {
          "type": "integer"
        },
        "total_orders": {
          "type": "integer"
        },
        "total_revenue": {
          "type": "number"
        }
      },
      "type": "object"
    },
    "response.OrderStatusStat": {
      "properties": {
        "count": {
          "type": "integer"
        },
        "label": {
          "type": "string"
        },
        "status": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.OverviewStats": {
      "properties": {
        "completed_orders": {
          "type": "integer"
        },
        "out_of_stock_products": {
          "type": "integer"
        },
        "pending_orders": {
          "type": "integer"
        },
        "processing_orders": {
          "type": "integer"
        },
        "total_orders": {
          "type": "integer"
        },
        "total_products": {
          "type": "integer"
        },
        "total_revenue": {
          "type": "number"
        },
        "total_users": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.PaginatedResponse": {
      "properties": {
        "items": {},
        "pagination": {
          "$ref": "#/definitions/response.PaginationResponse"
        }
      },
      "type": "object"
    },
    "response.PaginationResponse": {
      "properties": {
        "page": {
          "type": "integer"
        },
        "page_size": {
          "type": "integer"
        },
        "total": {
          "type": "integer"
        },
        "total_pages": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.PermissionResponse": {
      "properties": {
        "action": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "display_name": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "name": {
          "type": "string"
        },
        "resource": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.PostResponse": {
      "properties": {
        "author": {
          "$ref": "#/definitions/response.UserResponse"
        },
        "comment_status": {
          "type": "string"
        },
        "content": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        },
        "excerpt": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "menu_order": {
          "type": "integer"
        },
        "parent_id": {
          "type": "integer"
        },
        "slug": {
          "type": "string"
        },
        "status": {
          "type": "string"
        },
        "template": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.ProductDetailResponse": {
      "properties": {
        "attributes": {
          "additionalProperties": {
            "type": "string"
          },
          "type": "object"
        },
        "categories": {
          "items": {
            "$ref": "#/definitions/response.TaxonomyResponse"
          },
          "type": "array"
        },
        "created_at": {
          "example": "2024-01-01T00:00:00Z",
          "type": "string"
        },
        "description": {
          "example": "High-performance laptop...",
          "type": "string"
        },
        "featured_image": {
          "example": "/uploads/laptop-main.jpg",
          "type": "string"
        },
        "gallery_images": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "id": {
          "example": 1,
          "type": "integer"
        },
        "manage_stock": {
          "example": true,
          "type": "boolean"
        },
        "meta": {
          "items": {
            "$ref": "#/definitions/response.MetaResponse"
          },
          "type": "array"
        },
        "name": {
          "example": "Laptop Pro 15",
          "type": "string"
        },
        "original_price": {
          "example": 1299.99,
          "type": "number"
        },
        "parent_id": {
          "example": 0,
          "type": "integer"
        },
        "price": {
          "example": 1199.99,
          "type": "number"
        },
        "rating_count": {
          "example": 25,
          "type": "integer"
        },
        "regular_price": {
          "example": 1299.99,
          "type": "number"
        },
        "sale_price": {
          "example": 1199.99,
          "type": "number"
        },
        "short_description": {
          "example": "15-inch laptop",
          "type": "string"
        },
        "sku": {
          "example": "LAP-001",
          "type": "string"
        },
        "slug": {
          "example": "laptop-pro-15",
          "type": "string"
        },
        "star_rating": {
          "example": 4.5,
          "type": "number"
        },
        "status": {
          "example": "publish",
          "type": "string"
        },
        "stock_quantity": {
          "example": 50,
          "type": "integer"
        },
        "stock_status": {
          "example": "instock",
          "type": "string"
        },
        "tags": {
          "items": {
            "$ref": "#/definitions/response.TaxonomyResponse"
          },
          "type": "array"
        },
        "type": {
          "example": "simple",
          "type": "string"
        },
        "updated_at": {
          "example": "2024-01-01T00:00:00Z",
          "type": "string"
        },
        "variants": {
          "items": {
            "$ref": "#/definitions/response.ProductResponse"
          },
          "type": "array"
        }
      },
      "type": "object"
    },
    "response.ProductResponse": {
      "properties": {
        "created_at": {
          "example": "2024-01-01T00:00:00Z",
          "type": "string"
        },
        "description": {
          "example": "High-performance laptop...",
          "type": "string"
        },
        "featured_image": {
          "example": "/uploads/laptop-main.jpg",
          "type": "string"
        },
        "gallery_images": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "id": {
          "example": 1,
          "type": "integer"
        },
        "manage_stock": {
          "example": true,
          "type": "boolean"
        },
        "meta": {
          "items": {
            "$ref": "#/definitions/response.MetaResponse"
          },
          "type": "array"
        },
        "name": {
          "example": "Laptop Pro 15",
          "type": "string"
        },
        "original_price": {
          "example": 1299.99,
          "type": "number"
        },
        "parent_id": {
          "example": 0,
          "type": "integer"
        },
        "price": {
          "example": 1199.99,
          "type": "number"
        },
        "rating_count": {
          "example": 25,
          "type": "integer"
        },
        "regular_price": {
          "example": 1299.99,
          "type": "number"
        },
        "sale_price": {
          "example": 1199.99,
          "type": "number"
        },
        "short_description": {
          "example": "15-inch laptop",
          "type": "string"
        },
        "sku": {
          "example": "LAP-001",
          "type": "string"
        },
        "slug": {
          "example": "laptop-pro-15",
          "type": "string"
        },
        "star_rating": {
          "example": 4.5,
          "type": "number"
        },
        "status": {
          "example": "publish",
          "type": "string"
        },
        "stock_quantity": {
          "example": 50,
          "type": "integer"
        },
        "stock_status": {
          "example": "instock",
          "type": "string"
        },
        "type": {
          "example": "simple",
          "type": "string"
        },
        "updated_at": {
          "example": "2024-01-01T00:00:00Z",
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.ProductSalesStat": {
      "properties": {
        "product_id": {
          "type": "integer"
        },
        "product_name": {
          "type": "string"
        },
        "sku": {
          "type": "string"
        },
        "total_revenue": {
          "type": "number"
        },
        "total_sold": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.ProductWithVariantsResponse": {
      "properties": {
        "product": {
          "$ref": "#/definitions/response.ProductResponse"
        },
        "variants": {
          "items": {
            "$ref": "#/definitions/response.ProductResponse"
          },
          "type": "array"
        }
      },
      "type": "object"
    },
    "response.ProviderMetadataResponse": {
      "properties": {
        "description": {
          "type": "string"
        },
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "supports_refunds": {
          "type": "boolean"
        },
        "supports_subscriptions": {
          "type": "boolean"
        }
      },
      "type": "object"
    },
    "response.RevenuePeriodStat": {
      "properties": {
        "date": {
          "type": "string"
        },
        "orders": {
          "type": "integer"
        },
        "period": {
          "type": "string"
        },
        "revenue": {
          "type": "number"
        }
      },
      "type": "object"
    },
    "response.RoleDetailResponse": {
      "properties": {
        "created_at": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "display_name": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "is_system": {
          "type": "boolean"
        },
        "name": {
          "type": "string"
        },
        "permissions": {
          "items": {
            "$ref": "#/definitions/response.PermissionResponse"
          },
          "type": "array"
        },
        "updated_at": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.RoleResponse": {
      "properties": {
        "created_at": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "display_name": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "is_system": {
          "type": "boolean"
        },
        "name": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.SalesStats": {
      "properties": {
        "average_order_value": {
          "type": "number"
        },
        "conversion_rate": {
          "description": "Placeholder for future implementation",
          "type": "number"
        },
        "period": {
          "type": "string"
        },
        "total_orders": {
          "type": "integer"
        },
        "total_revenue": {
          "type": "number"
        }
      },
      "type": "object"
    },
    "response.SettingResponse": {
      "properties": {
        "group": {
          "type": "string"
        },
        "key": {
          "type": "string"
        },
        "value": {}
      },
      "type": "object"
    },
    "response.ShippingMethodResponse": {
      "properties": {
        "base_cost": {
          "type": "number"
        },
        "code": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "enabled": {
          "type": "boolean"
        },
        "free_shipping_threshold": {
          "type": "number"
        },
        "id": {
          "type": "integer"
        },
        "sort_order": {
          "type": "integer"
        },
        "title": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.SuccessResponse": {
      "properties": {
        "message": {
          "type": "string"
        },
        "success": {
          "type": "boolean"
        }
      },
      "type": "object"
    },
    "response.TaxonomyDetailResponse": {
      "properties": {
        "children": {
          "items": {
            "$ref": "#/definitions/response.TaxonomyResponse"
          },
          "type": "array"
        },
        "count": {
          "type": "integer"
        },
        "created_at": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "image_url": {
          "type": "string"
        },
        "menu_order": {
          "type": "integer"
        },
        "meta": {
          "items": {
            "$ref": "#/definitions/response.MetaResponse"
          },
          "type": "array"
        },
        "name": {
          "type": "string"
        },
        "parent_id": {
          "type": "integer"
        },
        "slug": {
          "type": "string"
        },
        "term_id": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.TaxonomyResponse": {
      "properties": {
        "count": {
          "type": "integer"
        },
        "created_at": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "image_url": {
          "type": "string"
        },
        "menu_order": {
          "type": "integer"
        },
        "name": {
          "type": "string"
        },
        "parent_id": {
          "type": "integer"
        },
        "slug": {
          "type": "string"
        },
        "term_id": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.TaxonomyTreeResponse": {
      "properties": {
        "children": {
          "items": {
            "$ref": "#/definitions/response.TaxonomyTreeResponse"
          },
          "type": "array"
        },
        "count": {
          "type": "integer"
        },
        "description": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "image_url": {
          "type": "string"
        },
        "menu_order": {
          "type": "integer"
        },
        "name": {
          "type": "string"
        },
        "slug": {
          "type": "string"
        },
        "term_id": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.ToggleCouponStatusResponse": {
      "properties": {
        "coupon_id": {
          "type": "integer"
        },
        "message": {
          "type": "string"
        },
        "status": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.TokenLogListResponse": {
      "properties": {
        "items": {
          "items": {
            "$ref": "#/definitions/response.TokenLogResponse"
          },
          "type": "array"
        },
        "pagination": {
          "$ref": "#/definitions/response.PaginationResponse"
        }
      },
      "type": "object"
    },
    "response.TokenLogResponse": {
      "properties": {
        "access_token": {
          "type": "string"
        },
        "blacklisted_at": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        },
        "expires_at": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "ip_address": {
          "type": "string"
        },
        "is_active": {
          "description": "Computed field",
          "type": "boolean"
        },
        "is_blacklisted": {
          "type": "boolean"
        },
        "time_remaining": {
          "description": "Human readable time remaining",
          "type": "string"
        },
        "user": {
          "$ref": "#/definitions/response.UserResponse"
        },
        "user_agent": {
          "type": "string"
        },
        "user_id": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.TokenResponse": {
      "properties": {
        "access_token": {
          "type": "string"
        },
        "expires_in": {
          "type": "integer"
        },
        "refresh_token": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.TokenStatsResponse": {
      "properties": {
        "access_tokens": {
          "type": "integer"
        },
        "active_tokens": {
          "type": "integer"
        },
        "blacklisted_tokens": {
          "type": "integer"
        },
        "expired_tokens": {
          "type": "integer"
        },
        "refresh_tokens": {
          "type": "integer"
        },
        "total_tokens": {
          "type": "integer"
        }
      },
      "type": "object"
    },
    "response.UsageByDate": {
      "properties": {
        "count": {
          "type": "integer"
        },
        "date": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.UserDetailResponse": {
      "properties": {
        "addresses": {
          "items": {
            "$ref": "#/definitions/response.AddressResponse"
          },
          "type": "array"
        },
        "display_name": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "last_login_at": {
          "type": "string"
        },
        "meta": {
          "items": {
            "$ref": "#/definitions/response.MetaResponse"
          },
          "type": "array"
        },
        "registered_at": {
          "type": "string"
        },
        "role": {
          "$ref": "#/definitions/response.UserRole"
        },
        "status": {
          "type": "integer"
        },
        "username": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.UserResponse": {
      "properties": {
        "display_name": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "id": {
          "type": "integer"
        },
        "last_login_at": {
          "type": "string"
        },
        "registered_at": {
          "type": "string"
        },
        "role": {
          "$ref": "#/definitions/response.UserRole"
        },
        "status": {
          "type": "integer"
        },
        "username": {
          "type": "string"
        }
      },
      "type": "object"
    },
    "response.UserRole": {
      "properties": {
        "display_name": {
          "type": "string"
        },
        "name": {
          "type": "string"
        }
      },
      "type": "object"
    }
  },
  "paths": {
    "/admin/attributes": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.AttributeResponse"
              },
              "type": "array"
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateAttributeRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.AttributeResponse"
            }
          }
        }
      }
    },
    "/admin/attributes/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.AttributeDetailResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateAttributeRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/attributes/{id}/values": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.AttributeValueResponse"
              },
              "type": "array"
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateAttributeValueRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.AttributeValueResponse"
            }
          }
        }
      }
    },
    "/admin/attributes/{id}/values/{value_id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "path",
            "name": "value_id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "path",
            "name": "value_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateAttributeValueRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/auth/login": {
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.LoginRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.LoginResponse"
            }
          }
        }
      }
    },
    "/admin/auth/logout": {
      "post": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/auth/me": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.LoginUserResponse"
            }
          }
        }
      }
    },
    "/admin/auth/password-reset": {
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.ResetPasswordRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/auth/refresh": {
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.RefreshTokenRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.TokenResponse"
            }
          }
        }
      }
    },
    "/admin/auth/register": {
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.RegisterRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/coupons": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[code]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[type]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[active]",
            "type": "boolean"
          },
          {
            "in": "query",
            "name": "filter[min_amount]",
            "type": "number"
          },
          {
            "in": "query",
            "name": "filter[max_amount]",
            "type": "number"
          },
          {
            "in": "query",
            "name": "filter[start_date]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[end_date]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_direction",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.CouponListResponse"
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "coupon",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateCouponRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.CouponResponse"
            }
          }
        }
      }
    },
    "/admin/coupons/batch-status": {
      "put": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.BatchUpdateCouponStatusRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.BatchUpdateCouponStatusResponse"
            }
          }
        }
      }
    },
    "/admin/coupons/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "204": {}
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.CouponResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "coupon",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateCouponRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.CouponResponse"
            }
          }
        }
      }
    },
    "/admin/coupons/{id}/stats": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.CouponStatsResponse"
            }
          }
        }
      }
    },
    "/admin/coupons/{id}/toggle": {
      "post": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "status",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.ToggleCouponStatusRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.ToggleCouponStatusResponse"
            }
          }
        }
      }
    },
    "/admin/coupons/{id}/usage-history": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.CouponUsageHistoryResponse"
              },
              "type": "array"
            }
          }
        }
      }
    },
    "/admin/dashboard/order-status": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.OrderStatusStat"
              },
              "type": "array"
            }
          }
        }
      }
    },
    "/admin/dashboard/overview": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.OverviewStats"
            }
          }
        }
      }
    },
    "/admin/dashboard/recent-orders": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "limit",
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.OrderResponse"
              },
              "type": "array"
            }
          }
        }
      }
    },
    "/admin/dashboard/revenue": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "period",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.RevenuePeriodStat"
              },
              "type": "array"
            }
          }
        }
      }
    },
    "/admin/dashboard/sales": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "period",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.SalesStats"
              },
              "type": "array"
            }
          }
        }
      }
    },
    "/admin/dashboard/top-products": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "period",
            "required": true,
            "type": "string"
          },
          {
            "in": "query",
            "name": "limit",
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.ProductSalesStat"
              },
              "type": "array"
            }
          }
        }
      }
    },
    "/admin/email/logs": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[receiver]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[subject]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[type]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[status]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[user_id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[error_message]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[sent_at]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[created_at]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.EmailLogResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      }
    },
    "/admin/email/logs/cleanup": {
      "delete": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.DeleteOldEmailLogsRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/email/logs/{id}": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.EmailLogResponse"
            }
          }
        }
      }
    },
    "/admin/email/retry-failed": {
      "post": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/email/retry/{id}": {
      "post": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/email/settings": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.EmailSettingsResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.EmailSettingsRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/email/stats": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.EmailStatsResponse"
            }
          }
        }
      }
    },
    "/admin/email/templates": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.EmailTemplatesResponse"
            }
          }
        }
      }
    },
    "/admin/email/templates/{template_key}": {
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "template_key",
            "required": true,
            "type": "string"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.EmailTemplateRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/email/test": {
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.TestEmailRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/health": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/admin.HealthResponse"
            }
          }
        }
      }
    },
    "/admin/media": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[filename]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[title]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[mime_type]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[created_at]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.MediaResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      }
    },
    "/admin/media/upload": {
      "post": {
        "parameters": [
          {
            "in": "formData",
            "name": "file",
            "required": true,
            "type": "file"
          },
          {
            "in": "formData",
            "name": "alt_text",
            "type": "string"
          },
          {
            "in": "formData",
            "name": "title",
            "type": "string"
          },
          {
            "in": "formData",
            "name": "description",
            "type": "string"
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.MediaResponse"
            }
          }
        }
      }
    },
    "/admin/media/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.MediaResponse"
            }
          }
        }
      }
    },
    "/admin/order-shipment/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/order-shipments": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[order_id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[tracking_number]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[carrier]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[status]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[shipped_at]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[created_at]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.OrderShipmentResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateOrderShipmentRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.OrderShipmentResponse"
            }
          }
        }
      }
    },
    "/admin/order-shipments/order/{order_id}": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "order_id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.OrderShipmentResponse"
              },
              "type": "array"
            }
          }
        }
      }
    },
    "/admin/order-shipments/{id}": {
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateOrderShipmentRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.OrderShipmentResponse"
            }
          }
        }
      }
    },
    "/admin/orders": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "include",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[order_key]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[user_id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[order_total]",
            "type": "number"
          },
          {
            "in": "query",
            "name": "filter[subtotal]",
            "type": "number"
          },
          {
            "in": "query",
            "name": "filter[payment_gateway]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[payment_status]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[order_status]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[date_paid]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[date_completed]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[created_at]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.OrderResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      }
    },
    "/admin/orders/stats": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.OrderStatsResponse"
            }
          }
        }
      }
    },
    "/admin/orders/{id}": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.OrderDetailResponse"
            }
          }
        }
      }
    },
    "/admin/orders/{id}/status": {
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateOrderStatusRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/payment-gateways": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[title]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[gateway_id]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[enabled]",
            "type": "boolean"
          },
          {
            "in": "query",
            "name": "filter[created_at]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.GatewayListResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      }
    },
    "/admin/payment-gateways/available": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.AvailableProvidersResponse"
            }
          }
        }
      }
    },
    "/admin/payment-gateways/{gateway_id}": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "gateway_id",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.GatewayResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "gateway_id",
            "required": true,
            "type": "string"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateGatewayRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.GatewayResponse"
            }
          }
        }
      }
    },
    "/admin/payment-gateways/{gateway_id}/toggle": {
      "post": {
        "parameters": [
          {
            "in": "path",
            "name": "gateway_id",
            "required": true,
            "type": "string"
          },
          {
            "in": "query",
            "name": "enabled",
            "required": true,
            "type": "boolean"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.GatewayResponse"
            }
          }
        }
      }
    },
    "/admin/permissions": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[resource]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[action]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[name]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.PermissionResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreatePermissionRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.PermissionResponse"
            }
          }
        }
      }
    },
    "/admin/permissions/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.PermissionResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdatePermissionRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/posts": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "include",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[author_id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[status]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[type]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[title]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[slug]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[created_at]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.PostResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreatePostRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.PostResponse"
            }
          }
        }
      }
    },
    "/admin/posts/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.PostResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdatePostRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/products": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "include",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[name]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[slug]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[status]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[type]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[sale_price]",
            "type": "number"
          },
          {
            "in": "query",
            "name": "filter[parent_id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[created_at]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.ProductResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      }
    },
    "/admin/products/batch": {
      "delete": {
        "parameters": [
          {
            "in": "body",
            "name": "product_ids",
            "required": true,
            "schema": {
              "items": {
                "type": "integer"
              },
              "type": "array"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/products/category/{category_id}": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "category_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.ProductResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      }
    },
    "/admin/products/export": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "type",
            "type": "string"
          },
          {
            "in": "query",
            "name": "status",
            "type": "string"
          },
          {
            "in": "query",
            "name": "stock_status",
            "type": "string"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "min_price",
            "type": "number"
          },
          {
            "in": "query",
            "name": "max_price",
            "type": "number"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "type": "file"
            }
          }
        }
      }
    },
    "/admin/products/search": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "q",
            "required": true,
            "type": "string"
          },
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "type",
            "type": "string"
          },
          {
            "in": "query",
            "name": "status",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.ProductResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      }
    },
    "/admin/products/simple": {
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateSimpleProductRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.ProductResponse"
            }
          }
        }
      }
    },
    "/admin/products/status/batch": {
      "put": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.BatchUpdateProductStatusRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/products/stock/batch": {
      "put": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.BatchUpdateStockRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/products/stock/{id}": {
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "query",
            "name": "quantity",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/products/tag/{tag_id}": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "tag_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.ProductResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      }
    },
    "/admin/products/variable": {
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateVariableProductRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.ProductResponse"
            }
          }
        }
      }
    },
    "/admin/products/variants/{parent_id}": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "parent_id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.ProductWithVariantsResponse"
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "path",
            "name": "parent_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateVariantRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.ProductResponse"
            }
          }
        }
      }
    },
    "/admin/products/variants/{variant_id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "variant_id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "variant_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateVariantRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/products/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.ProductDetailResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateProductRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/roles": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[name]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[display_name]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[created_at]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.RoleDetailResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateRoleRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.RoleResponse"
            }
          }
        }
      }
    },
    "/admin/roles/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.RoleDetailResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateRoleRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/roles/{id}/permissions": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.RemovePermissionsRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.AssignPermissionsRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/settings": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.SuccessResponse"
                },
                {
                  "properties": {
                    "data": {
                      "additionalProperties": true,
                      "type": "object"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/domain.Setting"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "additionalProperties": true,
              "type": "object"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/settings/groups/{group}": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "group",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.SettingResponse"
              },
              "type": "array"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "group",
            "required": true,
            "type": "string"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "additionalProperties": {
                "type": "string"
              },
              "type": "object"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/settings/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/shipping-methods": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[code]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[title]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[enabled]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.ShippingMethodResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateShippingMethodRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.ShippingMethodResponse"
            }
          }
        }
      }
    },
    "/admin/shipping-methods/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.ShippingMethodResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateShippingMethodRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.ShippingMethodResponse"
            }
          }
        }
      }
    },
    "/admin/taxonomies/categories": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "taxonomy",
            "type": "string"
          },
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.TaxonomyResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateCategoryRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.TaxonomyResponse"
            }
          }
        }
      }
    },
    "/admin/taxonomies/categories/tree": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "taxonomy",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.TaxonomyTreeResponse"
              },
              "type": "array"
            }
          }
        }
      }
    },
    "/admin/taxonomies/categories/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.TaxonomyDetailResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateCategoryRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/taxonomies/tags": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "taxonomy",
            "type": "string"
          },
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.PaginatedResponse"
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateTagRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.TaxonomyResponse"
            }
          }
        }
      }
    },
    "/admin/taxonomies/tags/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.TaxonomyResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateTagRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/token-logs": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[user_id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[ip_address]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[is_blacklisted]",
            "type": "boolean"
          },
          {
            "in": "query",
            "name": "filter[expires_at]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[created_at]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.TokenLogResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      }
    },
    "/admin/token-logs/search": {
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.TokenLogFilters"
            }
          },
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.TokenLogListResponse"
            }
          }
        }
      }
    },
    "/admin/token-logs/stats": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.TokenStatsResponse"
            }
          }
        }
      }
    },
    "/admin/token-logs/{id}": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.TokenLogResponse"
            }
          }
        }
      }
    },
    "/admin/token-logs/{id}/blacklist": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.BlacklistTokenRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/users": {
      "get": {
        "parameters": [
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "search",
            "type": "string"
          },
          {
            "in": "query",
            "name": "sort_by",
            "type": "string"
          },
          {
            "in": "query",
            "name": "include",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[id]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[username]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[email]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[display_name]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[status]",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "filter[registered_at]",
            "type": "string"
          },
          {
            "in": "query",
            "name": "filter[last_login_at]",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "allOf": [
                {
                  "$ref": "#/definitions/response.PaginatedResponse"
                },
                {
                  "properties": {
                    "items": {
                      "items": {
                        "$ref": "#/definitions/response.UserResponse"
                      },
                      "type": "array"
                    }
                  },
                  "type": "object"
                }
              ]
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateUserRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.UserResponse"
            }
          }
        }
      }
    },
    "/admin/users/addresses/{user_id}": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.AddressResponse"
              },
              "type": "array"
            }
          }
        }
      },
      "post": {
        "parameters": [
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.CreateAddressRequest"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/response.AddressResponse"
            }
          }
        }
      }
    },
    "/admin/users/addresses/{user_id}/{address_id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "path",
            "name": "address_id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "path",
            "name": "address_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateAddressRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/users/addresses/{user_id}/{address_id}/default": {
      "patch": {
        "parameters": [
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "path",
            "name": "address_id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/users/{id}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.UserDetailResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.UpdateUserRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/users/{id}/meta": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "items": {
                "$ref": "#/definitions/response.MetaResponse"
              },
              "type": "array"
            }
          }
        }
      }
    },
    "/admin/users/{id}/meta/batch": {
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/admin.batchMetaRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/users/{id}/meta/{key}": {
      "delete": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "path",
            "name": "key",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      },
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "path",
            "name": "key",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.MetaResponse"
            }
          }
        }
      },
      "put": {
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "path",
            "name": "key",
            "required": true,
            "type": "string"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/admin.metaValueRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    },
    "/admin/users/{user_id}/tokens": {
      "get": {
        "parameters": [
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page",
            "type": "integer"
          },
          {
            "in": "query",
            "name": "page_size",
            "type": "integer"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.TokenLogListResponse"
            }
          }
        }
      }
    },
    "/admin/users/{user_id}/tokens/blacklist": {
      "post": {
        "parameters": [
          {
            "in": "path",
            "name": "user_id",
            "required": true,
            "type": "integer"
          },
          {
            "in": "body",
            "name": "request",
            "required": true,
            "schema": {
              "$ref": "#/definitions/request.BlacklistTokenRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/response.SuccessResponse"
            }
          }
        }
      }
    }
  }
};
