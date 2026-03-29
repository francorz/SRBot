# Bot Setup Guide

## Prerequisites

- Node.js installed on your system ([Direct Link](https://nodejs.org/dist/v24.12.0/node-v24.12.0-x64.msi))
- pnpm (package manager) ([Installation guide](https://pnpm.io/installation))
- [Spotify Developer Account](https://developer.spotify.com/)

## Setup Instructions

### 1. Misc needs

- Fill `username` and `ID` for streamer and dev, or lead mod you trust **(lowercase and no spaces)**
- `ARRIVE_EMOTE` `LEAVE_EMOTE` are optional emotes that the bot will send when you go live or offline

### 2. Spotify API Configuration

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Create a new application (or select an existing one)
3. In your application settings, add the following **Redirect URI**:
    ```
    https://alecchen.dev/spotify-refresh-token
    ```
4. Save your changes

### 3. Generate first Spotify token (next ones will refresh automatically)

1. Navigate to [https://alecchen.dev/spotify-refresh-token/?scope=all](https://alecchen.dev/spotify-refresh-token/?scope=all)
2. Enter your Spotify **Client ID** and **Client Secret**
3. Authorize the application
4. Copy the generated **Access Token** and **Refresh Token**

### 3. Environment Configuration

1. Copy the example environment file:

    ```bash
    cp example.env .env
    ```

2. Open the `.env` file and fill the info you got from Spotify **(Step #2)**

3. Fill Twitch credentials [Direct Link](https://twitchtokengenerator.com/?scope=analytics:read:extensions+user:edit+user:read:email+clips:edit+bits:read+analytics:read:games+user:edit:broadcast+user:read:broadcast+chat:read+chat:edit+channel:moderate+channel:read:subscriptions+whispers:read+whispers:edit+moderation:read+channel:read:redemptions+channel:edit:commercial+channel:read:hype_train+channel:read:stream_key+channel:manage:extensions+channel:manage:broadcast+user:edit:follows+channel:manage:redemptions+channel:read:editors+channel:manage:videos+user:read:blocked_users+user:manage:blocked_users+user:read:subscriptions+user:read:follows+channel:manage:polls+channel:manage:predictions+channel:read:polls+channel:read:predictions+moderator:manage:automod+channel:manage:schedule+channel:read:goals+moderator:read:automod_settings+moderator:manage:automod_settings+moderator:manage:banned_users+moderator:read:blocked_terms+moderator:manage:blocked_terms+moderator:read:chat_settings+moderator:manage:chat_settings+channel:manage:raids+moderator:manage:announcements+moderator:manage:chat_messages+user:manage:chat_color+channel:manage:moderators+channel:read:vips+channel:manage:vips+user:manage:whispers+channel:read:charity+moderator:read:chatters+moderator:read:shield_mode+moderator:manage:shield_mode+moderator:read:shoutouts+moderator:manage:shoutouts+moderator:read:followers+channel:read:guest_star+channel:manage:guest_star+moderator:read:guest_star+moderator:manage:guest_star+channel:bot+user:bot+user:read:chat+channel:manage:ads+channel:read:ads+user:read:moderated_channels+user:write:chat+user:read:emotes+moderator:read:unban_requests+moderator:manage:unban_requests+moderator:read:suspicious_users+moderator:manage:warnings&auth=auth_stay), go down to **Generate Token!**, then, copy **ACCESS TOKEN** and **CLIENT ID**

### 4. Install Dependencies

This project uses **pnpm** as the package manager and **SQLite** for the database.

Run the following command in your project directory:

```bash
pnpm install
```

**Important:** During installation, you may be prompted to approve native module builds for SQLite. Make sure to **approve** these builds.

```bash
pnpm approve-builds
```

### 5. Start the bot!

```bash
pnpm start
```
