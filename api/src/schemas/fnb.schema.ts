import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    title: z.string("unit-title-is-string").min(1, 'unit-title-is-required'),
    description: z.string("unit-description-is-string").min(1, 'unit-description-is-required'),
    price: z.number("unit-rent_price-is-number"),
  })
});

// INI MAGIC-NYA: Otomatis jadi tipe data TypeScript tanpa nulis ulang!
export type RegisterInput = z.infer<typeof registerSchema>['body'];