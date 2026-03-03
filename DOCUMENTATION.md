# VectorFlow — Complete Project Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [How to Run](#3-how-to-run)
4. [Architecture & Data Flow](#4-architecture--data-flow)
5. [Frontend — File-by-File Reference](#5-frontend--file-by-file-reference)
   - [App.js](#51-appjs)
   - [index.css](#52-indexcss)
   - [store.js](#53-storejs)
   - [api.js](#54-apijs)
   - [ui.js](#55-uijs)
   - [toolbar.js](#56-toolbarjs)
   - [draggableNode.js](#57-draggablenodejs)
   - [submit.js](#58-submitjs)
   - [hooks/useToast.js](#59-hooksusetoastjs)
   - [components/ToastContainer.js](#510-componentstoastcontainerjs)
   - [components/EmptyCanvas.js](#511-componentsemptycanvasjs)
   - [components/ErrorBoundary.js](#512-componentserrorboundaryjs)
6. [Nodes — Shared Base](#6-nodes--shared-base)
   - [nodes/BaseNode.js](#61-nodesbasenodejs)
7. [Nodes — Individual Reference](#7-nodes--individual-reference)
   - [inputNode.js](#71-inputnodejs)
   - [outputNode.js](#72-outputnodejs)
   - [llmNode.js](#73-llmnodejs)
   - [textNode.js](#74-textnodejs)
   - [imageNode.js](#75-imagenodejs)
   - [databaseNode.js](#76-databasenodejs)
   - [filterNode.js](#77-filternodejs)
   - [noteNode.js](#78-notenodejs)
   - [timerNode.js](#79-timernodejs)
8. [Backend — main.py](#8-backend--mainpy)
9. [State Management Deep Dive](#9-state-management-deep-dive)
10. [Toast System Deep Dive](#10-toast-system-deep-dive)
11. [Performance Optimisations](#11-performance-optimisations)
12. [How to Add a New Node](#12-how-to-add-a-new-node)
13. [Keyboard Shortcuts & UX](#13-keyboard-shortcuts--ux)
14. [Environment Variables](#14-environment-variables)

---

## 1. Project Overview

**VectorFlow** is a browser-based visual pipeline builder.

- Users drag nodes from a sidebar onto an infinite canvas.
- They connect nodes with edges (wires) to form a directed graph.
- They click **Run Pipeline** to send the graph to a FastAPI backend which validates it as a Directed Acyclic Graph (DAG).

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 17/18, ReactFlow, Zustand     |
| Backend   | Python 3.13, FastAPI, Uvicorn       |
| Styling   | Plain CSS with CSS custom properties|
| State     | Zustand (with localStorage persist) |

---

## 2. Project Structure

```
vector/
├── backend/
│   └── main.py                  ← FastAPI server (single file)
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js               ← Root component / app shell
    │   ├── index.css            ← Global styles & design tokens
    │   ├── index.js             ← React DOM entry point
    │   ├── store.js             ← Zustand global state
    │   ├── api.js               ← All backend HTTP calls
    │   ├── ui.js                ← ReactFlow canvas
    │   ├── toolbar.js           ← Left sidebar node palette
    │   ├── draggableNode.js     ← Individual draggable chip in sidebar
    │   ├── submit.js            ← "Run Pipeline" button
    │   │
    │   ├── hooks/
    │   │   └── useToast.js      ← Toast notification state (Zustand)
    │   │
    │   ├── components/
    │   │   ├── ToastContainer.js   ← Renders active toasts
    │   │   ├── EmptyCanvas.js      ← Onboarding overlay (empty state)
    │   │   └── ErrorBoundary.js    ← React error catcher
    │   │
    │   └── nodes/
    │       ├── BaseNode.js      ← Reusable node shell (header, body, handles)
    │       ├── inputNode.js     ← Input node
    │       ├── outputNode.js    ← Output node
    │       ├── llmNode.js       ← LLM / AI model node
    │       ├── textNode.js      ← Smart text node (auto-resize + dynamic handles)
    │       ├── imageNode.js     ← Image URL node with preview
    │       ├── databaseNode.js  ← Database connection node
    │       ├── filterNode.js    ← Data filter node
    │       ├── noteNode.js      ← Sticky note node
    │       └── timerNode.js     ← Interval timer node
    └── package.json
```

---

## 3. How to Run

### Backend

```powershell
cd d:\projects\vector\backend
D:/projects/vector/.venv/Scripts/uvicorn.exe main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Visit `http://localhost:8000/docs` for the auto-generated Swagger UI.

### Frontend

```powershell
cd d:\projects\vector\frontend
npm start
```

The app will open at `http://localhost:3000`.

> **Both must be running at the same time for Run Pipeline to work.**

---

## 4. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│                                                              │
│  App.js                                                      │
│   ├── ErrorBoundary   (catches React render crashes)        │
│   ├── Header          (logo + SubmitButton)                 │
│   ├── PipelineToolbar (sidebar — draggable node chips)      │
│   ├── PipelineUI      (ReactFlow canvas)                    │
│   └── ToastContainer  (fixed top-right notifications)       │
│                                                              │
│  Zustand store  ←──→  Everything reads/writes state here    │
│   ├── nodes[]                                               │
│   ├── edges[]                                               │
│   ├── nodeIDs{}   (persisted to localStorage)               │
│   └── actions: addNode, removeNode, clearCanvas…            │
│                                                              │
│  api.js  ──HTTP POST──►  FastAPI /pipelines/parse           │
│                           returns { num_nodes, num_edges,   │
│                                     is_dag }                │
│                                                              │
│  useToast / ToastContainer  (shows result to user)          │
└─────────────────────────────────────────────────────────────┘
```

**Step-by-step user flow:**

1. User drags a chip from `PipelineToolbar` → drops onto the canvas.
2. `onDrop` in `ui.js` fires → calls `addNode` on the Zustand store.
3. ReactFlow re-renders with the new node; Zustand persists state to `localStorage` (debounced).
4. User connects handles between nodes → `onConnect` fires → `addEdge` is called with deduplication guard.
5. User clicks **Run Pipeline** (or presses `Ctrl+Enter`).
6. `submit.js` validates (at least one Input and one Output node), then calls `api.parsePipeline`.
7. `api.js` POSTs `{ nodes: [{id}], edges: [{source, target}] }` to `http://localhost:8000/pipelines/parse`.
8. Backend runs three-colour DFS, returns `{ num_nodes, num_edges, is_dag }`.
9. `submit.js` shows a success/error toast via `useToast`.

---

## 5. Frontend — File-by-File Reference

---

### 5.1 `App.js`

**Role:** Root component. Assembles the entire UI layout.

```
App
 └─ ErrorBoundary
     └─ div.app-shell
         ├─ header.app-header
         │   ├─ .app-logo         ("⬡ VectorFlow beta")
         │   └─ .app-header-actions
         │       └─ <SubmitButton />
         ├─ div.app-body
         │   ├─ aside.app-sidebar
         │   │   └─ <PipelineToolbar />
         │   └─ main.app-canvas
         │       └─ <PipelineUI />
         └─ <ToastContainer />
```

No state of its own. Purely structural.

---

### 5.2 `index.css`

**Role:** Design system. All visual tokens live here as CSS custom properties.

#### Key CSS Variables

| Variable           | Value       | Usage                        |
|--------------------|-------------|------------------------------|
| `--bg-canvas`      | `#0d1117`   | Canvas background            |
| `--bg-surface`     | `#161b27`   | Node / panel background      |
| `--bg-surface-2`   | `#1e2535`   | Slightly lighter surface     |
| `--accent`         | `#4f8ef7`   | Blue accent (buttons, handles)|
| `--border`         | `#2a3352`   | Default border colour        |
| `--text-primary`   | `#e6edf3`   | Main text                    |
| `--text-secondary` | `#8b95a5`   | Muted text                   |
| `--font`           | `Inter, Segoe UI, system-ui` | App font    |
| `--radius-md`      | `6px`       | Standard border radius       |

#### Key CSS Classes

| Class                      | What it does                                        |
|----------------------------|-----------------------------------------------------|
| `.app-shell`               | Full-height flex column (header + body)             |
| `.app-header`              | Fixed top bar with logo and actions                 |
| `.app-sidebar`             | Left panel holding the toolbar                      |
| `.app-canvas`              | Fills remaining space for the ReactFlow canvas      |
| `.toolbar`                 | Sidebar inner scroll container                      |
| `.toolbar-group-label`     | Category heading (I/O, AI, Data…)                  |
| `.draggable-node`          | Chip in the sidebar; uses `--node-color` CSS var   |
| `.submit-btn`              | Run Pipeline button                                 |
| `.submit-btn--loading`     | Loading state (spinner visible, button disabled)   |
| `.spinner`                 | Animated spinning circle (inside loading button)   |
| `.canvas-action-btn`       | Fit/Clear buttons floating on the canvas            |
| `.canvas-action-btn--danger` | Red variant for the Clear button                  |

#### Animations

| Name            | Effect                              |
|-----------------|-------------------------------------|
| `toastIn`       | Toast slides in from the right      |
| `toastProgress` | Toast progress bar depletes to 0    |
| `spin`          | 360° rotation for the spinner       |

#### ReactFlow Handle Overrides

```css
.react-flow__handle {
  width: 11px; height: 11px; border: 2px solid ...;
}
.react-flow__handle-source { background: #4f8ef7; }  /* blue */
.react-flow__handle-target { background: #00d68f; }  /* green */
```

---

### 5.3 `store.js`

**Role:** Single source of truth for all pipeline data. Built with **Zustand** and wrapped in the `persist` middleware so state survives page reloads.

#### State Shape

```js
{
  nodes:   [],   // ReactFlow node objects
  edges:   [],   // ReactFlow edge objects
  nodeIDs: {},   // { customInput: 2, llm: 1, ... } — counter per type
}
```

#### Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `getNodeID` | `(type) → string` | Returns next unique ID like `"llm-3"`. Increments the per-type counter. |
| `addNode` | `(node) → void` | Appends a node to the `nodes` array. |
| `removeNode` | `(nodeId) → void` | Removes the node AND all edges touching it. |
| `clearCanvas` | `() → void` | Wipes all nodes and edges. |
| `onNodesChange` | `(changes) → void` | Called by ReactFlow on drag/select/remove — applies changes via `applyNodeChanges`. |
| `onEdgesChange` | `(changes) → void` | Called by ReactFlow on edge operations — applies changes via `applyEdgeChanges`. |
| `onConnect` | `(connection) → void` | Called when user draws a connection. Prevents duplicate edges, then calls `addEdge`. |
| `updateNodeField` | `(nodeId, fieldName, value) → void` | Updates a single field inside a node's `data` object. Used by node form fields. |

#### Persistence

Data is saved to `localStorage` under the key **`vectorflow-pipeline`**.

Only `nodes`, `edges`, and `nodeIDs` are persisted (`partialize`).

**Debounced writes:** localStorage writes are delayed 800ms after the last change. This prevents the drag handler (which fires ~60× per second) from blocking the browser's main thread.

```js
// The debounce wrapper
setItem: (key, value) => {
  clearTimeout(timer);
  timer = setTimeout(() => localStorage.setItem(key, value), 800);
}
```

---

### 5.4 `api.js`

**Role:** Centralised place for all HTTP calls. No component calls `fetch` directly.

#### Base URL

```js
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

Set `REACT_APP_API_URL` in a `.env` file to point at staging or production:

```
REACT_APP_API_URL=https://your-production-api.com
```

#### `api.parsePipeline({ nodes, edges })`

POSTs to `/pipelines/parse`. Strips node data down to just `{ id }` and edges to `{ source, target }` before sending (the backend doesn't need frontend-specific fields).

Throws a meaningful `Error` if the response is not `2xx`. The error message is extracted from `body.detail` or `body.message` if available.

---

### 5.5 `ui.js`

**Role:** The ReactFlow canvas. Handles drag-drop, keyboard shortcuts, and the floating Fit/Clear buttons.

#### Exported Component: `PipelineUI`

Reads from the store: `nodes`, `edges`, `getNodeID`, `addNode`, `clearCanvas`, `onNodesChange`, `onEdgesChange`, `onConnect`.

#### `nodeTypes` (registered at module level)

```js
const nodeTypes = {
  customInput:  InputNode,
  customOutput: OutputNode,
  llm:          LLMNode,
  text:         TextNode,
  image:        ImageNode,
  database:     DatabaseNode,
  filter:       FilterNode,
  note:         NoteNode,
  timer:        TimerNode,
};
```

Every new node type **must** be registered here or ReactFlow will not render it.

#### `CanvasActions` (hoisted above `PipelineUI`)

Two floating buttons appear in the top-right corner of the canvas when there is at least one node:

- **⊞ Fit** — calls `rfInstance.fitView()` with animation (300ms).
- **✕ Clear** — prompts `window.confirm` then calls `clearCanvas()`.

> Hoisted outside `PipelineUI` to prevent React from destroying and recreating it on every render inside the component.

#### Key ReactFlow Props

| Prop | Value | Reason |
|------|-------|--------|
| `snapToGrid` | `true` | Nodes snap to a 20px grid for alignment |
| `deleteKeyCode` | `['Backspace', 'Delete']` | Both keys remove selected nodes/edges |
| `fitView` | `true` | Canvas zooms to fit all nodes on first load |
| `connectionLineType` | `smoothstep` | Curved wires during drag |
| `defaultEdgeOptions` | memoized object | Prevents ReactFlow re-processing all edges on each render |

#### `Ctrl+Enter` Shortcut

```js
useEffect(() => {
  const handler = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      document.querySelector('.submit-btn')?.click();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

---

### 5.6 `toolbar.js`

**Role:** Left sidebar that lists all available node types as draggable chips, grouped by category.

#### `NODE_GROUPS` Data Structure

```js
const NODE_GROUPS = [
  { label: 'I / O',  nodes: [{ type, label, icon }, ...] },
  { label: 'AI',     nodes: [...] },
  { label: 'Data',   nodes: [...] },
  { label: 'Logic',  nodes: [...] },
  { label: 'Utils',  nodes: [...] },
];
```

To add a new category or move a node to a different group, edit this array. No other file needs changing for the sidebar.

---

### 5.7 `draggableNode.js`

**Role:** Single chip in the toolbar. Handles the HTML5 drag-and-drop data transfer.

#### How Drag Works

```js
event.dataTransfer.setData(
  'application/reactflow',
  JSON.stringify({ nodeType: type })
);
```

When the user drops the chip onto the canvas, `ui.js`'s `onDrop` reads this data:

```js
const raw = event.dataTransfer.getData('application/reactflow');
const { nodeType: type } = JSON.parse(raw);
```

#### `NODE_COLORS`

Each node type has a color used as the left-border accent of the chip:

```js
const NODE_COLORS = {
  customInput:  '#4f8ef7',  // blue
  customOutput: '#00d68f',  // green
  llm:          '#9b72f7',  // purple
  text:         '#f7a44f',  // orange
  image:        '#f75f5f',  // red
  database:     '#00b4d8',  // cyan
  filter:       '#a855f7',  // violet
  note:         '#6b7280',  // grey
  timer:        '#ef4444',  // red
};
```

---

### 5.8 `submit.js`

**Role:** The "Run Pipeline" button with client-side validation and backend integration.

#### Validation (before making the API call)

1. Canvas must not be empty (`nodes.length === 0`).
2. At least one `customInput` node must exist.
3. At least one `customOutput` node must exist.

If any check fails, a **warn** toast is shown and the API call is skipped.

#### Loading State

While the API call is in flight:
- A spinner appears inside the button.
- The button text changes to "Analyzing…".
- The button is `disabled` to prevent double-submission.
- CSS class `submit-btn--loading` is applied.

#### Result

| Backend response | Toast shown |
|-----------------|-------------|
| `is_dag: true`  | ✅ Green success toast with node/edge count |
| `is_dag: false` | ❌ Red error toast — cycle detected |
| Network/HTTP error | ❌ Red error toast with error message |

---

### 5.9 `hooks/useToast.js`

**Role:** Global notification system. Zero external dependencies — built on a tiny Zustand store.

#### Store Shape

```js
{
  toasts: [{ id, type, message, title, duration, persistent, action }]
}
```

#### `useToast()` Return Value

```js
const { toast, clearToasts } = useToast();
```

#### `toast` API

| Method | Signature | Example |
|--------|-----------|---------|
| `toast.success` | `(message, opts?) → id` | `toast.success('Saved!')` |
| `toast.error`   | `(message, opts?) → id` | `toast.error('Failed', { title: 'Network Error', duration: 6000 })` |
| `toast.info`    | `(message, opts?) → id` | `toast.info('Connecting…', { persistent: true })` |
| `toast.warn`    | `(message, opts?) → id` | `toast.warn('Unsaved changes')` |

#### Options Object

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | — | Bold heading line; `message` drops to body |
| `duration` | `number` | `4000` | Auto-dismiss delay in ms |
| `persistent` | `boolean` | `false` | If `true`, never auto-dismisses |
| `action` | `{ label, onClick }` | — | Renders a button inside the toast |

#### `clearToasts()`

Removes all active toasts immediately.

#### Max Stack

The store caps at **5 toasts**. When a 6th arrives, the oldest non-persistent toast is evicted.

---

### 5.10 `components/ToastContainer.js`

**Role:** Renders the active toast stack in the top-right corner of the screen (`position: fixed`).

#### Features

| Feature | How it works |
|---------|-------------|
| **Progress bar** | Animated `width: 100% → 0%` over `duration` ms |
| **Pause on hover** | `onMouseEnter` clears the auto-dismiss timer; `onMouseLeave` re-schedules it |
| **Title + body** | If `title` is set, it shows bold in the header with `message` below |
| **Action button** | Clicking fires `action.onClick()` then removes the toast |
| **Close button** | The `×` button always dismisses immediately |
| **Color coding** | Green = success, Red = error, Blue = info, Orange = warn |

---

### 5.11 `components/EmptyCanvas.js`

**Role:** An overlay shown on the canvas when there are zero nodes. Guides the user with 3 steps.

- `pointer-events: none` so it never blocks mouse events on the canvas.
- Disappears automatically once any node is added (controlled by `nodes.length === 0 && <EmptyCanvas />` in `ui.js`).

---

### 5.12 `components/ErrorBoundary.js`

**Role:** A React class component that catches any unhandled rendering error inside the app tree.

When a crash occurs, it renders a fallback UI instead of a blank page. A **"Try to recover"** button resets its error state, causing a re-render attempt.

In production you would extend this to send the error to a logging service (Sentry, etc.).

---

## 6. Nodes — Shared Base

---

### 6.1 `nodes/BaseNode.js`

**Role:** The visual shell all nodes share. Handles container styling, the coloured header, body layout, ReactFlow handles, and the two header action buttons.

#### Exports

| Export | Type | Purpose |
|--------|------|---------|
| `BaseNode` | Component | Main wrapper for all nodes |
| `NodeField` | Component | Label + control row inside a node body |
| `inputStyle` | Object | Dark-themed styles for `<input>` elements |
| `selectStyle` | Object | Same as `inputStyle` but with `cursor: pointer` for `<select>` |

#### `BaseNode` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | required | ReactFlow node ID — used by delete and zoom buttons |
| `label` | `string` | required | Text shown in the header |
| `handles` | `Array` | `[]` | Handle descriptors (see below) |
| `headerColor` | `string` | `'#4f8ef7'` | Background color of the header bar |
| `children` | `ReactNode` | — | Body content |
| `style` | `object` | `{}` | Extra styles merged onto the outer container |
| `bodyStyle` | `object` | `{}` | Extra styles merged onto the body wrapper |

#### Handle Descriptor Shape

```js
{
  id:       'my-handle',           // string — must be unique within the node
  type:     'source' | 'target',   // source = output, target = input
  position: Position.Left | Position.Right | Position.Top | Position.Bottom,
  style:    {}                     // optional extra CSS
}
```

#### Header Buttons

Every node header contains two icon buttons on the right side:

| Button | Icon | Hover Color | Action |
|--------|------|-------------|--------|
| Zoom to node | ⌕  | Blue | `fitView({ nodes: [{ id }], duration: 400, padding: 0.35, maxZoom: 1.8 })` |
| Remove node  | ×  | Red  | `removeNode(id)` — removes node and all its connected edges |

The buttons use `className="nodrag"` which is the ReactFlow convention to prevent the canvas from intercepting keyboard/mouse events inside them.

#### `NodeField` Usage

```jsx
<NodeField label="Model Name">
  <input style={inputStyle} className="nodrag" ... />
</NodeField>
```

Renders the label as a small ALL-CAPS grey header above the control.

#### `inputStyle` / `selectStyle`

Shared dark-theme style objects applied to all `<input>` and `<select>` elements:

```js
{
  background: '#0d1117',
  color: '#e6edf3',
  border: '1px solid #2a3352',
  borderRadius: 5,
  padding: '4px 7px',
  fontSize: 12,
  width: '100%',
  boxSizing: 'border-box',
}
```

---

## 7. Nodes — Individual Reference

All nodes receive `{ id, data }` as props from ReactFlow. `data.id` equals the node's ReactFlow `id`.

### 7.1 `inputNode.js`

**Header color:** Blue `#2e86de`  
**Handles:** 1 source (right side) — data flows out

**Fields:**
| Field | Control | Description |
|-------|---------|-------------|
| Input Name | `<input>` | Label / identifier for this input |
| Input Type | `<select>` | Text / Image / Audio / File |

---

### 7.2 `outputNode.js`

**Header color:** Green `#10ac84`  
**Handles:** 1 target (left side) — data flows in

**Fields:**
| Field | Control | Description |
|-------|---------|-------------|
| Output Name | `<input>` | Label for this output |
| Output Type | `<select>` | Text / Image / Audio / File |

---

### 7.3 `llmNode.js`

**Header color:** Purple `#8e44ad`  
**Handles:** 1 target (left — system prompt), 1 target (left — user prompt), 1 source (right — response)

**Fields:**
| Field | Control | Options |
|-------|---------|---------|
| Model | `<select>` | gpt-4o, gpt-4-turbo, gpt-3.5-turbo |
| Temperature | `<input type="number">` | 0.0 – 2.0 |

---

### 7.4 `textNode.js`

**Header color:** Orange `#f39c12`  
**Handles:** Dynamic — one target handle per `{{variable}}` found in the text, plus one source handle (right side)

**Special behaviours:**

#### Auto-resize (width)
Uses an offscreen `<canvas>` (`measureMaxLineWidth`) to measure the pixel width of the longest line. Width is clamped between 240px and 720px.

#### Auto-resize (height)
`textarea.style.height = textarea.scrollHeight + 'px'` on every change.

#### Dynamic Handle Detection
Regex: `/\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g`

Any text like `Hello {{name}}, your score is {{score}}` creates two target handles labelled `name` and `score`. Their vertical positions are spread evenly along the left edge.

#### Variable Legend
Below the textarea, a small list shows all detected variable names as inline code badges.

> **Important:** `className="nodrag"` on the textarea prevents ReactFlow from intercepting keyboard events, allowing normal typing.

---

### 7.5 `imageNode.js`

**Header color:** Red-orange `#e17055`  
**Handles:** 1 target (left), 1 source (right)

**Fields:**
| Field | Control |
|-------|---------|
| Image URL | `<input>` |
| Format | `<select>` — PNG, JPEG, WebP, GIF |

Shows a live image preview (max 160px wide) below the URL field when a URL is entered.

---

### 7.6 `databaseNode.js`

**Header color:** Blue `#0984e3`  
**Handles:** 1 target (left — query), 1 source (right — result)

**Fields:**
| Field | Control | Options |
|-------|---------|---------|
| DB Type | `<select>` | PostgreSQL, MySQL, MongoDB, SQLite, Redis |
| Host | `<input>` | e.g. `localhost` |
| Table / Collection | `<input>` | Table or collection name |

---

### 7.7 `filterNode.js`

**Header color:** Violet `#6c5ce7`  
**Handles:** 1 target (left — data in), 1 source (right, top — pass), 1 source (right, bottom — fail)

The two output handles let you route data differently depending on whether it passes the filter condition.

**Fields:**
| Field | Control | Options |
|-------|---------|---------|
| Field | `<input>` | Field name to filter on |
| Operator | `<select>` | equals, not equals, contains, greater than, less than |
| Value | `<input>` | Value to compare against |

---

### 7.8 `noteNode.js`

**Header color:** Dark gray `#374151`  
**Handles:** None — purely a documentation/annotation node

**Fields:**
| Field | Control |
|-------|---------|
| Text | `<textarea>` |
| Background color | Color swatches (6 preset colors) |

Background color changes the entire node's background. Useful for grouping related nodes visually.

---

### 7.9 `timerNode.js`

**Header color:** Red `#d63031`  
**Handles:** 1 source (right — tick output)

**Fields:**
| Field | Control | Options |
|-------|---------|---------|
| Interval | `<input type="number">` | Numeric value |
| Unit | `<select>` | Seconds, Minutes, Hours |

**Interactive controls:**
- **Start** button — activates an interval via `setInterval` and increments a tick counter.
- **Stop** button — clears the interval.
- Tick counter displayed live.

> The timer is local component state only — it does not persist across page reloads.

---

## 8. Backend — `main.py`

**Framework:** FastAPI  
**Runtime:** Python 3.13 (venv at `D:/projects/vector/.venv`)  
**Port:** 8000

### Endpoints

#### `GET /`
Health check.

```json
{ "status": "ok", "service": "VectorFlow API", "version": "1.0.0" }
```

#### `POST /pipelines/parse`

**Request body:**
```json
{
  "nodes": [{ "id": "customInput-1" }, { "id": "llm-1" }],
  "edges": [{ "source": "customInput-1", "target": "llm-1" }]
}
```

**Response:**
```json
{
  "num_nodes": 2,
  "num_edges": 1,
  "is_dag": true
}
```

`is_dag: true` means the graph has no cycles and is valid. `is_dag: false` means a cycle was detected.

---

### Pydantic Models with Validation

```python
class Node(BaseModel):
    id: str

    @field_validator("id")
    def id_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Node id must not be empty")
        return v.strip()
```

Same pattern for `Edge.source` and `Edge.target`. FastAPI automatically returns HTTP 422 with details if validation fails.

---

### DAG Detection Algorithm

**Algorithm:** Iterative DFS with three-colour marking.

**Why iterative?** Python has a default recursion limit of 1000. Large pipelines would crash a recursive DFS. The iterative version uses an explicit stack so it can handle arbitrarily large graphs.

**Colours:**
- `WHITE (0)` — not yet visited
- `GRAY (1)` — currently on the DFS stack (being explored)
- `BLACK (2)` — fully processed

**Cycle detection rule:** If DFS encounters a neighbour that is `GRAY`, it means there is a path back to an ancestor that is still being explored — this is a **back edge**, which means a cycle exists.

```python
for start in adj:
    if color[start] != WHITE:
        continue
    color[start] = GRAY
    stack = [(start, iter(adj[start]))]

    while stack:
        node_id, neighbours = stack[-1]
        try:
            nbr = next(neighbours)
            if color.get(nbr) == GRAY:
                return False          # cycle found
            if color.get(nbr, WHITE) == WHITE:
                color[nbr] = GRAY
                stack.append((nbr, iter(adj.get(nbr, []))))
        except StopIteration:
            color[node_id] = BLACK
            stack.pop()
```

---

### Middleware

#### Request Timing Logger

```python
@app.middleware("http")
async def log_requests(request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    logger.info("%s %s → %d  (%.1f ms)", ...)
```

Every request is logged with method, path, status code, and duration.

#### Global Exception Handler

```python
@app.exception_handler(Exception)
async def unhandled_exception(request, exc):
    logger.error("Unhandled error: %s", exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
```

Prevents raw Python tracebacks from leaking to the client.

#### CORS

Only `http://localhost:3000` and `http://127.0.0.1:3000` are allowed. To add a production domain:

```python
allow_origins=["http://localhost:3000", "https://your-domain.com"]
```

---

## 9. State Management Deep Dive

### Why Zustand?

- No boilerplate (no reducers, no action types, no providers).
- Components subscribe only to the slice of state they need (`selector` + `shallow`) — no unnecessary re-renders.
- Works perfectly with ReactFlow's change-based update model.

### Selector Pattern

```js
const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

const { nodes, edges } = useStore(selector, shallow);
```

`shallow` means the component only re-renders if the selected values actually changed by reference. Without `shallow`, every state update (even unrelated ones) would re-render every subscriber.

### Duplicate Edge Guard

```js
const exists = get().edges.some(
  (e) => e.source === connection.source &&
          e.target === connection.target &&
          e.sourceHandle === connection.sourceHandle &&
          e.targetHandle === connection.targetHandle
);
if (exists) return;
```

Prevents users from drawing the same connection twice.

---

## 10. Toast System Deep Dive

### Call from any component

```js
import { useToast } from './hooks/useToast';

const { toast } = useToast();

// Inside a handler:
toast.success('Pipeline saved!');
toast.error('Network error', { title: 'Connection Failed', duration: 8000 });
toast.warn('Add an Output node', { action: { label: 'Dismiss', onClick: () => {} } });
toast.info('Syncing…', { persistent: true });   // never auto-dismisses
```

### How auto-dismiss works (pause on hover)

```js
// On mouse-enter: clear the scheduled dismiss
clearTimeout(timerRef.current);

// On mouse-leave: re-schedule with the original duration
timerRef.current = setTimeout(() => onRemove(t.id), t.duration);
```

The progress bar's CSS animation is also paused via `animationPlayState: paused`.

---

## 11. Performance Optimisations

| Problem | Solution |
|---------|----------|
| localStorage called 60×/sec during drag | Debounced `setItem` — writes after 800ms idle |
| `CanvasActions` re-created on every `PipelineUI` render | Hoisted to module scope, receives props |
| `defaultEdgeOptions` new object every render | Wrapped in `useMemo(() => ({...}), [])` |
| All store state re-subscribing components | `shallow` selector equality check |
| ReactFlow intercepting keyboard input in fields | `className="nodrag"` on all `<input>`, `<select>`, `<textarea>` |

---

## 12. How to Add a New Node

**Step 1 — Create the node file** (`src/nodes/myNode.js`):

```jsx
import { Position } from 'reactflow';
import { BaseNode, NodeField, inputStyle } from './BaseNode';
import { useStore } from '../store';

export const MyNode = ({ id, data }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);

  const handles = [
    { id: 'in',  type: 'target', position: Position.Left  },
    { id: 'out', type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode label="My Node" id={id} handles={handles} headerColor="#your-color">
      <NodeField label="My Field">
        <input
          className="nodrag"
          style={inputStyle}
          value={data.myField || ''}
          onChange={(e) => updateNodeField(id, 'myField', e.target.value)}
        />
      </NodeField>
    </BaseNode>
  );
};
```

**Step 2 — Register in `ui.js`:**

```js
import { MyNode } from './nodes/myNode';

const nodeTypes = {
  ...existing entries...
  myNode: MyNode,
};
```

**Step 3 — Add to the sidebar in `toolbar.js`:**

```js
{ label: 'My Category', nodes: [
  { type: 'myNode', label: 'My Node', icon: '★' },
]}
```

**Step 4 — Add a color in `draggableNode.js`:**

```js
const NODE_COLORS = {
  ...existing...
  myNode: '#your-hex-color',
};
```

That's it. The node will be draggable, deletable, zoom-focusable, and persisted automatically.

---

## 13. Keyboard Shortcuts & UX

| Shortcut / Interaction | Effect |
|------------------------|--------|
| `Ctrl + Enter` | Triggers Run Pipeline |
| `Backspace` or `Delete` | Removes selected node(s) or edge(s) |
| Node `×` button | Removes that individual node + its edges |
| Node `⌕` button | Zooms canvas to fit only that node |
| Canvas **Fit** button | Zooms to show all nodes |
| Canvas **Clear** button | Confirms then wipes everything |
| Scroll wheel on canvas | Zoom in / out |
| Middle-mouse drag | Pan the canvas |
| Hover over a toast | Pauses the auto-dismiss timer |

---

## 14. Environment Variables

Create a `.env` file at `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000
```

React's build system (Create React App) exposes any variable prefixed with `REACT_APP_` to the browser bundle. Changing this value and restarting `npm start` is all that's needed to point the frontend at a different backend.

> **Important:** `.env` files should not be committed to version control if they contain secrets.

---

*End of documentation.*
