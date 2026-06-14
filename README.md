# Hollow
## https://bloodorca.github.io/hollow/
Online Hollow Knight save file editor.

The decryption and encryption logic was ported from [@KayDeeTee](https://github.com/KayDeeTee)'s [Hollow Knight Save Manager](https://github.com/KayDeeTee/Hollow-Knight-SaveManager).

---

### Instructions
1. Make a backup of your save file. In the Hollow Knight save folder, rename `user1.dat` to `user1_a.dat`.
2. Select or drag the source save file into the editor. Drag in `user1_a.dat` as your source.
3. Modify your save file using the **JSON editor**, **tree view**, or **quick edit panel**.
4. Download your new modified save file. Rename it to `user1.dat` and move it to your Hollow Knight save folder.

### Features
- **Code Editor** — Full-featured CodeMirror 6 JSON editor with syntax highlighting, line numbers, code folding, bracket matching, autocomplete, and real-time JSON linting
- **Search & Replace** — Built-in search panel (Ctrl+F / Cmd+F) with regex support, case sensitivity, and replace
- **JSON Tree View** — Expandable tree navigator for browsing your save file structure; click any key to jump to it
- **Quick Edit Panel** — Edit common Hollow Knight fields (geo, health, charms, abilities, nail upgrades) with labeled inputs, descriptions, and min/max ranges
- **Diff View** — See exactly what you've changed compared to the original save file
- **Dark / Light Mode** — Toggle between dark and light themes (respects your system preference)
- **Format / Minify** — One-click JSON pretty-print or minify
- **Nintendo Switch Mode** — Convert between PC (encrypted) and Switch (plain text) save formats
- **History** — Recently opened files stored locally for quick access
- **Keyboard Shortcuts** — Full keyboard support (press `?` to see all shortcuts)
- **Drag & Drop** — Drop save files directly onto the page to open them
- **Go to Line** — Jump to any line number (Ctrl+G)

### Development

```bash
npm install
npm run dev      # Start dev server on port 8080
npm run build    # Build to docs/ for GitHub Pages
```

### Where is my save folder?
The Hollow Knight save folder may be different depending on your OS (Windows, Mac, Linux) and game platform (Steam, GOG, etc). Google it like so: `hollow knight mac steam save file location`.
