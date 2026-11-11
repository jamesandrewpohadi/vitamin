# Daily Vitamins

A small phone PWA for your once-daily Fish Oil and Vitamin C check-in after lunch.

## Use

- Tap **Fish Oil** after taking it. Tap **Vitamin C** after taking it.
- Each card records its time. A second tap undoes that card if you made a mistake.
- Both marked taken displays **All taken. All done.**
- Both buttons reset for a new day at **00:00 (midnight), using your phone's local
  time**. Previous days remain in the seven-day view. An active page schedules
  the reset for midnight. If closed or asleep, it refreshes on reopening. It also
  rechecks every 30 seconds in case the clock or time zone changes.
- There is no daily notification or scheduled reminder in this prototype.

## Preview on your phone

The Wi-Fi preview provided in chat works when your phone and Mac are on the same
network and your Mac is awake. Local HTTP supports the tracker, but does not
enable service workers/offline installation on phones.

For a Mac-only preview, run from this folder:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000/` on the Mac.

## Install and use offline

1. Upload the app files to a static **HTTPS** host. Keep paths intact. It works
   at a domain root or a subfolder such as `/vitamin/` (with the trailing slash).
2. Open the HTTPS address on your phone and wait for **Ready offline** at the bottom.
3. iPhone: Safari → Share → Add to Home Screen → Open as Web App (if offered) → Add.
   Android: Chrome → menu → Install app / Add to Home screen.
4. Open the Home Screen app once online, wait for Ready offline, then test in airplane mode.

Serve `.mjs` and `.js` as JavaScript and the manifest as
`application/manifest+json`. Do not replace missing file responses with HTML.
Avoid long HTTP cache lifetimes for HTML, `sw.js`, and the manifest.

All code, styles, and icons are local. There are no external fonts, API calls,
accounts, trackers, or server-side storage. No build step is required.

## Where your check-ins are saved

Check-ins are stored in this browser on this device, using separate local date
and vitamin keys. They update across open tabs at the same address. Storage
failures show a visible warning. No cloud sync or backup is provided. Clearing
browser data or changing the domain, port, or protocol can start a separate
history. Your Home Screen app may also have storage separate from Safari.
The Wi-Fi preview's check-ins will not automatically transfer to HTTPS hosting.

## Files and updates

`index.html` and `style.css` define the screen; `app.mjs` handles the interface;
`tracker.mjs` handles daily records. `pwa.js`, `sw.js`, the manifest, and icons
provide offline installation. The SVG is the editable icon source.

After changing an app file, change `VERSION` in `sw.js` and add any new offline
files to `ASSETS`. Upload files and worker together. Reopen online to download
the update, then close all windows for the app and reopen to activate it.
The worker's cache is scoped to this app and does not clear recitation caches.
