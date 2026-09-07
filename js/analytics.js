/* ==========================================================================
   AuraHabit - Desktop Spreadsheet Analytics Engine
   ========================================================================== */

const Analytics = {
  // Get all days for a specific year and month
  getMonthDays(year, monthIndex) {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dObj = new Date(year, monthIndex, day);
      const mm = String(monthIndex + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateKey = `${year}-${mm}-${dd}`;
      const dayLetter = dObj.toLocaleDateString('en-US', { weekday: 'narrow' }); // S M T W T F S

      days.push({ dayNumber: day, dateKey, dayLetter, dObj });
    }

    return days;
  },

  // Calculate full spreadsheet statistics
  calculateMonthStats(year, monthIndex, habits, logs) {
    const days = this.getMonthDays(year, monthIndex);
    const daysCount = days.length;

    // Daily totals arrays
    const dailyCompleted = new Array(daysCount).fill(0);
    const dailyNotCompleted = new Array(daysCount).fill(0);
    const dailyPercent = new Array(daysCount).fill(0);

    // Row totals per habit
    const habitStats = {};
    habits.forEach(h => {
      habitStats[h.id] = { completedCount: 0, goal: h.monthGoal || 20, percent: 0 };
    });

    // Category breakdown
    const categoryBreakdown = {};
    Object.keys(CATEGORIES).forEach(catId => {
      categoryBreakdown[catId] = { completed: 0, notCompleted: 0, name: CATEGORIES[catId].name };
    });

    let overallCompleted = 0;
    let overallGoal = 0;

    habits.forEach(habit => {
      overallGoal += habit.monthGoal || daysCount;
    });

    days.forEach((day, dayIdx) => {
      const dateLogs = logs[day.dateKey] || {};

      habits.forEach(habit => {
        const isDone = dateLogs[habit.id]?.completed || false;
        const catId = habit.category;

        if (isDone) {
          dailyCompleted[dayIdx]++;
          habitStats[habit.id].completedCount++;
          overallCompleted++;

          if (categoryBreakdown[catId]) categoryBreakdown[catId].completed++;
        } else {
          dailyNotCompleted[dayIdx]++;
          if (categoryBreakdown[catId]) categoryBreakdown[catId].notCompleted++;
        }
      });

      const totalActiveHabits = habits.length;
      dailyPercent[dayIdx] = totalActiveHabits > 0 ? Math.round((dailyCompleted[dayIdx] / totalActiveHabits) * 100) : 0;
    });

    // Calculate percentage per habit row
    habits.forEach(habit => {
      const goal = habit.monthGoal || daysCount;
      const done = habitStats[habit.id].completedCount;
      habitStats[habit.id].percent = goal > 0 ? Math.round((done / goal) * 100) : 0;
    });

    // Calculate Weekly Progress Rings
    const weekRanges = [
      { id: 'w1', start: 1, end: 7 },
      { id: 'w2', start: 8, end: 14 },
      { id: 'w3', start: 15, end: 21 },
      { id: 'w4', start: 22, end: 28 },
      { id: 'w5', start: 29, end: daysCount }
    ];

    const weeklyStats = {};
    weekRanges.forEach(week => {
      let weekCompleted = 0;
      let weekTotalPossible = 0;

      for (let d = week.start; d <= week.end; d++) {
        const idx = d - 1;
        if (idx < daysCount) {
          weekCompleted += dailyCompleted[idx];
          weekTotalPossible += habits.length;
        }
      }

      weeklyStats[week.id] = weekTotalPossible > 0 ? Math.round((weekCompleted / weekTotalPossible) * 100) : 0;
    });

    const overallPercent = overallGoal > 0 ? Math.round((overallCompleted / overallGoal) * 100) : 0;

    return {
      days,
      dailyCompleted,
      dailyNotCompleted,
      dailyPercent,
      habitStats,
      categoryBreakdown,
      weeklyStats,
      overallCompleted,
      overallGoal,
      overallPercent
    };
  }
};
