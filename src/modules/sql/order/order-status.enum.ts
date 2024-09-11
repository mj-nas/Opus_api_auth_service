export enum OrderStatus {
  PaymentPending = 'Payment Pending',
  PaymentFailed = 'Payment Failed',
  Ordered = 'Ordered',
  Cancelled = 'Cancelled',
  Shipped = 'Shipped',
  ShippingFailed = 'Shipping Failed',
  Delivered = 'Delivered',
}

export enum OrderStatusLevel {
  PaymentPending = 1,
  PaymentFailed = 2,
  Cancelled = 3,
  Ordered = 4,
  Shipped = 5,
  ShippingFailed = 6,
  Delivered = 7,
}
