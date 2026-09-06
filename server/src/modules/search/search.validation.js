import { z } from 'zod';
import mongoose from 'mongoose';

const SUPPORTED_COUNTRIES = [
  'gb', 'us', 'at', 'au', 'be', 'br', 'ca', 'ch', 'de', 'es', 
  'fr', 'in', 'it', 'mx', 'nl', 'nz', 'pl', 'ru', 'sg', 'za'
];

export const searchQuerySchema = z.object({
  resumeId: z.string().optional().refine(
    (val) => !val || mongoose.Types.ObjectId.isValid(val),
    { message: 'Invalid resume ID format' }
  ),
  query: z.string().optional(),
  country: z.string().toLowerCase().refine(
    (val) => SUPPORTED_COUNTRIES.includes(val),
    { message: 'COUNTRY_NOT_SUPPORTED' }
  ),
  cityOrState: z.string().optional(),
  workArrangement: z.enum(['remote', 'onsite', 'hybrid']).optional(),
}).refine(
  (data) => data.resumeId || data.query,
  {
    message: 'Either resumeId or query must be provided',
    path: ['query']
  }
);
