# unicode-ue-page
Landing page for UniCode UE, a block-based programming game.

Plain HTML, CSS and JavaScript: no build step, no frameworks. It is meant to be
hosted on Vercel at `https://unicode-ue.vercel.app`.

## Folders

| Path | What it is |
|---|---|
| `index.html` | The whole page, section by section |
| `css/style.css` | Colors, fonts, layout and animations |
| `js/config.js` | **The button links** (play and download) |
| `js/main.js` | Menu, scroll effects, sparkles and the gameplay clip player |
| `assets/img/` | Campus art, logo, robot sprites, favicon, link-preview image |
| `assets/shots/` | Web-sized screenshots used on the page (WebP) |
| `assets/fonts/` | The game's fonts (see `assets/fonts/LICENSES.md`) |
| `media/` | Put the gameplay clip here as `gameplay.mp4` |
| `screenshots/` | Original full-size screenshots. Not deployed (see `.vercelignore`) |

## Preview it

Double-click `index.html` to open it in your browser.

## Change the download link

Open `js/config.js` and replace the `download` link. Right now it is a
placeholder that points at the itch.io page. Every "Download for Windows"
button on the page uses this one line.

## Add the gameplay clip

1. Record about 20 to 30 seconds of a level with the Snipping Tool (Win + Shift + R):
   drag the blocks in, press Play, and keep recording until the Level complete card
   shows three stars. Turn on Do Not Disturb first, so no notifications pop up.
2. Trim it in Clipchamp and export at 1080p. Keep it under about 10 MB.
3. Save it as `media/gameplay.mp4`. The page plays it on its own, muted and looping,
   when someone scrolls to it. Until the file exists, the still image shows.
4. In `index.html`, find the four `data-start="..."` numbers under the clip and set
   each one to the second that step starts in your recording (pick blocks, snap them
   together, press play, earn stars).

## Deploy on Vercel

1. In Vercel, choose **Add New → Project** and import this repository.
2. Set **Project Name** to `unicode-ue` (that makes the address `unicode-ue.vercel.app`).
3. Framework preset: **Other**. Leave the build command and output directory empty.
4. Deploy. Every push to `main` updates the site.

If the site ends up at a different address, update the two `og:` links at the top
of `index.html` (`og:url` and `og:image`), so link previews in Messenger, Facebook and
Discord still show the picture.

After it's live, add the address to Google Search Console and request indexing so the
page shows up in Google searches.

## Update a screenshot

The images in `assets/shots/` are cropped and shrunk copies of the files in
`screenshots/`. To replace one, save the new image as WebP (about 1000 px wide) under
the same file name in `assets/shots/`.
