# Terrain Contour Explorer 🏔️

An interactive, WebGL-accelerated 3D & 2D procedural landscape generator and real-time contour mapping laboratory.

![Terrain Contour Explorer Banner](https://img.shields.io/badge/Terrain%20Explorer-3D%20WebGL-ff5a36?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20%7C%20Plotly.js-00a8ff?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Features

- **🏔️ Procedural Multiscale Terrain Synthesis**:
  - Seed-driven deterministic PRNG (`Mulberry32`).
  - Domain-warped ridged multifractals generating realistic knife-edge arêtes, glacial cirques, and deep V-shaped valleys across a $24 \times 24\text{ km}$ massif.
- **📐 Real-Time Marching Squares Contour Extraction**:
  - High-precision contour line extraction with guarded linear edge interpolation.
  - Automatically identifies and emphasizes index contours (every 5th line bolded) across customizable 50m, 100m, and 200m intervals.
- **🔪 Dynamic Elevation Slice & Hypsometric Analysis**:
  - Smooth, `requestAnimationFrame`-throttled elevation slice plane ($z = c$).
  - Real-time **Hypsometric Area Readout**: computes the exact percentage of land area lying below the current slice plane via $O(\log N)$ binary search.
- **🎥 Dual Viewport Perspectives**:
  - **3D Perspective Mode**: Full 6-DOF orbit, pan, and zoom around the mountain range with ambient + specular directional sun lighting.
  - **2D Top-Down Mode**: Orthographic bird's-eye projection transforming the landscape into a clean topographic map with automated pan controls.
- **▶️ Auto-Sweep Animation**:
  - One-click auto-slice sweep dynamically showcasing contour line evolution as elevation ascends.
- **🎨 Curated Scientific & Topographic Color Themes**:
  - **Alpine Topo**: Lush valley green $\to$ highland olive $\to$ rocky brown $\to$ alpine snow.
  - **USGS Earth**: Classic earthy hypsometric tones.
  - **Viridis**: Perceptually uniform scientific palette.
  - **Magma Heat**: High-contrast thermal imaging palette.
  - **Slate Monolith**: Minimalist architectural dark palette.
- **📷 1-Click High-Res Snapshot**:
  - Instant $1920 \times 1080$ PNG render download for cartography, posters, or research.
- **⌨️ Keyboard Navigation**:
  - <kbd>Space</kbd>: Toggle auto-sweep animation
  - <kbd>←</kbd> / <kbd>→</kbd> or <kbd>↑</kbd> / <kbd>↓</kbd>: Nudge elevation slice
  - <kbd>2</kbd> / <kbd>3</kbd>: Switch between 2D Top-down and 3D Perspective
  - <kbd>N</kbd>: Generate new terrain seed

---

## 🚀 Quick Start

No build steps or dependencies required. Simply open `index.html` in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# Open in browser directly, or serve locally:
python -m http.server 8080
```

Then visit `http://localhost:8080` in your browser.

---

## 🎮 Controls

| Action | 3D Perspective Mode | 2D Top-Down Mode |
|---|---|---|
| **Rotate** | Left-click + drag | Disabled (locked to orthographic) |
| **Pan** | Right-click + drag / Shift + drag | Left-click + drag |
| **Zoom** | Mouse scroll wheel / Pinch | Mouse scroll wheel / Pinch |
| **Adjust Slice** | Slider / <kbd>←</kbd> <kbd>→</kbd> | Slider / <kbd>←</kbd> <kbd>→</kbd> |
| **Auto-Sweep** | <kbd>Space</kbd> / ▶ Play button | <kbd>Space</kbd> / ▶ Play button |

---

## 🛠️ Architecture & Tech Stack

- **Plotly.js (WebGL)**: 3D Surface & 3D Line scatter plots with custom lighting models.
- **Procedural Math**: 2D Gradient Perlin Noise with domain rotation and octave persistence.
- **Pure Client-Side**: Zero backend required; works entirely offline once loaded or cached.

---

## 📄 License

MIT License. Free to use, modify, and distribute for educational, scientific, or personal projects.
