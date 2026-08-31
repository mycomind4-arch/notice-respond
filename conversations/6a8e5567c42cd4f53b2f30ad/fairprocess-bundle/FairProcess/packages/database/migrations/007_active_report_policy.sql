-- Enforce the governed active-policy lifecycle at the database boundary.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM policy_bundles
    WHERE activation_status = 'active'
    GROUP BY jurisdiction
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'cannot enforce one active policy per jurisdiction: duplicate active policy bundles exist'
      USING ERRCODE = '23505';
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS policy_bundles_one_active_per_jurisdiction
  ON policy_bundles (jurisdiction)
  WHERE activation_status = 'active';

-- Reports may only be generated against the active policy for their case jurisdiction.
CREATE OR REPLACE FUNCTION require_active_report_policy()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  policy_status TEXT;
  policy_jurisdiction TEXT;
  case_jurisdiction TEXT;
BEGIN
  IF NEW.policy_bundle_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT activation_status, jurisdiction
  INTO policy_status, policy_jurisdiction
  FROM policy_bundles
  WHERE id = NEW.policy_bundle_id;

  SELECT jurisdiction
  INTO case_jurisdiction
  FROM cases
  WHERE id = NEW.case_id;

  IF policy_status IS DISTINCT FROM 'active'
     OR policy_jurisdiction IS DISTINCT FROM case_jurisdiction THEN
    RAISE EXCEPTION 'integrity report policy bundle must be active and match the case jurisdiction'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS integrity_reports_require_active_policy ON integrity_reports;
CREATE TRIGGER integrity_reports_require_active_policy
BEFORE INSERT OR UPDATE OF case_id, policy_bundle_id ON integrity_reports
FOR EACH ROW
EXECUTE FUNCTION require_active_report_policy();
