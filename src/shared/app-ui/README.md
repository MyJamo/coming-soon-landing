# app-ui: the Jamo web app's UI for landing mockups

React copies of the app's screens, so a landing's product shots look the way the product looks today.
The kit's sources of truth are `frontend/src/styles.scss` (tokens) and the component each piece names
below. There is no app state: everything is data in, markup out. The copy is Russian and uses the app's own labels.

- **Language:** the kit's own labels (tabs, buttons, headers, status names, …) come from `locale.tsx`.
  Wrap a subtree in `<JuiLang lang="uz">` (or `"en"`) to switch them; without one the kit is Russian.
  `useJuiText()` returns the current dictionary and `useJuiLang()` the code. Text passed in as props
  (titles, previews, weekday labels, periods) is drawn as given, so callers translate their own.

- **Import:** `import { AppWindow, Board, … } from '../../shared/app-ui'`.
- **Wrap:** put everything inside `<JuiRoot>`. `AppWindow` is one already.
- **Classes:** all of them are prefixed `jui-`; state modifiers such as `on`, `mine` and `today`
  only appear compounded with a `jui-` class. The tokens are CSS variables scoped on `.jui`.
- **Font:** Inter with its opsz axis, loaded in `landings/index.html`.
- **Size:** windows are laid out at the app's real size (1440×960). Draw them smaller with
  `<Scaled width={1440} height={960}>…</Scaled>`, which scales down to the box and never up.
- **Specimen:** `#/kit` renders every piece, plus whole windows to hold beside screenshots of the
  live app.

## Catalog (`catalog.ts`)

These are the seeds a new organization gets (backend `TaskCatalogService`).

| Export | What it holds |
|---|---|
| `STATUSES` | `todo` Сделать, `progress` В прогрессе, `review` На проверке, `done` Сделано, `cancelled` Отменено, each with its colour |
| `PRIORITIES` | `low`, `normal`, `high`, `urgent` |
| `TYPES` | `task`, `feature`, `bug`, `story`, `epic` |
| `RAIL` | the five places, from `nav.rail` |
| `EVENT_TONES` | calendar colours |
| `hueOf(id)` | the hash `shared/avatar.ts` uses |
| `initialsOf(name)` | initials, as the avatar takes them |

Wherever a component takes a status, priority or type key, it also accepts a `{ name, color }` tone,
for a custom column such as PreProd.

## Components

| Component | Props | Mirrors |
|---|---|---|
| `JuiRoot` | `children, className?, style?` | `:root` tokens + `body` type |
| `AppWindow` | `width?=1440, height?=960, rail?: RailKey \| null, main, side?, bare?, chatsOpen?, unread?, call?` | `features/org/org-shell.ts` |
| `Rail` | `active?, chatsOpen?, unread?, call?, me?` | `features/org/sidebar.ts`, `shared/rail-icon.ts` |
| `Avatar`, `Avatars` | `person: { name, id?, photo?: string \| true }, size?, presence?` / `people, max?` | `shared/avatar.ts` |
| `ProjectMark`, `ProjectTag` | `project: { name, id? }, size?` | `project-shell.ts` `.logo`, `task-card.ts` `.project-mark` |
| `PriorityFlag` | `priority, label?` | `shared/task-ui.ts` |
| `TypeChip` | `type` | `shared/task-ui.ts` |
| `StatusPill` | `status` | `task-ui.ts` `StatusBadge` + `.badge` |
| `StatusBadge` | `status` | `task-detail.ts` `.status` |
| `Button` | `variant?: primary \| soft \| ghost \| glass \| white, icon?, size?, onClick?` | `styles.scss` `.btn*`, drive upload |
| `ChatsButton` | `active?, unread?` | `features/chats/chats-button.ts` |
| `SearchBox` | `placeholder?, width?, kbd?` | `shared/filters.ts` |
| `ProjectHeader` | `project, members, tab?, openTasks?, chatsActive?, unread?, addMember?` | `features/projects/project-shell.ts` |
| `BoardToolbar` | `title?, search?` | `project-board-page.ts` |
| `TaskCard` | `task: TaskCardData, compact?, highlight?, lifted?` | `shared/task-card.ts` |
| `BoardColumn` | `column: { status, tasks, count? }, compact?, over?, children?` | `shared/board.ts` |
| `Board` | `columns, compact?, over?: index, highlight?: code` | `shared/board.ts` |
| `HomeHeader` | `open, today, overdue` | `org/home` «Мои задачи» |
| `TaskListTable` | `rows: TaskRow[]` | `features/tasks/task-list.ts` |
| `ChatsPanel` | `tabs?, tab?, rows?, sections?, conversation?, expanded?, flat?` | `chats-panel.*`, `chat-folder.ts` |
| `ChatRow` | `row` (assistant \| direct \| project \| channel \| room) | `chat-folder.ts` |
| `Conversation` | `who, expanded?, children, composer?, placeholder?, typed?` | `chat-conversation.ts` + `message-pane.ts` |
| `ConversationHeader`, `MessagePane`, `Composer` | the parts of a conversation | the same files |
| `MessageBubble` | `text?, time, mine?, author?, avatar?, tail?, cont?, read?, attach?` | `message-pane.ts` |
| `TaskChip` | `chip: { code, title, trailing, tint?: ahead \| due, color? }` | `message-pane.ts` `.task-chip` |
| `FileChip`, `DayDivider` | `name, size?` / `children` | `message-pane.ts` |
| `CallRecord` | `label, detail, time, incoming?, failed?` | `shared/call-record.ts` |
| `CalendarPage` | `period, view?, legend` + the `CalendarWeek` props | `features/calendar/calendar.ts` |
| `CalendarToolbar`, `CalendarLegend` | the bar and the legend chips | `calendar.ts` |
| `CalendarWeek` | `days, from?=8, to?=17, hour?=70, events, now?, drop?, children?` | `calendar-schedule.css` |
| `EventBlock` | `ev: { day, start, end, title, tone?, ghost?, found? }` | `.timed-event` |
| `DrivePage` | `title?, lead?, rows, projects?, side?` | `features/drive/drive.*` |
| `DriveTable`, `FileRow`, `FileIcon` | `rows` / `row: { kind, name, owner, date, size? }` / `kind` | `drive.css` `.entry`, `.file-icon` |
| `TaskDetail` | `title, code, date, creator, assignees, status, type?, priority?, dates?, description?, checklist?, comments?, solid?` | `task-overlay.ts` + `task-detail.ts` |
| `Checklist` | `items: { text, done? }[], onToggle?: (i) => void` | `task-detail.ts` «Подзадачи» |
| `JamoAssistant` | `greeting?, lead?, mood?, faceSize?, messages?, starters?, starterOn?, typed?, mic?` | `chats-panel-assistant.ts` |
| `JamoMic` | `active?, clock?, level?: 0–1, connecting?, onClick?` | `assistant/jamo/voice/jamo-mic.ts` |
| `EffectCard` | `card: { kind?, code?, badge, title, meta?, undone?, onUndo?, onOpen? }` | `assistant/jamo/effect-card.ts` |
| `Toast` | `children, action?, onAction?` | `calls/call-float.css` `.toast` |
| `CallStage` | `title, context?, clock?, tiles, cols?, panel?, controls?, avatar?` | `call-room.*`, `call-stage.css` |
| `CallTile`, `CallControls` | `tile: { person, speaking?, muted?, you?, chip? }` / `people?, mic?, camera?, chat?` | `call-stage.css`, `call-control.ts` |
| `Icon`, `Logo`, `RailGlyph` | `name, size?, stroke?` | the app's inline SVGs |
| `Scaled` | `width?, height?, children` | ours: fits a fixed-size window into a box |

## Known gaps

- **Project colours:** in the app a project's hue comes from its UUID. Here it comes from `id ?? name`,
  so give each project an `id` and pick it for the colour you want.
- **Avatar pictures:** real photos are not available. `photo: true` draws a gradient close to the
  seeded Dev One picture.
- **Glass:** backdrop blur renders only where something sits behind the element. A window on a flat
  page shows its gradient instead, as the app does on its own canvas.
- **Calendar:** there is no month view, and the Google connector banner is not drawn.
- **Jamo AI's row:** the app draws a dark «AI» square. Here the row has Jamo's own face, looking about,
  thinking and ticking, with the green online dot, so the assistant stands out in a still shot.
