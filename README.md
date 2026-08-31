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
 