export interface CheckoutSettings {
  allowGuestCheckout: boolean;
  requirePhone: boolean;
  enableOrderComments: boolean;
  autoCapturePayment: boolean;
  cartTtlMinutes: number;
}
