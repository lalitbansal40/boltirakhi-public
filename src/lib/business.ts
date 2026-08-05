/**
 * Business details that appear in more than one place.
 *
 * The phone number is shown on Contact, Shipping and Refunds, and dialled from
 * the cart and the checkout. Written out by hand in five places it would be
 * changed in four of them one day, and a customer would ring the fifth.
 */

export const SUPPORT_PHONE_DISPLAY = '+91 96641 14023';

/**
 * Country code included on purpose. Without it the link fails from a phone
 * roaming abroad, and on some Android dialers it fails outright.
 */
export const SUPPORT_PHONE_HREF = 'tel:+919664114023';
