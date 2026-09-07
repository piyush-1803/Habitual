/* ==========================================================================
   AuraHabit - Professional Desktop Component Renderer
   ========================================================================== */

let dailyChartInstance = null;
let categoryChartInstance = null;

const Components = {
  // Update Top Summary Circular Progress Rings
  renderSummaryRings(monthStats, monthName) {
    document.getElementById('summary-month-heading').innerText = monthName;

    // Overall Ring
    const overallFill = document.getElementById('ring-overall-fill');
    const overallText = document.getElementById('ring-overall-percent');
    const totalComp = document.getElementById('total-completed-count');
    const totalGoal = document.getElementById('total-goal-count');

    if (overallFill) {
      const circ = 238; // 2 * pi * 38
      const offset = circ - (monthStats.overallPercent / 100) * circ;
      overallFill.style.strokeDashoffset = offset;
    }
    if (overallText) overallText.innerText = `${monthStats.overallPercent}%`;
    if (totalComp) totalComp.innerText = monthStats.overallCompleted;
    if (totalGoal) totalGoal.innerText = monthStats.overallGoal;

    // Weekly Rings (Week 1..5)
    ['w1', 'w2', 'w3', 'w4', 'w5'].forEach(wId => {
      const fill = document.getElementById(`ring-${wId}-fill`);
      const text = document.getElementById(`ring-${wId}-percent`);
      const pct = monthStats.weeklyStats[wId] || 0;

      if (fill) {
        const circ = 201; // 2 * pi * 32
        const offset = circ - (pct / 100) * circ;
        fill.style.strokeDashoffset = offset;
      }
      if (text) text.innerText = `${pct}%`;
    });
  },

  // Render Chart.js Daily Habit Count Bar Chart
  renderDailyChart(canvasId, days, dailyCompleted) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (dailyChartInstance) dailyChartInstance.destroy();

    const labels = days.map(d => d.dayNumber);
    const data = dailyCompleted;

    // Detect today's day number for accent color
    const todayNum = new Date().getDate();

    const bgColors = days.map(d => d.dayNumber === todayNum ? '#4f46e5' : '#818cf8');

    dailyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Completed Habits',
          data: data,
          backgroundColor: bgColors,
          borderRadius: 4,
          barThickness: 9
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => `Day ${items[0].label}`,
              label: (item) => `${item.raw} Habits Completed`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 } } },
          y: { beginAtZero: true, ticks: { stepSize: 2, font: { size: 9 } } }
        }
      }
    });
  },

  // Render Chart.js Category Count Horizontal Bar Chart
  renderCategoryChart(canvasId, categoryBreakdown) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (categoryChartInstance) categoryChartInstance.destroy();

    const categoriesList = Object.values(categoryBreakdown);
    const labels = categoriesList.map(c => c.name);
    const completedData = categoriesList.map(c => c.completed);
    const notCompletedData = categoriesList.map(c => c.notCompleted);

    categoryChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Completed', data: completedData, backgroundColor: '#6366f1', borderRadius: 3, barThickness: 10 },
          { label: 'Remaining Goal', data: notCompletedData, backgroundColor: '#cbd5e1', borderRadius: 3, barThickness: 10 }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { stacked: true, ticks: { font: { size: 9 } } },
          y: { stacked: true, grid: { display: false }, ticks: { font: { size: 9 } } }
        }
      }
    });
  },

  // Render Table Header Day Rows with Today Column Highlight
  renderTableHeader(days, currentMonth, currentYear) {
    const lettersRow = document.getElementById('table-days-letter-row');
    const numbersRow = document.getElementById('table-day-numbers-row');
    const w5HeaderCell = document.getElementById('w5-header-cell');

    if (!lettersRow || !numbersRow) return;

    lettersRow.innerHTML = '';
    numbersRow.innerHTML = '';

    const daysCount = days.length;
    const w5Count = Math.max(1, daysCount - 28);
    if (w5HeaderCell) w5HeaderCell.setAttribute('colspan', w5Count);

    const now = new Date();
    const isCurrentMonthActive = now.getFullYear() === currentYear && now.getMonth() === currentMonth;
    const todayDayNum = isCurrentMonthActive ? now.getDate() : -1;

    days.forEach(day => {
      const isToday = day.dayNumber === todayDayNum;

      const thLetter = document.createElement('th');
      thLetter.innerText = day.dayLetter;
      if (isToday) thLetter.className = 'today-col-header';
      lettersRow.appendChild(thLetter);

      const thNumber = document.createElement('th');
      thNumber.innerText = day.dayNumber;
      if (isToday) thNumber.className = 'today-col-header';
      numbersRow.appendChild(thNumber);
    });
  },

  // Render Spreadsheet Table Body & Footer Summary Rows
  renderTableBodyAndFooter(habits, monthStats, logs, currentMonth, currentYear, onToggleCell, onDeleteHabit) {
    const tbody = document.getElementById('spreadsheet-tbody');
    const tfoot = document.getElementById('spreadsheet-tfoot');
    if (!tbody || !tfoot) return;

    tbody.innerHTML = '';
    tfoot.innerHTML = '';

    const days = monthStats.days;
    const now = new Date();
    const isCurrentMonthActive = now.getFullYear() === currentYear && now.getMonth() === currentMonth;
    const todayDayNum = isCurrentMonthActive ? now.getDate() : -1;

    // Render Habit Rows
    habits.forEach(habit => {
      const tr = document.createElement('tr');
      const cat = CATEGORIES[habit.category] || CATEGORIES.health;
      const hStat = monthStats.habitStats[habit.id] || { completedCount: 0, percent: 0 };
      const goal = habit.monthGoal || days.length;

      let rowHTML = `
        <td class="col-habit-title habit-title-cell">${habit.name}</td>
        <td class="col-category">
          <span class="cat-badge ${cat.badgeClass}">${cat.name}</span>
        </td>
        <td class="col-goal">${goal}</td>
      `;

      // 30/31 Checkbox Cells
      days.forEach(day => {
        let weekClass = 'w1-cell';
        if (day.dayNumber >= 8 && day.dayNumber <= 14) weekClass = 'w2-cell';
        else if (day.dayNumber >= 15 && day.dayNumber <= 21) weekClass = 'w3-cell';
        else if (day.dayNumber >= 22 && day.dayNumber <= 28) weekClass = 'w4-cell';
        else if (day.dayNumber >= 29) weekClass = 'w5-cell';

        const isToday = day.dayNumber === todayDayNum;
        const isChecked = logs[day.dateKey]?.[habit.id]?.completed || false;

        rowHTML += `
          <td class="grid-check-cell ${weekClass} ${isChecked ? 'checked' : ''} ${isToday ? 'today-col-cell' : ''}" data-date="${day.dateKey}" data-habit="${habit.id}">
            <div class="grid-checkbox">
              <i data-lucide="check"></i>
            </div>
          </td>
        `;
      });

      // Progress Cell
      rowHTML += `
        <td class="col-progress">
          <div class="progress-cell-box">
            <span class="progress-text-ratio">${hStat.completedCount} / ${goal}</span>
            <div class="progress-track-mini">
              <div class="progress-fill-mini" style="width: ${Math.min(100, hStat.percent)}%;"></div>
            </div>
          </div>
        </td>
        <td class="col-actions">
          <button class="action-delete-btn" data-habit-id="${habit.id}" title="Delete Habit"><i data-lucide="trash-2"></i></button>
        </td>
      `;

      tr.innerHTML = rowHTML;
      tbody.appendChild(tr);
    });

    // Event Listeners
    tbody.querySelectorAll('.grid-check-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const dKey = cell.getAttribute('data-date');
        const hId = cell.getAttribute('data-habit');
        onToggleCell(dKey, hId);
      });
    });

    tbody.querySelectorAll('.action-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hId = btn.getAttribute('data-habit-id');
        onDeleteHabit(hId);
      });
    });

    // Footer Summary Rows
    const trCompleted = document.createElement('tr');
    let completedHTML = `<td class="summary-row-label" colspan="3">Daily Completed</td>`;
    monthStats.dailyCompleted.forEach((val, idx) => {
      const isToday = days[idx]?.dayNumber === todayDayNum;
      completedHTML += `<td class="footer-sum-cell ${isToday ? 'today-col-cell' : ''}">${val}</td>`;
    });
    completedHTML += `<td colspan="2"></td>`;
    trCompleted.innerHTML = completedHTML;
    tfoot.appendChild(trCompleted);

    const trNotCompleted = document.createElement('tr');
    let notCompletedHTML = `<td class="summary-row-label" colspan="3">Daily Not Completed</td>`;
    monthStats.dailyNotCompleted.forEach((val, idx) => {
      const isToday = days[idx]?.dayNumber === todayDayNum;
      notCompletedHTML += `<td class="footer-sum-cell ${isToday ? 'today-col-cell' : ''}">${val}</td>`;
    });
    notCompletedHTML += `<td colspan="2"></td>`;
    trNotCompleted.innerHTML = notCompletedHTML;
    tfoot.appendChild(trNotCompleted);

    const trPercent = document.createElement('tr');
    let percentHTML = `<td class="summary-row-label" colspan="3">% Completion</td>`;
    monthStats.dailyPercent.forEach((pct, idx) => {
      const isToday = days[idx]?.dayNumber === todayDayNum;
      let heatClass = 'low-heat';
      if (pct >= 70) heatClass = 'high-heat';
      else if (pct >= 40) heatClass = 'med-heat';

      percentHTML += `<td class="footer-percent-cell ${heatClass} ${isToday ? 'today-col-cell' : ''}">${pct}%</td>`;
    });
    percentHTML += `<td class="footer-percent-cell high-heat">${monthStats.overallPercent}%</td><td></td>`;
    trPercent.innerHTML = percentHTML;
    tfoot.appendChild(trPercent);

    const totalSummaryText = document.getElementById('table-footer-total-summary');
    if (totalSummaryText) {
      totalSummaryText.innerText = `${monthStats.overallCompleted} / ${monthStats.overallGoal} Habits Completed (${monthStats.overallPercent}%)`;
    }

    if (window.lucide) lucide.createIcons();
  },

  // Render Preset Habit Bundles in Template Modal
  renderPresetBundles(container, onSelectBundle) {
    container.innerHTML = '';

    PRESET_BUNDLES.forEach(bundle => {
      const card = document.createElement('div');
      card.className = 'preset-card';

      const habitsTagsHTML = bundle.habits.map(h => `<span class="preset-tag">${h.name}</span>`).join('');

      card.innerHTML = `
        <div class="preset-card-header">
          <div class="preset-icon-box"><i data-lucide="${bundle.icon}"></i></div>
          <div>
            <div class="preset-title">${bundle.title}</div>
            <div class="preset-desc">${bundle.description}</div>
          </div>
        </div>
        <div class="preset-habit-tags">${habitsTagsHTML}</div>
        <button class="btn btn-primary btn-sm use-bundle-btn" data-bundle-id="${bundle.id}">
          <i data-lucide="plus-circle"></i> Use This Template (${bundle.habits.length} Habits)
        </button>
      `;

      card.querySelector('.use-bundle-btn').addEventListener('click', () => {
        onSelectBundle(bundle.id);
      });

      container.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }
};
