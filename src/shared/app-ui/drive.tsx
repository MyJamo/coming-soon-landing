// The drive (features/drive/drive.html, drive.css): the library sidebar, the top bar, «Мои файлы»
// with the upload button, and the file table with its glass icon tiles.
import { Icon } from './icons';
import { useJuiText } from './locale';
import { Avatar, Button, type Person } from './primitives';

export type FileKind = 'folder' | 'file' | 'picture';
export type DriveRowData = { kind: FileKind; name: string; owner: Person; date: string; size?: string; selected?: boolean };

export function FileIcon({ kind }: { kind: FileKind }) {
  return <span className={'jui-file-icon' + (kind === 'file' ? '' : ' ' + kind)}><Icon name={kind === 'folder' ? 'folder' : kind === 'picture' ? 'picture' : 'document'} size={20} stroke={1.7} /></span>;
}

export function FileRow({ row }: { row: DriveRowData }) {
  return (
    <div className={'jui-drive-row' + (row.selected ? ' on' : '')}>
      <span className="jui-drive-name"><FileIcon kind={row.kind} /><span>{row.name}</span></span>
      <span className="jui-drive-muted jui-user"><Avatar person={row.owner} size={22} />{row.owner.name}</span>
      <span className="jui-drive-muted">{row.date}</span>
      <span className="jui-drive-muted jui-drive-size">{row.kind === 'folder' ? null : row.size}</span>
      <span className="jui-drive-more"><Icon name="dots" size={18} stroke={2.4} /></span>
    </div>
  );
}

export function DriveTable({ rows }: { rows: DriveRowData[] }) {
  const t = useJuiText().drive;
  return (
    <div>
      <div className="jui-drive-heading"><span>{t.name}</span><span>{t.uploadedBy}</span><span>{t.date}</span><span>{t.size}</span><span /></div>
      {rows.map((r) => <FileRow key={r.name} row={r} />)}
    </div>
  );
}

/** The drive page. `side` false drops the library column (for a narrow mockup). */
export function DrivePage({ title: titleProp, lead, rows, projects = [], side = true }: { title?: string; lead?: string; rows: DriveRowData[]; projects?: string[]; side?: boolean }) {
  const t = useJuiText().drive;
  const title = titleProp ?? t.myFiles;
  return (
    <div className="jui-drive">
      {side && (
        <nav className="jui-drive-side">
          <span className="jui-drive-switch"><span>{t.pages}</span><span className="on">{t.files}</span></span>
          <span className="jui-drive-disk"><i><Icon name="drive" size={18} /></i>{t.disk}<Icon name="plus" size={18} className="jui-drive-add" /></span>
          <span className="jui-drive-lbl">{t.library}</span>
          <span className="jui-drive-item on"><Icon name="drive" size={18} />{t.myFiles}</span>
          <span className="jui-drive-item"><Icon name="upload" size={18} />{t.shared}</span>
          {projects.length > 0 && <span className="jui-drive-lbl">{t.projects}</span>}
          {projects.map((p) => <span key={p} className="jui-drive-item"><Icon name="folder" size={18} />{p}</span>)}
        </nav>
      )}
      <div className="jui-drive-content">
        <div className="jui-drive-top"><Icon name="board" size={18} />{title}</div>
        <div className="jui-drive-body">
          <div className="jui-drive-header">
            <div><h1>{title}</h1><p>{lead ?? t.lead}</p></div>
            <Button variant="glass" icon="upload">{t.upload}</Button>
          </div>
          <div className="jui-drive-toolbar">
            <span>{t.items(rows.length)}</span>
            <span className="jui-view-switch"><span className="on"><Icon name="subtasks" size={15} /></span><span><Icon name="grid" size={15} /></span></span>
          </div>
          <DriveTable rows={rows} />
        </div>
      </div>
    </div>
  );
}
