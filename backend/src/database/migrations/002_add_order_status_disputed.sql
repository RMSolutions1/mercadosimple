-- Añade estado "disputed" al enum de órdenes (PostgreSQL).
-- Ejecutar una sola vez si la BD ya existía antes de este cambio y no usás synchronize.
-- ALTER TYPE puede requerir permisos de superusuario según versión.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public' AND t.typname = 'orders_status_enum' AND e.enumlabel = 'disputed'
  ) THEN
    ALTER TYPE "public"."orders_status_enum" ADD VALUE 'disputed';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
