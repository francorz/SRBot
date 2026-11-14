# Bot Setup Guide

## Prerequisites

- Node.js installed on your system ([Link](https://nodejs.org/es/download))
- pnpm (package manager) ([Link](https://pnpm.io/installation))
- Spotify Developer Account ([Link](https://developer.spotify.com/))

## Setup Instructions

### 1. Misc needs

- Fill `username` and `ID` for streamer and dev, or lead mod you trust **(lowercase and no spaces)**
- `ARRIVE_EMOTE` `LEAVE_EMOTE` are optional emotes that the bot will send when you go live or offline

### 2. Spotify API Configuration

1. Create a Spotify application in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Register the callback URI configured in `.env` (default):
    ```
    http://127.0.0.1:8888/spotify/callback
    ```

### 3. Environment Configuration

1. Copy the example environment file:

    ```bash
    cp example.env .env
    ```

2. Set `SPOTIFY_REDIRECT_URI` to the exact URI registered with Spotify. Set `SPOTIFY_CALLBACK_HOST` and `SPOTIFY_CALLBACK_PORT` to match the listener address.
3. Set the Spotify app credentials in `.env`:

    ```env
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    ```

4. Fill Twitch credentials using the [Twitch Token Generator](https://twitchtokengenerator.com/).
5. Run `!spotify auth` and open the authorization URL printed in the bot logs. Use `!spotify status` or `!spotify disconnect` to manage the connection. Spotify tokens are stored in the local database and refreshed automatically by the bot. As of June 18, 2026, Spotify refresh tokens have a lifetime of 180 days, so you will need to re-authorize the bot every time the refresh token resets.

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
