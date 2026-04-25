import { registerOTel } from '@vercel/otel';
 
export function register() {
  registerOTel({ 
    serviceName: 'sase-310-sistema-escolar',
    instrumentationConfig: {
      fetch: {
        // Propagate tracing context to our Supabase backend
        // This ensures traces continue into database operations
        propagateContextUrls: [
          'vsqpjhfzvzqvmzqvmzqv.supabase.co', 
          'api.sase.mx'
        ],
      },
    },
  });
}
