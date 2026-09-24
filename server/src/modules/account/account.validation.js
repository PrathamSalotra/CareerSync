import { z } from 'zod';

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Confirmation must be exactly "DELETE"' })
  })
});
