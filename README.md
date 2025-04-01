# File Upload Application

<div align="center">
 ![Hydra Catalogue](./docs/screen-home.png)
<div>

A cross-platform desktop application for file uploads built with Electron, React, TypeScript, and AWS S3 integration.

## Features

- Drag and drop file uploads
- Progress tracking
- File management (rename, delete, organize)
- Secure authentication
- AWS S3 storage integration
- Cross-platform support (Windows, macOS, Linux)

## Technologies

### Frontend

- Electron
- React
- TypeScript
- SCSS for styling
- React Router for navigation

### Backend

- Node.js
- TypeScript
- Express.js
- AWS SDK for S3 integration

## Prerequisites

- Node.js (v16+)
- Yarn package manager
- AWS account with S3 bucket configured

## Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/glopmts/nildedit.git

# Navigate to project directory
cd file-upload-app

# Install dependencies
yarn install
```

## Key Directories Explained

### Main Process (Electron)

- `src/main/`: Contains the Electron main process code
- `src/preload/`: Contains the preload scripts for secure IPC communication

### Renderer Process (React)

- `src/renderer/src/`: Contains the React application code
- `src/renderer/src/components/`: UI components organized by functionality
- `src/renderer/src/pages/`: Application pages/routes

### Backend Integration

- `src/api/`: Contains API integration code, including AWS S3 for file uploads

### Build and Distribution

- `build/`: Build configuration and assets
- `dist/`: Compiled application for distribution
- `out/`: Temporary build output

### Configuration

- `.github/workflows/`: CI/CD workflows for automated builds and releases
- `.vscode/`: VS Code editor configuration
- `.editorconfig`: Consistent coding style across editors
- `electron-builder.yml`: Electron packaging and distribution configuration

## File Upload Flow

1. User selects files through the UI (`src/renderer/src/components/ui/`)
2. Upload service (`src/renderer/src/services/`) prepares the files
3. Request is sent to main process via IPC
4. Main process handles Auth (`src/api/auth.ts`)
5. Progress and results are communicated back to the renderer process
6. Toast notifications (`src/renderer/src/components/toast/`) show upload status
