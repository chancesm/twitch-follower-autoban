# Hate Raid (Hoss) AutoBan Bot

# Goal: automatically block users that follow whose usernames match a given pattern (ex: "hoss00312_sniff OR "ho03012ss").

## Resources

- [https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#oauth-authorization-code-flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#oauth-authorization-code-flow)
- [https://github.com/sindresorhus/electron-store](https://github.com/sindresorhus/electron-store)
- [https://dev.twitch.tv/docs/eventsub](https://dev.twitch.tv/docs/eventsub)
- [https://dev.twitch.tv/docs/api/reference#block-user](https://dev.twitch.tv/docs/api/reference#block-user)
- [https://regex101.com/r/iVFwIG/1](https://regex101.com/r/iVFwIG/1)

# V1: Running process (Minimal UI)

### Steps:

1. ON FIRST RUN
    1. Authenticate with Twitch (see link)
    2. Store auth code, refresh token, expires token, etc. 
        1. potential tools: electron-store (see link)
2. Init ngrok tunnel
3. Start webserver to handle webhooks
4. Connect with twitch API
    1. create axios wrapper method that auto-refreshes token if expired or expiring in < 2 minutes before sending API calls (optional)
5. Init Hooks (see link and previous code)
6. Webhook handler
    1. Check for username patterns (/hoss\d+_\w+/ , /ho\d+ss/)
    2. ban user if matches patterns (see link)
        1. do nothing if user is on exception list
    3. report that the user was banned in some way (optional)
    4. show list of all follows and whether or not they were banned (optional)
    5. report to chat that a user was banned with instructions on how to unban