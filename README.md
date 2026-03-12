# Dioptron

**Optical Prescription Platform — Serviço de Oftalmologia, ULS Coimbra**

Dioptron is a client-side web application for generating optical prescriptions for the department of Ophthalmology of ULS Coimbra, Portugal. The clinician enters the patient's refraction data and prints a ready-to-sign PDF — for eyeglasses, contact lenses, or a blank prescription template.

No data is ever sent to a server. No clinical information is persisted anywhere. The doctor's name, medical license number, and signature are stored locally in the browser for convenience.

---

## Features

- **Three prescription types** — eyeglasses, contact lenses, and blank prescription templates
- **Refraction grid** — structured OD/OS input for sphere, cylinder, axis, and addition power, with field-level validation (0.25-step diopters, 1–180° axis)
- **Auto-sync fields** — addition power, base curve, and diameter automatically mirror from OD to OS until manually overridden
- **Client-side PDF generation** — produces a formatted, institution-branded prescription using [pdfmake](https://pdfmake.github.io/docs/), ready to print and sign
- **Barcode** — the doctor's medical license number is embedded as a CODE39 barcode in every PDF
- **Doctor info persistence** — name, license number, and handwritten signature image are saved in `localStorage` and restored on every visit
- **Custom branding** — a hidden personal mode (click the avatar three times, or open `?personal`) allows replacing the institution logo and footer text with custom ones

---

## Stack

| | |
|---|---|
| Framework | React 19 + Vite 7 + TypeScript 5 |
| Styling | Tailwind CSS 4 |
| PDF | pdfmake 0.3 (client-side) |
| Barcode | jsbarcode 3.12 (CODE39, canvas → PNG → PDF) |
| Storage | `localStorage` — doctor info and signature only |
| Backend | None |

---

## Getting Started

### Prerequisites

[Node.js](https://nodejs.org/) v18 or later. If you don't have it, [nvm](https://github.com/nvm-sh/nvm) is the recommended way to install it:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
# restart your terminal, then:
nvm install --lts
```

### Install and run

```bash
git clone git@github.com:mglraimundo/dioptron.git
cd dioptron
npm install
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
```

The `dist/` folder contains static files that can be served by any web server — no Node.js required at runtime.

### Deploy to GitHub Pages

The repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes the app automatically on every push to `main` — no manual build step needed.

**One-time setup:**

1. Go to your repository on GitHub
2. **Settings → Pages → Build and deployment → Source** → select **GitHub Actions**
3. Push any commit to `main` — the workflow runs, and your app is live

---

## The Name

The *dioptre* (or diopter) is the unit of measurement for the refractive power of a lens — the fundamental quantity in every prescription this app produces. *Dioptron* (διοπτρον) is the Ancient Greek word for a sighting instrument or mirror, used to observe or measure what cannot be seen with the naked eye. In ophthalmology, refraction is precisely that: the indirect measurement of the eye's optical system to determine the correction it needs.

---

## Author

Developed by **Miguel Raimundo**.

---

## License

[MIT](LICENSE)
