/**
 * Business details that appear in more than one place.
 *
 * Every legal page, the footer, the contact page and the checkout read from
 * here. Written out by hand they would live in about thirty places, and the
 * day one of them changed, three would be missed — and those three are the
 * ones a customer would ring, write to, or quote back at us.
 */

export const LEGAL_NAME = 'Bolti Rakhi';

export const SUPPORT_PHONE_DISPLAY = '+91 96641 14023';

/**
 * Country code included on purpose. Without it the link fails from a phone
 * roaming abroad, and on some Android dialers it fails outright.
 */
export const SUPPORT_PHONE_HREF = 'tel:+919664114023';

export const SUPPORT_EMAIL = 'hello@boltirakhi.com';
export const SUPPORT_EMAIL_HREF = 'mailto:hello@boltirakhi.com';

/** Shown wherever we invite somebody to ring, so nobody calls at midnight. */
export const SUPPORT_HOURS = '9:00 am to 8:00 pm, all days';

export const GST_NUMBER = '08GKKPB7983M1ZA';

/** Where a court case would be filed. The city alone, not the full address. */
export const JURISDICTION_CITY = 'Jaipur';

/**
 * Lines, not one string. The footer wants this on a single line, Contact
 * wants it stacked, and an invoice wants it stacked with the country last.
 */
export const ADDRESS_LINES = [
  '201, Punam Vihar',
  'Jagatpura',
  'Jaipur 302017',
  'Rajasthan, India',
] as const;

/** The one-line form, for a footer or an email signature. */
export const ADDRESS_ONE_LINE = ADDRESS_LINES.join(', ');
