# Cheat-Sheet App Themes

Cheat-Sheet App ships with 38 built-in themes and supports user-created custom themes. Custom themes are hot-reloaded. No restart is required.

## Built-in themes

Andromeda, Ayu (Mirage), Catppuccin Frappé, Catppuccin Latte, Catppuccin Macchiato, Catppuccin Mocha, Cheatsheet (default dark), Cheatsheet Light (default light), City Lights, Cobalt2, Crimson White, Darcula, Dracula, D.Va, Everforest, GitHub, GitHub Dark, Graphite, Gruvbox, Gruvbox Light, Horizon, Kanagawa, Material Palenight, Monokai, Monokai Pro, Night Owl, Nord, One Dark Pro, Panda, Popping and Locking, Rosé Pine, Rosé Pine Dawn, Rosé Pine Moon, Solarized Dark, Solarized Light, Spandex, Synthwave, Tokyo Night.

## Creating a custom theme

A theme is one `.json` file with a name and CSS hex color values.

### 1. Create the themes directory

The directory is not created manually in normal use. The app creates it on startup. If you want to add themes before first launch, create it yourself.

**Linux**

```sh
mkdir -p ~/.local/share/dev.cheatsheet.overlay/themes
```

**macOS**

```sh
mkdir -p ~/Library/Application\ Support/dev.cheatsheet.overlay/themes
```

**Windows** (PowerShell)

```powershell
New-Item -ItemType Directory -Force "$env:APPDATA\dev.cheatsheet.overlay\themes"
```

### 2. Create a theme file

Copy the template below into a `.json` file in the themes directory. The filename can be anything. The displayed name comes from the `name` field.

```json
{
  "name": "My Theme",
  "colors": {
    "--color-background": "#2f384b",
    "--color-background-light": "#3d4457",
    "--color-background-lightest": "#9ca5b5",
    "--color-foreground": "#f6f2eb",
    "--color-foreground-darker": "#c0c9da",
    "--color-foreground-darkest": "#dbe1ef",
    "--color-accent": "#05ec8c"
  }
}
```

### 3. Select your theme

Open **Settings**. Your theme appears in the Light theme and Dark theme pickers with a **Custom** suffix. Select it for the Light or Dark slot, or for both.

## Color reference

| Key                           | Used for                                    |
| ----------------------------- | ------------------------------------------- |
| `--color-background`          | Main window background                      |
| `--color-background-light`    | Sidebar, inputs, elevated surfaces          |
| `--color-background-lightest` | Borders and dividers                        |
| `--color-foreground`          | Primary text                                |
| `--color-foreground-darker`   | Secondary text and labels                   |
| `--color-foreground-darkest`  | Tertiary text and placeholders              |
| `--color-accent`              | Focus rings, selected items, highlighted UI |
| `--cs-bg`                     | Optional app-specific background override   |
| `--cs-surface`                | Optional app-specific surface override      |
| `--cs-fg`                     | Optional app-specific text override         |
| `--cs-muted`                  | Optional app-specific muted text override   |
| `--cs-border`                 | Optional app-specific border override       |
| `--cs-input-bg`               | Optional app-specific input background      |
| `--cs-hover-bg`               | Optional app-specific hover background      |
| `--cs-selected-bg`            | Optional app-specific selected background   |
| `--cs-selected-fg`            | Optional app-specific selected text         |
| `--cs-accent`                 | Optional app-specific accent override       |

All values must be CSS hex colors: `#rrggbb` or `#rrggbbaa`.

The app also accepts compatible `--color-focus-round`, `--color-short-round`, and `--color-long-round` keys from Pomotroid theme files. Cheat-Sheet App does not use those timer-specific colors.

## Hot-reload

Cheat-Sheet App watches the themes directory while running. Saving a theme file updates the theme picker and the active theme within about half a second. You do not need to reopen settings or restart the app.

## Overriding a built-in theme

If a custom theme's `name` exactly matches a built-in theme name, case-insensitive, it replaces that theme in the picker. This lets you tweak a built-in theme without adding a second entry.

## Using bundled themes as a starting point

The bundled theme files are a useful reference. You can find them in the source repository under [`static/themes/`](./static/themes/). The built output also includes them under [`dist/themes/`](./dist/themes/).
