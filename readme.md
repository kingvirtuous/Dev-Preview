# Dev Preview for Acode

A custom Web Preview plugin for the [Acode Editor](https://github.com/Acode-Foundation/Acode).

The goal of this project is to provide a simple, fast, developer-friendly way to preview websites and local development servers directly inside Acode.

##  Project Status

**Early development / MVP stage**

The core preview experience is currently being built and tested.

The project is being developed step by step, with stability and a clean architecture as priorities.

## Current Features

- Open Web Preview directly from Acode
- Floating Preview button inside the editor
- Preview websites inside an embedded view
- URL input for loading websites
- Reload preview
- Local development server detection
- Support for common local development ports
- Responsive full-size preview
- Custom preview toolbar
- Android Back navigation support
- Preview returns to the editor without closing Acode
- URL persistence using local storage

## Planned Features

The plugin is being developed in multiple MVP stages.

### Developer Tools

Planned developer tools include:

- Console
- Elements inspector
- Network monitoring
- Resources
- Sources
- Snippets
- Error monitoring
- Mobile-friendly debugging tools

Eruda is being investigated as part of the developer tools architecture.

### Local Development

Planned improvements include:

- Better localhost detection
- Vite support
- React development support
- Automatic development server detection
- Improved server status handling
- Better preview loading and error handling

### Preview Controls

Future improvements may include:

- Better URL navigation
- Preview settings
- Developer tool controls
- Improved toolbar
- Preview preferences
- Additional debugging utilities

## Designed for Acode

This project is specifically designed for the Android-based Acode development environment.

The goal is to make web development on a phone more convenient by bringing useful preview and debugging functionality directly into the editor.

## Technology

The project currently uses:

- JavaScript
- Acode Plugin API
- HTML
- CSS
- iframe-based web preview
- Node.js
- npm
- esbuild
