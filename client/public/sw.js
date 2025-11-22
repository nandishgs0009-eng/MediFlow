// Service Worker for Background Notifications
console.log('Service Worker: Initializing...');

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay, medicineId } = event.data;
    
    console.log(`Service Worker: Scheduling notification for ${title} in ${delay}ms`);
    
    setTimeout(() => {
      console.log('Service Worker: Showing notification', title);
      self.registration.showNotification(title, {
        body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        requireInteraction: true,
        tag: `medicine-${medicineId}`, // Prevent duplicate notifications
        vibrate: [200, 100, 200],
        actions: [
          {
            action: 'taken',
            title: '✅ Mark as Taken'
          },
          {
            action: 'snooze', 
            title: '⏰ Snooze 10 min'
          }
        ],
        data: {
          medicineId,
          originalTime: Date.now()
        }
      });
    }, delay);
  }
  
  if (event.data && event.data.type === 'CANCEL_NOTIFICATION') {
    const { medicineId } = event.data;
    console.log(`Service Worker: Canceling notification for medicine ${medicineId}`);
    
    // Get all notifications and close matching ones
    self.registration.getNotifications({ tag: `medicine-${medicineId}` })
      .then(notifications => {
        notifications.forEach(notification => notification.close());
      });
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  event.notification.close();
  
  const { medicineId, originalTime } = event.notification.data || {};
  
  if (event.action === 'taken') {
    // Mark medicine as taken
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Try to focus existing window
          for (let client of clientList) {
            if (client.url.includes('patient')) {
              client.focus();
              client.postMessage({
                type: 'MEDICINE_TAKEN',
                medicineId,
                takenAt: Date.now()
              });
              return;
            }
          }
          // Open new window if none found
          clients.openWindow('/patient/dashboard?taken=' + medicineId);
        })
    );
  } else if (event.action === 'snooze') {
    // Schedule another notification in 10 minutes
    console.log('Service Worker: Snoozing notification for 10 minutes');
    
    setTimeout(() => {
      self.registration.showNotification(
        '🔔 Medicine Reminder - Snoozed',
        {
          ...event.notification,
          body: event.notification.body + ' (Snoozed)',
          tag: `medicine-${medicineId}-snooze`,
          actions: [
            {
              action: 'taken',
              title: '✅ Mark as Taken'
            },
            {
              action: 'snooze', 
              title: '⏰ Snooze 10 min'
            }
          ]
        }
      );
    }, 10 * 60 * 1000); // 10 minutes
  } else {
    // Default click - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          for (let client of clientList) {
            if (client.url.includes('patient')) {
              return client.focus();
            }
          }
          return clients.openWindow('/patient/dashboard');
        })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event.notification.tag);
});

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(clients.claim());
});

console.log('Service Worker: Loaded successfully');
