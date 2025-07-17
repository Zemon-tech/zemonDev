## 1. **Role Storage and Model**
- Roles are stored in the `UserRole` model with possible values: `'user'`, `'moderator'`, `'admin'`.
- Roles can be **global** (no channelId) or **channel-specific** (with channelId).

---

## 2. **Role-Based Middleware and Permissions**
- The backend uses a `checkRole` middleware to restrict access to certain routes based on role.
  - Example: `checkRole(['admin', 'moderator'], true)` means only admins or moderators (globally or for that channel) can access.
  - Example: `checkRole(['admin'], true)` means only admins can access.

---

## 3. **Special Functionalities by Role**

### **Admin**
- **Can assign moderator roles**: Only admins can promote users to moderators (`makeModerator` route/controller).
- **Can ban, unban, and kick users**: Admins can perform these actions in any channel.
- **Can manage moderators**: Admins can ban/kick moderators, but moderators cannot ban/kick admins.
- **Has access to all moderator actions**.

### **Moderator**
- **Can ban, unban, and kick users**: Moderators can do this, but only in channels where they are moderators.
- **Cannot ban/kick other moderators or admins**: There are explicit checks to prevent this.
- **Cannot assign moderator roles**: Only admins can do this.

### **User**
- **No special privileges**: Regular users cannot ban, kick, or assign roles.
- **Can only perform standard user actions** (e.g., send messages if permissions allow).

---

## 4. **Implementation Details**
- **Ban/Kick Logic**: When banning or kicking, the code checks if the acting user is a moderator for the channel or an admin. It also checks if the target is a moderator or admin to prevent lower roles from banning/kicking higher ones.
- **Route Protection**: Routes for moderation actions (ban, kick, make moderator) are protected by the `checkRole` middleware.
- **Role Hierarchy**: Admin > Moderator > User. Admins can manage all, moderators can manage users, users have no management rights.

---

## 5. **Frontend**
- The frontend uses the roles to show/hide admin/moderator controls (e.g., ban/kick buttons, promote to moderator).

---

## 6. **Summary Table**

| Role      | Can Ban/Kick Users | Can Ban/Kick Moderators | Can Ban/Kick Admins | Can Assign Moderators | Notes                        |
|-----------|--------------------|------------------------|---------------------|-----------------------|------------------------------|
| Admin     | Yes                | Yes                    | No                  | Yes                   | Full control except over other admins |
| Moderator | Yes (in channel)   | No                     | No                  | No                    | Only in channels they moderate |
| User      | No                 | No                     | No                  | No                    | Standard user actions only    |

---

**In summary:**  
- **Admins** have the highest privileges, including assigning moderators and managing all users and moderators (except other admins).
- **Moderators** can manage users in their channels but cannot affect other moderators or admins.
- **Users** have no special privileges.
- All of this is enforced by backend middleware and explicit checks in controller logic.

---

# CHANNEL TYPES 

### 1. **Channel Type Definition**
- The `ArenaChannel` model and types define three types: `'text'`, `'announcement'`, and `'readonly'`.
- Each channel also has a `permissions` object: `{ canMessage: boolean, canRead: boolean }`.

---

### 2. **Backend Logic**
- **Permissions, not type, drive most behavior.**
  - When a user tries to send a message, the backend checks `channel.permissions.canMessage`.
  - If `canMessage` is `false`, the user cannot post, regardless of the channel type.
- The type field (`'text'`, `'announcement'`, `'readonly'`) is used for categorization and UI, but the actual restrictions are enforced by the `permissions` object.

---

### 3. **Frontend Logic**
- **UI Components:**
  - The frontend uses the channel type to determine which React component to render (e.g., `AnnouncementsChannel`, `ChatChannel`).
  - For "announcement" channels, the UI may show pinned/important messages and a special "New" button for admins.
  - For "readonly" channels, the UI disables the message input if `canMessage` is `false`.
- **Behavior:**
  - "Announcement" channels highlight pinned/important messages and may restrict posting to admins.
  - "Text" channels are standard chat channels.
  - "Readonly" channels (sometimes called "real only") are for viewing only—users cannot post if `canMessage` is `false`.

---

### 4. **Summary Table**

| Type         | Special Backend Logic? | Special Frontend Logic? | Typical Permissions         |
|--------------|-----------------------|-------------------------|-----------------------------|
| text         | No                    | Standard chat           | canMessage: true            |
| announcement | No (uses permissions) | Pinned/important UI, admin-only post | canMessage: false (for most users) |
| readonly     | No (uses permissions) | No input, view only     | canMessage: false           |

---

### 5. **Key Point**
- **The "type" field is mostly for UI and organization. The actual special functionality (who can post, who can read) is controlled by the `permissions` object on the channel.**
- There is no backend logic that enforces special rules based on the `type` field alone; it always checks the `permissions`.

---

**In summary:**  
- "text", "announcement", and "readonly" are used for categorization and UI rendering.
- The real functional restrictions (posting, reading) are enforced by the `permissions` object, not the type.
- "Announcement" channels may have special UI for admins and pinned messages, but this is a frontend concern.
