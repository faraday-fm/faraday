# Faraday File Manager - Copilot Instructions

## Project Overview

Faraday is a powerful, web-based dual-pane file manager built with React 19, TypeScript, and Electron. The project uses a monorepo structure managed by pnpm workspaces and Turbo.

**Key Technologies:**
- **Frontend**: React 19, Jotai (state management), TypeScript
- **Desktop**: Electron 39 with IPC-based filesystem operations
- **Build Tools**: Vite, Turbo, Rollup, electron-builder
- **Monorepo**: pnpm workspaces with catalog mode for dependency management
- **Code Quality**: Biome (formatting/linting), TypeScript strict mode
- **Editor Integration**: CodeMirror, Monaco Editor, Xterm.js

## Repository Structure

```
faraday/
├── apps/
│   ├── faraday/                    # Electron desktop application
│   │   ├── src/
│   │   │   ├── main/              # Electron main process
│   │   │   │   └── fsp/           # File System Provider (IPC-based)
│   │   │   ├── preload/           # Electron preload scripts
│   │   │   └── renderer/          # React renderer process
│   │   └── electron-builder.yml
│   └── faraday-fm.github.io/      # Web demo application
├── packages/
│   ├── web-ui/                     # Core UI components and file manager logic
│   ├── sdk/                        # Core types and FileSystemProvider interface
│   ├── commands/                   # Command palette and keybindings
│   ├── memory-fs/                  # In-memory filesystem implementation
│   ├── webview-host/              # WebView integration
│   ├── eslint-config/             # Shared ESLint configuration
│   └── typescript-config/         # Shared TypeScript configuration
└── extensions/                     # Future extension system
```

## Architecture

### File System Provider (FSP)

The FSP is the core abstraction for filesystem operations. There are two implementations:

1. **IPC-based FSP** (Electron main process): `apps/faraday/src/main/fsp/`
   - Handles actual filesystem operations using Node.js `fs` module
   - Communicates with renderer via Electron IPC
   - Implements SFTP-like protocol with handles, stat, read/write operations
   - Includes extended operations: watchDir, watchFile, dirSize, fullContent

2. **Memory FS** (`packages/memory-fs/`): In-memory implementation for testing

**Core FSP Methods:**
- File operations: `open`, `close`, `read`, `write`, `remove`, `rename`
- Directory operations: `openDir`, `readDir`, `mkdir`, `rmdir`
- Metadata: `stat`, `lstat`, `fstat`
- Extended: `watchDir`, `watchFile`, `dirSize`, `fullContent`

### State Management

- **Jotai**: Primary state management library
- **Atoms**: Used for panel state, file lists, selection, navigation
- **Immer**: Used for immutable state updates
- Context providers for theming, file icons, glyph size

### Component Architecture

**Main Components:**
- `App.tsx`: Root component, handles layout and global commands
- `FilePanel`: Main file list component with multiple view modes
- `QuickView`: File preview panel (images, text, PDFs)
- `ActionsBar`: Bottom action buttons
- `TopMenu`: Menu bar with file operations

**Panel System:**
- Dual-pane interface with left/right panels
- Each panel has independent navigation state
- Focused panel concept for keyboard shortcuts
- Layout persistence via `~/.faraday/layout.json5`

## Code Style Guidelines

### TypeScript

```typescript
// Use strict TypeScript - avoid 'any' when possible
interface MyInterface {
  name: string;
  size: number;
}

// Prefer async/await over promises
async function readFile(path: string): Promise<Uint8Array> {
  return await fs.read(path);
}

// Use type imports
import type { FileSystemProvider } from "@frdy/sdk";
```

### Formatting (Biome)

- **Line width**: 160 characters
- **Indent**: 2 spaces
- **No semicolons** (Biome default)
- Organize imports enabled
- Use Biome for formatting, not Prettier

### React Patterns

```typescript
// Use function components with hooks
export function MyComponent() {
  const [state, setState] = useState(false);
  
  // Use Jotai atoms for global state
  const [files] = useAtom(filesAtom);
  
  return <div>{/* ... */}</div>;
}

// Avoid default exports except for lazy-loaded components
export { MyComponent };
```

### Naming Conventions

- **Files**: PascalCase for components (`FilePanel.tsx`), camelCase for utilities (`fileUtils.ts`)
- **Components**: PascalCase (`FilePanel`, `QuickView`)
- **Hooks**: camelCase with `use` prefix (`useFileContent`, `usePanels`)
- **Types/Interfaces**: PascalCase (`FileSystemProvider`, `PanelState`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants, camelCase for config objects

## Development Workflows

### Building

```bash
# Install dependencies
pnpm install

# Build all packages (uses Turbo)
pnpm build

# Build specific package
cd apps/faraday && pnpm build

# Development mode with hot reload
pnpm dev                    # All packages
cd apps/faraday && pnpm dev # Electron app only
```

### Code Quality

```bash
# Type checking
pnpm typecheck              # All packages
cd apps/faraday && pnpm typecheck

# Linting (uses ESLint)
pnpm lint

# Format code (Biome handles this in pre-commit)
# Biome runs automatically via git hooks
```

### Electron Development

```bash
cd apps/faraday
pnpm dev                    # Start dev server with hot reload
pnpm build                  # Build for production
pnpm build:mac              # Build macOS app
pnpm build:win              # Build Windows app
pnpm build:linux            # Build Linux app
```

## Key Patterns and Conventions

### FSP Implementation

When implementing FSP operations:

1. **Always add logging**: Use `console.log('[FSP Core] operation:', params)` pattern
2. **Handle errors gracefully**: Catch and return proper error messages via `emitError`
3. **Use proper types**: Import from `types.ts`, never use `any` for FSP responses
4. **Close handles**: Always clean up file handles in `close` handler
5. **Base64 for binary**: File data is transferred as base64 strings

```typescript
// Good FSP handler example
export async function handleRead(
  id: number,
  handle: string,
  offset: number,
  length: number,
  sender: (response: FspResponse) => void
): Promise<void> {
  console.log('[FSP Core] read:', { id, handle, offset, length });
  
  try {
    const handleData = handles.get(handle);
    if (!handleData?.fileHandle) {
      throw new Error('Invalid file handle');
    }
    
    const buffer = Buffer.alloc(length);
    const { bytesRead } = await handleData.fileHandle.read(buffer, 0, length, offset);
    
    console.log('[FSP Core] read success:', { id, handle, bytesRead });
    emitOkResponse(sender, id, buffer.toString('base64'));
  } catch (err: any) {
    console.error('[FSP Core] read error:', { id, handle, error: err.message });
    emitError(sender, id, err.message);
  }
}
```

### IPC Communication

Renderer → Main process:
```typescript
// Renderer sends request
window.api.fsp.sendRequest({ id: 1, type: 'open', args: { filename: 'test.txt' } });

// Renderer receives response
window.api.fsp.onResponse((response) => {
  if (response.error) {
    // Handle error
  } else {
    // Handle success with response.result
  }
});
```

Main → Renderer (via sender):
```typescript
const sender = (response: FspResponse) => {
  event.sender.send('fsp-response', response);
};
```

### File System Operations

```typescript
// Always use FileSystemProvider interface
import type { FileSystemProvider } from "@frdy/sdk";

// Read file content
const fs: FileSystemProvider = ipcfs;
const handle = await fs.open('/path/to/file', AceMask.READ_DATA, Flags.OPEN_EXISTING);
const data = await fs.read(handle, 0, 1024);
await fs.close(handle);

// Directory listing
const dirHandle = await fs.openDir('/path/to/dir');
const { files, endOfList } = await fs.readDir(dirHandle);
await fs.close(dirHandle);
```

### State Management with Jotai

```typescript
// Define atoms
export const filesAtom = atom<Dirent[]>([]);
export const selectedFilesAtom = atom<Set<string>>(new Set());

// Use in components
function FileList() {
  const [files] = useAtom(filesAtom);
  const [selected, setSelected] = useAtom(selectedFilesAtom);
  
  return <div>{/* render files */}</div>;
}
```

### Command System

Commands are defined in `packages/commands/`:

```typescript
// Register command handler
useCommandBinding("copyFiles", async () => {
  // Implementation
});

// Commands support context variables
useSetContextVariable("hasSelection", true, selectedFiles.size > 0);
```

## Testing Considerations

- No formal test suite currently exists
- Manual testing via Electron dev mode
- FSP operations should be tested with actual filesystem operations
- Consider adding tests when modifying core FSP handlers

## Deployment

- **Desktop**: Built with electron-builder
- **Web Demo**: Deployed to GitHub Pages (faraday-fm.github.io)
- **Release Process**: Uses changesets for version management
- CI/CD via GitHub Actions (`.github/workflows/release.yml`)

## Common Tasks

### Adding a New FSP Operation

1. Add method signature to `FileSystemProvider` interface in `packages/sdk/src/fs.ts`
2. Implement handler in `apps/faraday/src/main/fsp/core-handlers.ts`
3. Add case in switch statement in `apps/faraday/src/main/fsp/index.ts`
4. Update renderer method in `apps/faraday/src/renderer/src/services/ipcfs.ts`
5. Add logging at all levels

### Adding a New UI Component

1. Create component in `packages/web-ui/src/components/`
2. Export from appropriate index file
3. Use Jotai atoms for state if needed
4. Follow existing patterns for styling (CSS-in-JS via `css()` helper)
5. Add command bindings if component has actions

### Modifying File Panel Behavior

- Core logic in `packages/web-ui/src/components/panels/FilePanel/`
- Different view modes: `FullView.tsx`, `CondensedView.tsx`
- Panel state managed via Jotai atoms in `features/panels/`
- Selection logic in `features/fileSelection/`

## Troubleshooting

### Common Issues

1. **"Duplicate request" errors**: Removed in latest version, no longer an issue
2. **Handle not found**: Ensure handles are properly registered and not prematurely closed
3. **IPC not working**: Check preload script is properly exposing API
4. **Type errors**: Ensure all packages are built (`pnpm build`)

### Debugging

- Main process logs: Check terminal where Electron was launched
- Renderer logs: Open DevTools (View → Toggle DevTools)
- FSP operations: Look for `[FSP IPC]`, `[FSP Core]`, `[FSP Handler]` prefixed logs
- Network requests: Check `[FS]` and `[FSP]` prefixed logs in renderer console

## Resources

- **Main Repository**: https://github.com/faraday-fm/faraday
- **Web UI Package**: https://github.com/faraday-fm/web-ui
- **Live Demo**: https://faraday-fm.github.io
- **Electron Docs**: https://www.electronjs.org/docs
- **Jotai Docs**: https://jotai.org
- **Biome Docs**: https://biomejs.dev

## Notes for AI Assistants

- Always maintain existing logging patterns when modifying FSP code
- Respect the monorepo structure - changes to `packages/` affect multiple apps
- Use `pnpm` (not npm or yarn) for dependency management
- Follow Biome formatting rules (160 char line width, 2 space indent)
- When modifying FSP: update both handler AND IPC router
- File operations are asynchronous - always use async/await
- Binary data uses base64 encoding over IPC
- Request IDs must be unique per renderer session (auto-incremented)
- Handles are managed per-request, not globally cached
- Always close file handles to prevent resource leaks
