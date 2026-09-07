/* ==========================================================================
   AuraHabit - Desktop Spreadsheet Controller & Onboarding Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const state = {
    currentMonth: 8, // September (current time in system: Sep 2026)
    currentYear: 2026,
    habits: [],
    logs: {},
    settings: { soundEnabled: true, theme: 'light', isDemoMode: false, dismissedBanner: false }
  };

  function initApp() {
    loadData();
    setupTheme();
    setupEventListeners();
    renderDashboard();
  }

  function loadData() {
    state.habits = Storage.getHabits();
    state.logs = Storage.getLogs();
    state.settings = Storage.getSettings();

    if (state.settings.currentMonth !== undefined) state.currentMonth = state.settings.currentMonth;
    if (state.settings.currentYear !== undefined) state.currentYear = state.settings.currentYear;

    // Check banner visibility
    const banner = document.getElementById('onboarding-banner');
    if (banner) {
      banner.style.display = state.settings.dismissedBanner ? 'none' : 'flex';
    }
  }

  function setupTheme() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', state.settings.theme === 'dark' ? 'sun' : 'moon');
    }
  }

  function toggleTheme() {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    Storage.saveSettings(state.settings);
    setupTheme();
  }

  function renderDashboard() {
    loadData();

    // Month & Year Display
    const monthName = MONTH_NAMES[state.currentMonth];
    document.getElementById('current-month-name').innerText = monthName;
    document.getElementById('current-year-num').innerText = state.currentYear;

    const bannerMonth = document.getElementById('banner-month-name');
    if (bannerMonth) bannerMonth.innerText = monthName;

    // Today indicator badge
    const todayIndicator = document.getElementById('today-focus-indicator');
    if (todayIndicator) {
      const now = new Date();
      if (now.getMonth() === state.currentMonth && now.getFullYear() === state.currentYear) {
        todayIndicator.innerHTML = `<i data-lucide="calendar"></i> Today: ${monthName.slice(0, 3)} ${now.getDate()}`;
        todayIndicator.style.display = 'inline-flex';
      } else {
        todayIndicator.style.display = 'none';
      }
    }

    // Data Mode label button
    const modeLabel = document.getElementById('data-mode-label');
    if (modeLabel) {
      modeLabel.innerText = state.settings.isDemoMode ? 'Demo Mode (Sample Data)' : 'Fresh Mode (Your Routine)';
    }

    // Calculate Month Analytics
    const monthStats = Analytics.calculateMonthStats(state.currentYear, state.currentMonth, state.habits, state.logs);

    // 1. Render Summary Rings
    Components.renderSummaryRings(monthStats, monthName);

    // 2. Render Charts
    Components.renderDailyChart('daily-count-chart', monthStats.days, monthStats.dailyCompleted);
    Components.renderCategoryChart('category-count-chart', monthStats.categoryBreakdown);

    // 3. Render Spreadsheet Table Header, Body, and Footers
    Components.renderTableHeader(monthStats.days, state.currentMonth, state.currentYear);
    Components.renderTableBodyAndFooter(
      state.habits,
      monthStats,
      state.logs,
      state.currentMonth,
      state.currentYear,
      (dateKey, habitId) => handleCellToggle(dateKey, habitId),
      (habitId) => handleDeleteHabit(habitId)
    );

    if (window.lucide) lucide.createIcons();
  }

  function handleCellToggle(dateKey, habitId) {
    const isNowChecked = Storage.toggleCell(dateKey, habitId);
    state.logs = Storage.getLogs();

    if (isNowChecked) {
      SoundEngine.playCheckSound();

      const monthStats = Analytics.calculateMonthStats(state.currentYear, state.currentMonth, state.habits, state.logs);
      const dayIdx = monthStats.days.findIndex(d => d.dateKey === dateKey);
      if (dayIdx >= 0 && monthStats.dailyPercent[dayIdx] === 100) {
        SoundEngine.playFanfare();
        triggerConfetti();
        showToast(`100% Habits Completed on ${dateKey}! Outstanding! 🎉`, 'success');
      }
    }

    renderDashboard();
  }

  function handleDeleteHabit(habitId) {
    if (confirm('Delete this habit row from the spreadsheet?')) {
      Storage.deleteHabit(habitId);
      showToast('Habit deleted.', 'info');
      renderDashboard();
    }
  }

  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#0d9488', '#e11d48', '#9333ea', '#16a34a']
      });
    }
  }

  /* --------------------------------------------------------------------------
     Preset Library & Modal Controls
     -------------------------------------------------------------------------- */
  function openHabitModal() {
    document.getElementById('habit-form').reset();
    document.getElementById('habit-id').value = '';
    document.getElementById('habit-modal').classList.remove('hidden');
  }

  function closeHabitModal() {
    document.getElementById('habit-modal').classList.add('hidden');
  }

  function openPresetModal() {
    const container = document.getElementById('preset-bundle-list');
    Components.renderPresetBundles(container, (bundleId) => {
      Storage.applyPresetBundle(bundleId);
      closePresetModal();
      showToast('Preset routine bundle loaded into your planner!', 'success');
      renderDashboard();
    });

    document.getElementById('template-modal').classList.remove('hidden');
  }

  function closePresetModal() {
    document.getElementById('template-modal').classList.add('hidden');
  }

  /* --------------------------------------------------------------------------
     Event Listeners
     -------------------------------------------------------------------------- */
  function setupEventListeners() {
    // Month Picker Navigation
    document.getElementById('prev-month-btn').addEventListener('click', () => {
      if (state.currentMonth === 0) {
        state.currentMonth = 11;
        state.currentYear--;
      } else {
        state.currentMonth--;
      }
      state.settings.currentMonth = state.currentMonth;
      state.settings.currentYear = state.currentYear;
      Storage.saveSettings(state.settings);
      renderDashboard();
    });

    document.getElementById('next-month-btn').addEventListener('click', () => {
      if (state.currentMonth === 11) {
        state.currentMonth = 0;
        state.currentYear++;
      } else {
        state.currentMonth++;
      }
      state.settings.currentMonth = state.currentMonth;
      state.settings.currentYear = state.currentYear;
      Storage.saveSettings(state.settings);
      renderDashboard();
    });

    // Theme & Data Mode Toggles
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

    document.getElementById('data-mode-toggle-btn').addEventListener('click', () => {
      if (state.settings.isDemoMode) {
        Storage.resetToFreshState();
        showToast('Switched to Fresh Mode for new tracking!', 'info');
      } else {
        Storage.loadDemoData();
        showToast('Loaded sample Demo Data dataset!', 'success');
      }
      renderDashboard();
    });

    // Onboarding Banner Actions
    document.getElementById('banner-presets-btn').addEventListener('click', openPresetModal);
    document.getElementById('banner-fresh-btn').addEventListener('click', () => {
      Storage.resetToFreshState();
      showToast('Fresh clean grid ready for your routine!', 'success');
      renderDashboard();
    });

    document.getElementById('dismiss-banner-btn').addEventListener('click', () => {
      state.settings.dismissedBanner = true;
      Storage.saveSettings(state.settings);
      document.getElementById('onboarding-banner').style.display = 'none';
    });

    // Presets Modal Triggers
    document.getElementById('preset-library-btn').addEventListener('click', openPresetModal);
    document.getElementById('open-preset-modal-btn').addEventListener('click', openPresetModal);
    document.getElementById('close-template-modal-btn').addEventListener('click', closePresetModal);

    // Modal Add Triggers
    document.getElementById('add-habit-btn').addEventListener('click', openHabitModal);
    document.getElementById('add-table-row-btn').addEventListener('click', openHabitModal);
    document.getElementById('close-modal-btn').addEventListener('click', closeHabitModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', closeHabitModal);

    // Form Submit
    document.getElementById('habit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('habit-name').value.trim();
      const category = document.getElementById('habit-category').value;
      const monthGoal = parseInt(document.getElementById('habit-month-goal').value) || 20;

      Storage.saveHabit({ name, category, monthGoal });
      closeHabitModal();
      showToast('Habit added to your spreadsheet!', 'success');
      renderDashboard();
    });

    // Toolbar Quick Actions
    document.getElementById('check-today-all-btn').addEventListener('click', () => {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayKey = `${now.getFullYear()}-${mm}-${dd}`;

      Storage.checkAllForToday(todayKey);
      SoundEngine.playFanfare();
      triggerConfetti();
      showToast('All habits marked completed for Today! 🎉', 'success');
      renderDashboard();
    });

    document.getElementById('clear-month-logs-btn').addEventListener('click', () => {
      if (confirm(`Clear all completion checkboxes for ${MONTH_NAMES[state.currentMonth]} ${state.currentYear}?`)) {
        Storage.clearMonthLogs(state.currentYear, state.currentMonth);
        showToast('Month logs cleared.', 'info');
        renderDashboard();
      }
    });

    // Print & PDF Export
    document.getElementById('print-sheet-btn').addEventListener('click', () => {
      window.print();
    });
  }

  initApp();
});
