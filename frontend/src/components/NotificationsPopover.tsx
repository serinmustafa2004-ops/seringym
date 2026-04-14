import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import type { NotificationOverview } from "../lib/types";
import { IconBadge } from "./IconBadge";

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationOverview>({ unreadCount: 0, notifications: [] });

  async function load() {
    try {
      const result = await apiRequest<NotificationOverview>("/notifications");
      setData(result);
    } catch {
      // Bildirim alanı ana akışı bozmasın.
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function markAllRead() {
    await apiRequest<{ message: string }>("/notifications/read-all", { method: "PATCH" });
    await load();
  }

  return (
    <div className="notifications-area">
      <button
        type="button"
        className={open ? "notification-button notification-button--open" : "notification-button"}
        onClick={() => setOpen((current) => !current)}
      >
        <IconBadge symbol="●" tone="coral" size="sm" />
        <span>Bildirimler</span>
        {data.unreadCount ? <strong>{data.unreadCount}</strong> : null}
      </button>

      {open ? (
        <div className="notifications-popover">
          <div className="panel-heading">
            <h3>Bildirimler</h3>
            <button type="button" className="ghost-button" onClick={() => void markAllRead()}>
              Tümünü Okundu Yap
            </button>
          </div>
          <div className="notification-list">
            {data.notifications.length ? (
              data.notifications.map((item) => (
                <article key={item.id} className={item.isRead ? "notification-item" : "notification-item notification-item--new"}>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <small>{new Date(item.createdAt).toLocaleString("tr-TR")}</small>
                </article>
              ))
            ) : (
              <div className="table-card compact-info-card">
                <h3>Bildirim Yok</h3>
                <p>Şu anda gösterilecek yeni bildirim bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
