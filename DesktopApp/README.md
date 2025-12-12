# CtrlHelp Desktop App ⚡

The cross-platform Desktop version of CtrlHelp, built with **Electron**. This enables the popular shortcut helper to run on Windows, and potentially macOS/Linux in the future, outside of the Microsoft Store ecosystem.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js)

### Installation

1.  **Navigate to this directory**:
    ```bash
    cd DesktopApp
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the app in development mode**:
    ```bash
    npm start
    ```

## 🛠️ Build & Distribute

To create a production-ready executable (e.g., `.exe` setup file):

```bash
npm run build
```

This will generate the installer in the `dist/` folder using `electron-builder`.

## 📁 Project Structure

- **`main.js`**: The entry point for the Electron main process. Controls window creation and system events.
- **`preload.js`**: Bridge between Node.js and the renderer process (security sandbox).
- **`app/`**: Contains the front-end logic (HTML, CSS, JS) that the user interacts with.

## 🤝 Contributing

Changes to the UI should be made in the `app/` folder. Logic for system tray and global shortcuts resides in `main.js`.
