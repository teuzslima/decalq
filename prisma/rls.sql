-- Row-Level Security: isolamento multi-tenant reforçado pelo Postgres.
-- A aplicação seta o tenant atual com set_config('app.tenant_id', ...) por transação.

CREATE OR REPLACE FUNCTION current_tenant() RETURNS text AS $$
  SELECT nullif(current_setting('app.tenant_id', true), '');
$$ LANGUAGE sql STABLE;

DO $$
DECLARE
  t text;
  business_tables text[] := ARRAY[
    'tenant_domains','users','usage_meters','ledger_entries',
    'billings','styles','source_images','generations'
  ];
BEGIN
  FOREACH t IN ARRAY business_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I;', t);

    IF t = 'styles' THEN
      EXECUTE format($p$
        CREATE POLICY tenant_isolation ON %I
        USING (tenant_id IS NULL OR tenant_id = current_tenant())
        WITH CHECK (tenant_id IS NULL OR tenant_id = current_tenant());
      $p$, t);
    ELSE
      EXECUTE format($p$
        CREATE POLICY tenant_isolation ON %I
        USING (tenant_id = current_tenant())
        WITH CHECK (tenant_id = current_tenant());
      $p$, t);
    END IF;
  END LOOP;
END $$;
