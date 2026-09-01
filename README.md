# browser_extension
> Repository containing the code of the browser extension.

## How to install the browser extension (localy)

1. Clone the repo `git clone https://github.com/Keypr-org/browser_extension.git`
2. Run the build command using `npm run build`
3. Paste this URL in your search bar `chrome://extensions`
4. Enable `Developer Mode`
5. Click the `Charger l'extension non empaquetée` button
6. Select the `dist` file that was created after the build command

![](/docs/img/browser_extension_1.png)

After that, if you want to change something in the files inside of `dist`, you just need to run `npm run clean` then `npm run build`. Then, you can press the refresh button on buttom right of the extension as shown here :

![](/docs/img/browser_extension_2.png)

## Native messaging (communication with the Qt client)

`manifest.json` pins a `"key"` so the extension always loads with the same id
(`bbecgmjnhnkhhmifjihmojkckgilifjm`), no matter who builds it or where `dist/` is
loaded from. `dev-extension-key.pem` is the matching private key — it is only a dev
convenience to keep that id stable across the team, not a Chrome Web Store signing
key; do not regenerate it, or the Qt client's Native Messaging host manifest
(`allowed_origins` in `qt_client/installer/native-messaging/com.keypr.native.json.in`)
will stop matching and Chrome will refuse to connect to the native host.
