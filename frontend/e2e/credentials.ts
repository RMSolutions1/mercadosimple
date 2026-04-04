/**
 * Credenciales E2E. Comprador/vendedor requieren `SEED_DEMO_USERS=true` al ejecutar `npm run seed` en el backend.
 * Admin: misma clave que `ADMIN_SEED_PASSWORD` en backend/.env (por defecto la de backend/.env.example).
 */
export const e2eCreds = {
  buyerEmail: process.env.E2E_BUYER_EMAIL ?? 'comprador@mercadosimple.com',
  buyerPassword: process.env.E2E_BUYER_PASSWORD ?? 'Comprador123*',
  sellerEmail: process.env.E2E_SELLER_EMAIL ?? 'techstore@mercadosimple.com',
  sellerPassword: process.env.E2E_SELLER_PASSWORD ?? 'Vendedor123*',
  adminEmail: process.env.E2E_ADMIN_EMAIL ?? 'admin@mercadosimple.com',
  adminPassword:
    process.env.E2E_ADMIN_PASSWORD ??
    process.env.ADMIN_SEED_PASSWORD ??
    'CambiarEstaClave2026!',
};
