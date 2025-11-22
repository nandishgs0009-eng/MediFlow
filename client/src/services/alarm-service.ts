import type { Medicine } from "@shared/schema";
import { PWANotificationService } from "./pwaNotifications";

let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let alarmRunning = false;
let lastTriggeredMedicineId: string | null = null;

export const AlarmService = {
  // Initialize PWA notifications
  setupBackgroundNotifications: async () => {
    console.log('AlarmService: Setting up background notifications...');
    const success = await PWANotificationService.initialize();
    if (success) {
      PWANotificationService.setupMessageListener();
      console.log('AlarmService: Background notifications ready!');
    }
    return success;
  },

  // Schedule background notifications for all medicines
  scheduleAllMedicineNotifications: async (medicines: Medicine[]) => {
    console.log('AlarmService: Scheduling notifications for all medicines...');
    for (const medicine of medicines) {
      if (medicine.scheduleTime) {
        await PWANotificationService.scheduleMedicineNotification(
          medicine.id,
          medicine.name,
          medicine.scheduleTime
        );
      }
    }
  },

  // Test notification
  testNotification: async () => {
    await PWANotificationService.showTestNotification();
  },

  // Setup visibility handling for when app goes to background
  setupVisibilityHandling: () => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('AlarmService: App went to background - notifications will continue');
      } else {
        console.log('AlarmService: App came to foreground');
      }
    });
  },

  isAlarmRunning: () => alarmRunning,

  playAlarmSound: () => {
    if (alarmRunning) return;
    alarmRunning = true;

    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);

      oscillator.start(audioContext.currentTime);

      // Create a pulsing effect
      const pulseInterval = setInterval(() => {
        if (!alarmRunning) {
          clearInterval(pulseInterval);
          return;
        }
        if (gainNode) {
          gainNode.gain.setValueAtTime(0.4, audioContext!.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext!.currentTime + 0.3
          );
        }
      }, 500);
    } catch (error) {
      console.error("Failed to play alarm sound:", error);
      alarmRunning = false;
    }
  },

  stopAlarmSound: () => {
    alarmRunning = false;
    try {
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
      }
      if (gainNode) {
        gainNode.disconnect();
        gainNode = null;
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
    } catch (error) {
      console.error("Failed to stop alarm sound:", error);
    }
  },

  checkMedicineSchedules: (medicines: Medicine[], callback: (medicine: Medicine) => void) => {
    const checkedMedicines = new Set<string>();
    const preNotifiedMedicines = new Set<string>(); // Track medicines we've notified 30 mins before
    let lastCheckedMinute = "";

    const checkSchedules = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      // Only log if minute changed
      if (currentTime !== lastCheckedMinute) {
        console.log(`⏰ Checking schedules at ${currentTime}`);
        lastCheckedMinute = currentTime;
      }

      medicines.forEach((medicine) => {
        // Normalize both times to compare
        const medicineTime = medicine.scheduleTime?.trim() || "";
        
        // Check 30 minutes before scheduled time
        const [schedHour, schedMin] = medicineTime.split(":").map(Number);
        const scheduledDate = new Date();
        scheduledDate.setHours(schedHour, schedMin, 0);
        
        const thirtyMinsBefore = new Date(scheduledDate.getTime() - 30 * 60000);
        const thirtyMinsBeforeTime = `${String(thirtyMinsBefore.getHours()).padStart(2, "0")}:${String(
          thirtyMinsBefore.getMinutes()
        ).padStart(2, "0")}`;

        // Send 30-minute advance notification
        if (
          thirtyMinsBeforeTime === currentTime &&
          !preNotifiedMedicines.has(medicine.id)
        ) {
          console.log(
            `⏰ 30-MINUTE ALERT! Medicine due in 30 mins: ${medicine.name} (scheduled at ${medicineTime})`
          );
          preNotifiedMedicines.add(medicine.id);
          
          // Create a pre-notification
          fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `⏰ Medication Reminder`,
              message: `${medicine.name} will be due in 30 minutes at ${medicineTime}`,
              type: "reminder",
            }),
          }).catch(console.error);

          // Play a gentle notification sound (shorter beep)
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 600;
          oscillator.type = "sine";
          
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          
          // Reset after 2 minutes
          setTimeout(() => {
            preNotifiedMedicines.delete(medicine.id);
          }, 120000);
        }
        
        // Check if it's time and we haven't already triggered this medicine
        if (medicineTime === currentTime && !checkedMedicines.has(medicine.id)) {
          console.log(`🔔🔔🔔 ALARM TRIGGERED! Medicine: ${medicine.name} at ${currentTime} 🔔🔔🔔`);
          checkedMedicines.add(medicine.id);
          
          // Schedule immediate PWA notification
          PWANotificationService.scheduleMedicineNotification(
            medicine.id,
            medicine.name,
            medicineTime
          ).catch(console.error);
          
          callback(medicine);
          
          // Remove from checked set after 1.5 minutes to reset
          setTimeout(() => {
            checkedMedicines.delete(medicine.id);
          }, 90000);
        }
      });
    };

    // Check every 500ms for better accuracy
    const intervalId = setInterval(checkSchedules, 500);
    // Initial check
    checkSchedules();

    return () => clearInterval(intervalId);
  },
};
