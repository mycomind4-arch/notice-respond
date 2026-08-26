# MailMyPDF Gateway Build Specification

The gateway is the only public routing layer for `mailmypdf.ai`.

## Responsibilities

- map canonical public paths to the owning repo/service
- serve product-aware placeholders when a target is not connected
- enforce the global navigation shell
- expose one MailMyPDF authentication/account model
- generate the ecosystem-wide sitemap
- expose prelaunch indexing controls
- redirect legacy deployment hostnames to canonical URLs after migration

## Route precedence

1. core implementation
2. connected vertical implementation
3. platform/API route
4. placeholder

## Route ownership manifest

```text
Core:
  /, /send, /write, /pricing, /ecosystem, /resources, /templates

Appeal Mail:
  /appeal/*

Notice Respond:
  /notice/*

Immigration Mail:
  /immigration/*

Dispute Mail:
  /dispute/*

Small Business:
  /business/*

Future products:
  /records/*
  /tenant/*
  /permit/*
  /benefits/*
  /claim/*
  /govreply/*
  /future/*
```

## Placeholder implementation

The gateway should generate a reusable placeholder component from the route registry rather than one manually authored page per route. Each route nevertheless has an explicit manifest entry, stable canonical metadata, and stable URL.

## Navigation

The gateway owns the global shell. Product repositories provide product-specific navigation only.

## Authentication

The gateway consumes the MailMyPDF Account identity layer. Customer history and account routes are protected. Admin routes require server-side platform role authorization.

## SEO

The gateway owns `sitemap.xml`, `robots.txt`, and canonical host metadata. Individual repos must not decide the public hostname independently.
