# Countdowns

A minimal, dark-mode countdown app for tracking important dates and
occasions.

## Features

-   Create multiple countdowns with an occasion name and target date.
-   Display each countdown in its own card.
-   Show a large remaining-days number, with **DAYS LEFT** directly
    beneath it.
-   Show the occasion name and target date at the bottom of each card.
-   Display **TODAY!** when the target date is today and **PASSED** when
    it is in the past.
-   Add, edit, and delete countdowns.
-   Sort upcoming countdowns by the nearest target date.
-   Save countdowns locally so they remain after closing or refreshing
    the app.

## Responsive layout

The app should work on phones, tablets, and desktop screens.

Include a grid layout selector that lets the user choose how many cards
appear in each row:

-   1 column
-   2 columns
-   3 columns
-   4 columns, where screen width permits

The selected layout should apply immediately and be saved locally. On
mobile, users should be able to choose 1, 2, or 3 columns. Cards must
resize to fit the available width without horizontal scrolling or
content overflow. Adjust card padding and typography so countdown
numbers, occasion names, and dates remain readable at every supported
column count.

Do not force a single-column layout on phones. The user must control the
number of columns.

## Design

-   Dark background: `#0D0D0F`
-   Countdown cards: `#18181B`
-   Primary text: `#FFFFFF`
-   Secondary text: `#A1A1AA`
-   Subtle purple or electric-blue accent
-   Clean typography, rounded corners, and consistent spacing
-   Minimal visual clutter and restrained transitions

Preserve the existing visual identity when making responsive changes.

## Date handling

-   Calculate remaining days accurately using the user's local calendar
    date.
-   Update countdown states as the date changes.
-   Handle today and past dates explicitly.
-   Avoid off-by-one errors caused by time-zone or time-of-day
    differences.

## Persistence

Use local storage or an equivalent local persistence mechanism for
both: 1. The user's countdown entries. 2. The user's selected
grid-column preference.

## Implementation notes

-   Build a functional application, not a static mockup.
-   Keep the interface usable with touch input on mobile devices.
-   Validate that occasion names and dates are provided.
-   Ensure the layout works at narrow phone widths as well as larger
    screens.
-   Preserve all existing countdown features when modifying the app.


## Build and publish on GitHub Pages

This project uses Vite. GitHub Pages must serve the production build, not the
project's TypeScript/React source files.

1. Install Node.js (LTS).
2. In the project directory, run `npm install`.
3. Run `npm run build`.
4. Open the generated `dist` directory. With the single-file Vite plugin,
   the deployable app is generated as `dist/index.html`.
5. Publish the **contents** of `dist` to the root of the branch selected in
   **Repository → Settings → Pages → Deploy from a branch** (for example,
   the `gh-pages` branch and `/ (root)` folder).
6. Do not publish the original project root or the `src` directory as the
   GitHub Pages site.

The Vite `base: "./"` setting keeps generated asset references relative, so
the site works when hosted under a GitHub repository path.

To preview the production build locally, run `npm run preview` after building.

## Automatic GitHub Pages deployment (no local Node.js required)

This project includes a GitHub Actions workflow at
`.github/workflows/deploy.yml`. GitHub automatically installs dependencies,
builds the app, and deploys the `dist` folder whenever you push to `main`.

To enable deployment:

1. Upload the **entire project**, including the hidden `.github` folder, to
the root of your GitHub repository on the `main` branch.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Push/commit the files to `main`, or run the workflow manually from the
**Actions** tab using **Deploy to GitHub Pages → Run workflow**.
5. Wait for the build and deploy jobs to finish successfully. The website URL
will appear in the deployment job and under **Settings → Pages**.

You do not need Node.js or a local build on your computer. GitHub's hosted
runner performs those steps. If your default branch is not `main`, change the
branch name in `.github/workflows/deploy.yml` to match it.
