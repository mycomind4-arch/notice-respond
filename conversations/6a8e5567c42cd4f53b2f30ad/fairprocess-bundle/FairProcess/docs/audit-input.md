# Audit input contract

Real case data must be stored outside this repository. FairProcess currently
accepts one case JSON file and one recorder CSV export.

## Case JSON

```json
{
  "caseId": "your-internal-case-id",
  "jurisdiction": "Humboldt County, California",
  "agencyCaseNumber": "optional-agency-number",
  "asOf": "2026-07-16",
  "apns": ["000-000-000-000"],
  "recorderSearch": {
    "searchedOn": "2026-07-16",
    "source": "description or URL of the search performed",
    "scope": "self_service_index",
    "notes": "optional explanation of search limitations"
  },
  "expectations": [
    {
      "ruleId": "humboldt-hcc-352-4-c",
      "instrumentKind": "notice_of_violation_and_proposed_penalty",
      "servedOn": "2026-01-01"
    }
  ]
}
```

Allowed recorder search scopes are `self_service_index`, `certified_search`,
`agency_export`, and `unknown`. The scope is preserved in the report so an
index search is not misrepresented as a certified title search.

## Recorder CSV

The first row must contain these exact headings:

```csv
instrument_number,recorded_on,apn,instrument_kind,party
```

Each row represents one APN and optional party associated with an instrument.
Repeat the instrument number on additional rows when it contains multiple APNs
or parties. `recorded_on` uses `YYYY-MM-DD`. `instrument_kind` must use one of
the normalized kinds defined by the policy engine:

- `notice_of_violation_and_proposed_penalty`
- `final_finding_and_order`
- `resolution_documentation`
- `administrative_civil_penalty_lien`

An empty CSV with only the header means no matching recorder rows were supplied;
it does not prove that no record exists.

## Outputs

- `integrity-report.json` preserves structured findings and search limitations.
- `integrity-report.md` is a reviewable report suitable for conversion to PDF
  after a human verifies the inputs and conclusions.

The CLI refuses malformed dates, unknown rules, duplicate rules, missing APNs,
and incomplete CSV headers rather than guessing.

