# Grand Bazaar Recipe Searcher

A recipe search tool for *Story of Seasons: Grand Bazaar*. Browse all 266 in-game recipes, filter by category and effect, and search by ingredient name.

## Features

- Search by ingredient or recipe name; press Enter to lock an ingredient and filter by multiple at once
- Filter by category (Salad, Soup, Side, Main Dish, Dessert, Other)
- Filter by effect type (Stamina Saver, Run Speed Up, etc.)
- Sort by sell price (ascending or descending)
- Click any ingredient badge on a card to add it as a filter

## Data source

Recipe data is sourced from:

- [StratsWiki](https://stratswiki.com/sos-gb/items/recipes/) for the core 266-recipe set
- The community spreadsheet used in this project for ingredient-slot wording and option lists: <https://docs.google.com/spreadsheets/d/17PUAMn7zTDnfk0vSOyO5nP_Q4e5YAtc4huzmq06KfLg/edit?gid=0#gid=0>

Ingredient entries are intentionally stored as exact slot text (including comma-separated alternatives and labels like `(any)`) to match the spreadsheet format.

## Tech stack

- React 18 + Vite 6
- No external UI libraries — all styling is inline
- Deployed to GitHub Pages via GitHub Actions on push to `main`

## Local development

```bash
npm install
npm run dev
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and deploys it to GitHub Pages at:

```
https://jwillett.github.io/grand-bazaar-recipe-searcher/
```
