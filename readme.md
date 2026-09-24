Acode Live Server

A custom local development server preview plugin for the "Acode Editor" (https://github.com/Acode-Foundation/Acode).

Acode Live Server makes it easier to preview local development projects directly inside Acode by automatically detecting running local servers and displaying them inside the editor.

Project Status

Early development

The core local server detection and preview functionality is currently working and being tested.

Development is currently paused and may continue in the future as new features and improvements are explored.

Current Features

- Automatic local server detection
- Localhost preview
- React project support
- Support for local development servers
- Common localhost port detection
- Full-size responsive preview
- Custom preview toolbar
- Reload preview
- Android Back navigation support
- Return to the Acode editor without closing Acode
- URL persistence using local storage

How It Works

Acode Live Server does not start a development server.

Instead, it detects a development server that is already running on the device.

For example, if a project is running on:

http://localhost:5173

Acode Live Server can detect the running server and load the project directly inside Acode.

This makes it possible to work with projects such as React applications and other framework-based projects that run through a local development server.

Local Development

Acode Live Server currently focuses on detecting and previewing running local development servers.

Supported

- Running "localhost" development servers
- Common development ports
- React development projects
- Other framework-based local projects
- Embedded local server preview
- Preview reload

Server Requirements

Acode Live Server requires the development server to already be running.

For example:

npm run dev

or another command appropriate for the project.

The plugin does not start the development server itself.

Designed for Acode

Acode Live Server is specifically designed for the Android-based "Acode Editor" (https://github.com/Acode-Foundation/Acode).

The goal is to make local web development on a phone more convenient by allowing developers to detect and preview their running development servers directly inside Acode.

Technology

The project currently uses:

- JavaScript
- Acode Plugin API
- HTML
- CSS
- iframe-based web preview
- Node.js
- npm
- esbuild

Future Development

If development continues, possible future improvements include:

- Improved local server detection
- Better framework compatibility
- Improved preview stability
- Better server status handling
- Improved error handling
- Additional preview controls
- Navigation improvements
- Performance improvements

Development Status

This project is currently in an early development stage.

The current implementation focuses on:

«Detecting running local development servers and previewing them directly inside Acode.»

Development is currently paused and may continue in the future.