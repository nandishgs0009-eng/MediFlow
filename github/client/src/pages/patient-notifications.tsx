import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, X, AlertCircle, Info } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Bell className="w-5 h-5 text-blue-600" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "info":
        return <Info className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case "reminder":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "alert":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
      case "info":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const readNotifications = notifications.filter(n => n.read);
  const unreadNotifications = notifications.filter(n => !n.read);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-500">{unreadCount} Unread</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {notifications.length === 0
            ? "No notifications yet"
            : `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              You're all caught up! No notifications at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                New Notifications
              </h2>
              {unreadNotifications.map((notification) => (
                <Card key={notification.id} className="border-l-4 border-l-primary bg-primary/5">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-4">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-base break-words">
                            {notification.title}
                          </h3>
                          <Badge className={getNotificationBadgeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {notification.scheduledFor
                              ? `Scheduled: ${format(
                                  new Date(notification.scheduledFor),
                                  "PPp"
                                )}`
                              : formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              markAsReadMutation.mutate(notification.id)
                            }
                            disabled={markAsReadMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark as Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Read Notifications */}
          {readNotifications.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">
                Earlier
              </h2>
              {readNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="opacity-75 hover:opacity-100 transition-opacity"
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-4">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-base text-muted-foreground break-words">
                            {notification.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getNotificationBadgeColor(notification.type)}
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.scheduledFor
                            ? format(new Date(notification.scheduledFor), "PPp")
                            : formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true }
                              )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
