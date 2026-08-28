# Notice Respond — Master Workflow Directory

Notice Respond is the master product for the broader **respond to an official notice** search-intent category.

This repository owns the workflows beneath that category. A new notice type should normally become a workflow/page/route here rather than a new repository.

## Workflow model

**Notice type → source documents → extracted facts → deadline/requirements → evidence → research → response → review → MailMyPDF**

## Initial workflow families

- Government notice response
- Tax notice response
- DMV notice response
- Benefits notice response
- Code enforcement notice response
- Permit correction response
- Licensing/compliance notice response
- Agency correspondence response

Each workflow should have its own search-intent mapping, document requirements, extraction fields, response structure, and authoritative research sources where needed.

## SEO rule

A workflow deserves a dedicated canonical page when the user intent, supporting information, workflow steps, or output materially differ. Do not generate thin keyword variants of the same page.

## Architecture rule

Keep shared identity, document storage, payments, mailing, tracking, proof, and design-system primitives in the MailMyPDF/platform layer. Keep notice-specific intelligence and workflow logic here.
