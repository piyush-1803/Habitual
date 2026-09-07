/* ==========================================================================
   AuraHabit - Web Audio Synthesizer, Toast System & Web Notifications
   ========================================================================== */

const SoundEngine = {
  audioCtx: null,

  init() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
  },

  // Play satisfying soft chime sound on habit toggle
  playCheckSound() {
    const settings = Storage.getSettings();
    if (!settings.soundEnabled) return;

    try {
      this.init();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Note 1 (E5 - 659.25 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Note 2 (B5 - 987.77 Hz) - slight delay for chime feel
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.08);
      gain2.gain.setValueAtTime(0.15, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.35);

    } catch (e) {
      console.warn('Audio play error', e);
    }
  },

  // Play celebratory fanfare on 100% daily completion
  playFanfare() {
    const settings = Storage.getSettings();
    if (!settings.soundEnabled) return;

    try {
      this.init();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const startTime = now + idx * 0.09;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {}
  }
};

// UI Toast Notification Manager
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : 'info'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// Browser Web Notifications API Scheduler
const NotificationManager = {
  requestPermission() {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported in this browser.', 'info');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('Daily reminder notifications enabled!', 'success');
        this.scheduleCheck();
      } else {
        showToast('Notification permission denied.', 'info');
      }
    });
  },

  scheduleCheck() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    // Periodically check every minute if any habit reminder matches current time
    setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMins}`;

      const habits = Storage.getHabits();
      const logs = Storage.getLogs();
      const todayKey = formatDateKey(now);

      habits.forEach(habit => {
        if (habit.reminderTime === timeStr) {
          const isCompleted = logs[todayKey]?.[habit.id]?.completed;
          if (!isCompleted && Analytics.isHabitScheduledOnDate(habit, now)) {
            new Notification(`Reminder: ${habit.name}`, {
              body: `Time to complete your habit! Stay consistent.`,
              icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
            });
          }
        }
      });
    }, 60000);
  }
};
