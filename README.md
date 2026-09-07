# Habitual - Desktop Spreadsheet Habit Tracker

**Habitual** is a modern, aesthetic, interactive desktop web application designed to replace static spreadsheet habit trackers (like Etsy Microsoft Excel & Google Sheets planners) with dynamic progress calculation, real-time analytics charts, weekly circular progress rings, and a 31-day interactive habit grid.

![AuraHabit Banner](https://img.shields.io/badge/AuraHabit-Desktop%20Planner-6366f1?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JS%20%7C%20Chart.js-818cf8?style=for-the-badge)

---

## ✨ Features

- **📊 Dynamic Desktop Dashboard**: Widescreen layout with a top month picker, overall monthly completion ring, and 5 weekly circular progress meters (Week 1 to Week 5).
- **📈 Interactive Analytics Charts**:
  - **Daily Habit Count Chart**: Chart.js bar chart showing completions across days 1 to 31.
  - **Habit Count by Category**: Stacked horizontal bar chart showing progress across Health 🩺, Productivity ⚡, Family 👪, Fitness 🏋️, Sleep 🌙, Study 📚, Social 💬, Diet 🍎, and Career 💼.
- **📅 31-Day Interactive Spreadsheet Grid**:
  - Color-coded weekly header banners matching pastel planner aesthetics.
  - Glowing **Today Column Highlight** for the active date.
  - One-tap checkbox completion with Web Audio API chime sounds and confetti fanfare on 100% daily completion.
  - Progress ratio & mini visual progress bar per habit.
- **🚀 Onboarding & Presets**:
  - **Preset Routine Library**: One-click curated bundles (*Morning & Mindfulness, Fitness & Peak, High Performance, Wellbeing & Balance*).
  - **Fresh vs. Demo Mode**: Switch between clean real-world tracking and pre-filled sample datasets.
- **🖨️ PDF & Print Export**: Printable CSS rules for printing physical monthly sheets or exporting as PDF.
- **💾 LocalStorage & JSON Backup**: Save progress automatically across reloads with JSON export & restore capability.

---

## 🚀 Quick Start

1. Clone or download this repository:
   ```bash
   git clone https://github.com/piyush-1803/Habitual.git
   ```
2. Open `index.html` directly in any web browser, or serve locally using Python:
   ```bash
   py -m http.server 8080
   ```
3. Open `http://localhost:8080` in your web browser.

---

## 📁 Repository Structure

```
Habitual/
├── index.html        # Main desktop dashboard layout & modals
├── css/
│   └── styles.css    # Pastel design system, spreadsheet grid & print styles
├── js/
│   ├── storage.js    # LocalStorage engine, preset bundles & seed data
│   ├── analytics.js  # Math engine for weekly rings & daily totals
│   ├── notifications.js # Web Audio API chime synth & toast alerts
│   ├── components.js # Chart.js renderers & spreadsheet grid builder
│   └── app.js        # Controller & onboarding banner logic
└── README.md
```

---

## 🎨 Aesthetic Theme

Supports crisp pastel light mode and dark planner mode. Built with pure HTML5, CSS3, ES6 JavaScript, Chart.js, Lucide Icons, and Canvas Confetti.
