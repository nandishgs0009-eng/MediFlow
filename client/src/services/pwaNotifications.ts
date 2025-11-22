// PWA Notification Service for Background Notifications
export class PWANotificationService {
  private static registration: ServiceWorkerRegistration | null = null;
  private static isSupported = 'serviceWorker' in navigator && 'Notification' in window;

  // Initialize the service
  static async initialize() {
    console.log('PWANotificationService: Initializing...');
    
    if (!this.isSupported) {
      console.warn('PWANotificationService: Not supported on this device');
      return false;
    }

    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Request notification permissions
      const permissionGranted = await this.requestNotificationPermission();
      
      if (!permissionGranted) {
        console.warn('PWANotificationService: Notification permission denied');
        return false;
      }

      console.log('PWANotificationService: Initialized successfully');
      return true;
    } catch (error) {
      console.error('PWANotificationService: Initialization failed', error);
      return false;
    }
  }

  // Register the service worker
  static async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('PWANotificationService: Service worker registered', this.registration.scope);
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      
      return this.registration;
    } catch (error) {
      console.error('PWANotificationService: Service worker registration failed', error);
      throw error;
    }
  }

  // Request notification permissions
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('PWANotificationService: Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('PWANotificationService: Permission result:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('PWANotificationService: Permission request failed', error);
      return false;
    }
  }

  // Check if notifications are supported and permitted
  static isNotificationSupported(): boolean {
    return this.isSupported && Notification.permission === 'granted';
  }

  // Schedule a medicine notification
  static async scheduleMedicineNotification(
    medicineId: string,
    medicineName: string, 
    scheduleTime: string
  ): Promise<boolean> {
    console.log(`PWANotificationService: Scheduling notification for ${medicineName} at ${scheduleTime}`);
    
    if (!this.isNotificationSupported()) {
      console.warn('PWANotificationService: Notifications not supported or permitted');
      return false;
    }

    try {
      // Parse the schedule time
      const delay = this.calculateDelay(scheduleTime);
      
      if (delay < 0) {
        console.warn(`PWANotificationService: Schedule time ${scheduleTime} has already passed today`);
        return false;
      }

      // Send message to service worker
      await this.sendMessageToServiceWorker({
        type: 'SCHEDULE_NOTIFICATION',
        title: '💊 Time to take your medicine!',
        body: `It's time to take ${medicineName}`,
        delay,
        medicineId
      });

      console.log(`PWANotificationService: Notification scheduled for ${medicineName} in ${delay}ms`);
      return true;
    } catch (error) {
      console.error('PWANotificationService: Failed to schedule notification', error);
      return false;
    }
  }

  // Cancel a scheduled notification
  static async cancelMedicineNotification(medicineId: string): Promise<void> {
    console.log(`PWANotificationService: Canceling notification for medicine ${medicineId}`);
    
    try {
      await this.sendMessageToServiceWorker({
        type: 'CANCEL_NOTIFICATION',
        medicineId
      });
    } catch (error) {
      console.error('PWANotificationService: Failed to cancel notification', error);
    }
  }

  // Send immediate test notification
  static async showTestNotification(): Promise<void> {
    if (!this.isNotificationSupported()) {
      alert('Notifications are not supported or permitted');
      return;
    }

    try {
      await this.sendMessageToServiceWorker({
        type: 'SCHEDULE_NOTIFICATION',
        title: '🧪 Test Notification',
        body: 'This is a test notification from MediFlow!',
        delay: 1000, // 1 second
        medicineId: 'test'
      });
    } catch (error) {
      console.error('PWANotificationService: Test notification failed', error);
      alert('Test notification failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  // Calculate delay until schedule time
  private static calculateDelay(scheduleTime: string): number {
    const now = new Date();
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    
    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }
    
    return notificationTime.getTime() - now.getTime();
  }

  // Send message to service worker
  private static async sendMessageToServiceWorker(message: any): Promise<void> {
    if (!navigator.serviceWorker.controller) {
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
    }

    const registration = this.registration || await navigator.serviceWorker.ready;
    
    if (registration.active) {
      registration.active.postMessage(message);
    } else {
      throw new Error('No active service worker found');
    }
  }

  // Listen for messages from service worker
  static setupMessageListener() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('PWANotificationService: Message from service worker', event.data);
      
      if (event.data && event.data.type === 'MEDICINE_TAKEN') {
        // Handle medicine taken action
        const customEvent = new CustomEvent('medicineTaken', {
          detail: event.data
        });
        window.dispatchEvent(customEvent);
      }
    });
  }
}
