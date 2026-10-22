# IoT Sensor Time-Series Analytics

An interactive time-series analytics dashboard for simulated IoT sensors. Review sensor health, missing readings, unusual values, daily patterns, and per-device summaries.

## Features
- Sensor overview and health KPIs
- Sensor/device filters and time-window selector
- Temperature and humidity time-series visualizations
- Data-quality checks for missing and out-of-range readings
- Device-level comparison table

## Deploy on GitHub Pages
1. Create a **public** GitHub repository for this project.
2. Upload the **contents of this folder** (`index.html`, `styles.css`, and `app.js`) to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose branch `main` and folder `/(root)`, then click **Save**.
6. Wait for GitHub Pages to publish the site. The URL appears on the Pages settings screen.

## Run locally
Open `index.html` in a browser. No build step, package installation, environment variables, or backend is required.

## Important data note
Sensor readings and flagged anomalies are synthetic examples for demonstration. An anomaly flag is a review cue, not proof of a faulty sensor.

Do not claim synthetic data as real customer or production results. This is a portfolio demonstration of dashboard interaction and analytics concepts.
