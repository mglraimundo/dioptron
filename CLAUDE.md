# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check (tsc -b) then bundle for production
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

There is no test framework configured.

## Architecture

**Dioptron** is a client-side web app for generating optical prescription PDFs at ULS Coimbra's Ophthalmology Service. Everything runs in the browser — no backend.

### State & Hooks (`src/hooks/`)

Three custom hooks own all persistent state:
- `useClinicalSession` — prescription form data (patient info, refraction values, dates, notes). Implements an **auto-sync pattern**: OD field values automatically mirror to OS until the user manually types in an OS field, which disables sync for that field.
- `useProviderConfig` — provider name, license number, and signature image (persisted to `localStorage` as `dioptronProviderConfig` / `dioptronProviderSignature`).
- `useBrandConfig` — custom logo and footer text for "personal mode" (persisted as `dioptronBrandConfig` / `dioptronBrandLogo`).

### PDF Generation (`src/lib/`)

All PDF generation is client-side via **pdfmake**:
- `pdfBase.ts` — shared building blocks (header, patient block, signature, barcode)
- `pdfGenerator.ts` — eyeglasses prescription
- `clPdfGenerator.ts` — contact lens prescription
- `blankPdfGenerator.ts` — blank template
- `formatters.ts` — optical value validation and formatting (diopters to `±X.XX`, 0.25 increments; axis clamping 1–180)
- `constants.ts` — institution branding (base64 logo, default footer text)

Barcodes (CODE39) are generated from the provider's license number via **jsbarcode** → canvas → PNG data URL → embedded in the PDF.

### Components (`src/components/`)

Specialized input components enforce optical domain rules:
- `DiopterInput` — validates sphere/cylinder values (±0.25 increments)
- `AxisInput` — clamps axis to 1–180°
- `DecimalInput` — generic decimal with step validation
- `RefractionGrid` — tabular OD/OS input for sphere, cylinder, axis, and add power
- `SignatureUpload` — handles base64 signature image storage

### Personal Mode

A hidden feature unlocked by clicking the avatar 3× (or via `?personal` URL param) that enables custom branding fields (`BrandConfigSection`). This is the only place institution branding can be overridden.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push to `main`.
