/* ==========================================================================
   AuraHabit - Desktop Storage Engine, Presets & Mode Controller
   ========================================================================== */

const STORAGE_KEYS = {
  HABITS: 'aurahabit_desktop_habits_v3',
  LOGS: 'aurahabit_desktop_logs_v3',
  SETTINGS: 'aurahabit_desktop_settings_v3'
};

const CATEGORIES = {
  health: { id: 'health', name: 'Health', icon: 'stethoscope', badgeClass: 'health' },
  productivity: { id: 'productivity', name: 'Productivity', icon: 'zap', badgeClass: 'productivity' },
  family: { id: 'family', name: 'Family', icon: 'heart', badgeClass: 'family' },
  fitness: { id: 'fitness', name: 'Fitness', icon: 'dumbbell', badgeClass: 'fitness' },
  sleep: { id: 'sleep', name: 'Sleep', icon: 'moon', badgeClass: 'sleep' },
  study: { id: 'study', name: 'Study', icon: 'book-open', badgeClass: 'study' },
  social: { id: 'social', name: 'Social', icon: 'users', badgeClass: 'social' },
  diet: { id: 'diet', name: 'Diet', icon: 'apple', badgeClass: 'diet' },
  career: { id: 'career', name: 'Career', icon: 'briefcase', badgeClass: 'career' }
};

// Preset Routine Bundles for New Users
const PRESET_BUNDLES = [
  {
    id: 'mindfulness_morning',
    title: '🧘 Morning & Mindfulness',
    description: 'Start every day with clarity, hydration, and positive focus.',
    icon: 'brain-circuit',
    habits: [
      { name: 'Drink 500ml Water', category: 'health', monthGoal: 30 },
      { name: '10 Min Meditation', category: 'health', monthGoal: 20 },
      { name: 'Morning Stretch / Yoga', category: 'health', monthGoal: 20 },
      { name: 'Gratitude Journaling', category: 'productivity', monthGoal: 20 },
      { name: 'Get Morning Sunlight', category: 'health', monthGoal: 20 }
    ]
  },
  {
    id: 'fitness_peak',
    title: '🏋️ Fitness & Athletic Peak',
    description: 'Build strength, daily step consistency, and optimal recovery.',
    icon: 'dumbbell',
    habits: [
      { name: '10,000 Daily Steps', category: 'fitness', monthGoal: 30 },
      { name: '45 Min Workout / Run', category: 'fitness', monthGoal: 20 },
      { name: 'Eat 120g Protein', category: 'diet', monthGoal: 30 },
      { name: 'Drink 3L of Water', category: 'health', monthGoal: 31 },
      { name: '8 Hours Sleep', category: 'sleep', monthGoal: 20 }
    ]
  },
  {
    id: 'high_performance',
    title: '🚀 High Performance & Focus',
    description: 'Master deep focus, daily execution, and career momentum.',
    icon: 'zap',
    habits: [
      { name: 'Plan Top 3 Priorities', category: 'productivity', monthGoal: 20 },
      { name: 'Deep Work 2 Hours', category: 'productivity', monthGoal: 20 },
      { name: 'Read 20 Pages', category: 'study', monthGoal: 20 },
      { name: 'Organize Workspace', category: 'career', monthGoal: 15 },
      { name: 'No Screens 1hr Before Bed', category: 'sleep', monthGoal: 20 }
    ]
  },
  {
    id: 'balanced_wellbeing',
    title: '🌿 Wellbeing & Life Balance',
    description: 'Nurture relationships, outdoors time, and daily energy.',
    icon: 'smile',
    habits: [
      { name: 'Walk 30 Mins Outside', category: 'health', monthGoal: 20 },
      { name: 'Call Family or Friend', category: 'family', monthGoal: 15 },
      { name: 'Eat Fresh Fruit / Veggies', category: 'diet', monthGoal: 30 },
      { name: 'Take Multivitamin', category: 'health', monthGoal: 30 },
      { name: 'Compliment Someone', category: 'social', monthGoal: 15 }
    ]
  }
];

// Default Clean Habits for a New User
const DEFAULT_NEW_USER_HABITS = [
  { id: 'h1', name: 'Drink 3L of water', category: 'health', monthGoal: 31 },
  { id: 'h2', name: 'Wake up at 7am', category: 'health', monthGoal: 20 },
  { id: 'h3', name: 'Plan my day', category: 'productivity', monthGoal: 20 },
  { id: 'h4', name: 'Get morning sunlight', category: 'health', monthGoal: 20 },
  { id: 'h5', name: 'Walk 30 mins', category: 'fitness', monthGoal: 20 },
  { id: 'h6', name: 'Read 1 chapter', category: 'study', monthGoal: 20 },
  { id: 'h7', name: '8 hours sleep', category: 'sleep', monthGoal: 15 }
];

// Generate Seed Logs for Demo Mode
function generateDemoLogs(year = 2026, monthIndex = 8) {
  // September = monthIndex 8
  const logs = {};
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(monthIndex + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateKey = `${year}-${mm}-${dd}`;

    logs[dateKey] = {};

    DEFAULT_NEW_USER_HABITS.forEach(habit => {
      // Simulate realistic completion
      const seedVal = (day * 7 + habit.name.length * 3) % 10;
      const isDone = seedVal > 2;
      logs[dateKey][habit.id] = { completed: isDone };
    });
  }

  return logs;
}

const Storage = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.HABITS)) {
      this.resetToFreshState();
    }
  },

  getHabits() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS)) || DEFAULT_NEW_USER_HABITS;
    } catch (e) {
      return DEFAULT_NEW_USER_HABITS;
    }
  },

  saveHabits(habits) {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  getLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || {};
    } catch (e) {
      return {};
    }
  },

  saveLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {
        soundEnabled: true,
        theme: 'light',
        currentMonth: 8, // Sep
        currentYear: 2026,
        isDemoMode: false,
        dismissedBanner: false
      };
    } catch (e) {
      return { soundEnabled: true, theme: 'light', currentMonth: 8, currentYear: 2026, isDemoMode: false, dismissedBanner: false };
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  toggleCell(dateKey, habitId) {
    const logs = this.getLogs();
    if (!logs[dateKey]) logs[dateKey] = {};

    const isCurrent = logs[dateKey][habitId]?.completed || false;
    logs[dateKey][habitId] = { completed: !isCurrent };

    this.saveLogs(logs);
    return !isCurrent;
  },

  saveHabit(habitData) {
    const habits = this.getHabits();
    const existingIndex = habits.findIndex(h => h.id === habitData.id);

    if (existingIndex >= 0) {
      habits[existingIndex] = { ...habits[existingIndex], ...habitData };
    } else {
      habitData.id = 'h_' + Date.now();
      habits.push(habitData);
    }

    this.saveHabits(habits);
    return habitData;
  },

  deleteHabit(habitId) {
    let habits = this.getHabits();
    habits = habits.filter(h => h.id !== habitId);
    this.saveHabits(habits);
  },

  applyPresetBundle(bundleId) {
    const bundle = PRESET_BUNDLES.find(b => b.id === bundleId);
    if (!bundle) return;

    const newHabits = bundle.habits.map((h, idx) => ({
      id: 'h_preset_' + Date.now() + '_' + idx,
      name: h.name,
      category: h.category,
      monthGoal: h.monthGoal
    }));

    this.saveHabits(newHabits);
    this.saveLogs({}); // Fresh clean logs for new bundle
  },

  clearMonthLogs(year, monthIndex) {
    const logs = this.getLogs();
    const mm = String(monthIndex + 1).padStart(2, '0');
    const prefix = `${year}-${mm}-`;

    Object.keys(logs).forEach(dateKey => {
      if (dateKey.startsWith(prefix)) {
        delete logs[dateKey];
      }
    });

    this.saveLogs(logs);
  },

  checkAllForToday(dateKey) {
    const habits = this.getHabits();
    const logs = this.getLogs();
    if (!logs[dateKey]) logs[dateKey] = {};

    habits.forEach(habit => {
      logs[dateKey][habit.id] = { completed: true };
    });

    this.saveLogs(logs);
  },

  resetToFreshState() {
    this.saveHabits(DEFAULT_NEW_USER_HABITS);
    this.saveLogs({}); // Clean logs for fresh start
    const settings = this.getSettings();
    settings.isDemoMode = false;
    this.saveSettings(settings);
  },

  loadDemoData() {
    this.saveHabits(DEFAULT_NEW_USER_HABITS);
    this.saveLogs(generateDemoLogs(2026, 8));
    const settings = this.getSettings();
    settings.isDemoMode = true;
    this.saveSettings(settings);
  },

  exportJSON() {
    const data = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      habits: this.getHabits(),
      logs: this.getLogs(),
      settings: this.getSettings()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraHabit_Personal_Planner.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.habits && data.logs) {
        this.saveHabits(data.habits);
        this.saveLogs(data.logs);
        if (data.settings) this.saveSettings(data.settings);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
};

Storage.init();
