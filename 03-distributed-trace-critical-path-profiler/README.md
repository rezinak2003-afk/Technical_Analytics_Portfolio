# Distributed Trace Critical-Path Profiler

An interactive trace analytics dashboard built around a simulated microservice environment. Explore trace latency, error distribution, service-level timing, and representative dependency paths.

## Features
- Trace volume, p50/p95/p99 latency, and error KPIs
- Service and status filters
- Latency distribution and service timing charts
- Sample trace table with critical-path labels
- Architecture explanation and reproducible synthetic dataset logic

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
This browser-based project illustrates trace analytics with synthetic spans. The displayed critical path is a simplified portfolio model, not an analysis of a real production system.

Do not claim synthetic data as real customer or production results. This is a portfolio demonstration of dashboard interaction and analytics concepts.
