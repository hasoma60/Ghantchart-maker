# Gantt Chart Maker

This demo implements a local version of the **Project Costing Sheet - Pro** described in the PRD. The `single.html` file bundles the entire application in one document.
Data is kept only for the current session and is not saved to browser storage.

## Features

- Manage multiple project sheets by name
- Enter cost items for Manpower, Tools Purchase, Equipment Rental and Other
- Automatic amount calculations including detailed manpower formulas
- Save/load projects locally
- Export data to Excel or JSON and import from those formats
- Optional Gemini AI search over your costing data (requires API key)

## Usage

1. Open `single.html` in a browser.
2. Enter a project name and choose the currency.
3. Click **Load/Switch Project** to start editing that sheet.
4. Add items using the form and save when done.
5. Use the export/import buttons to move data between browsers.
6. Provide a Gemini API key if you want to try the AI search feature.

Data is kept only while the page is open – there is no cloud sync or persistent storage.
