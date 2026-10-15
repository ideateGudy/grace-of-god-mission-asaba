export enum Permission {
  SERMONS_MANAGE = 'SERMONS_MANAGE',
  EVENTS_MANAGE = 'EVENTS_MANAGE',
  ANNOUNCEMENTS_MANAGE = 'ANNOUNCEMENTS_MANAGE',
  GALLERY_MANAGE = 'GALLERY_MANAGE',
  HERO_MANAGE = 'HERO_MANAGE',
  CONTACT_INBOX = 'CONTACT_INBOX',
  PRAYER_INBOX = 'PRAYER_INBOX',
}

export const PERMISSION_PRESETS = {
  CONTENT_EDITOR: [
    Permission.SERMONS_MANAGE,
    Permission.EVENTS_MANAGE,
    Permission.ANNOUNCEMENTS_MANAGE,
    Permission.GALLERY_MANAGE,
    Permission.HERO_MANAGE,
  ],
  INBOX_ONLY: [
    Permission.CONTACT_INBOX,
    Permission.PRAYER_INBOX,
  ],
};

export const allPermissions = Object.values(Permission);
