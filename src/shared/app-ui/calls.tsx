// A call (features/calls/call-room.*, call-stage.*, call-control.ts): the green clock, the title,
// soft tiles per face with the speaker ringed coral, and the labelled controls with «Выйти».
import type { CSSProperties } from 'react';
import { hueOf } from './catalog';
import { Icon } from './icons';
import { useJuiText } from './locale';
import { Avatar, type Person } from './primitives';

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export type CallTileData = { person: Person; speaking?: boolean; muted?: boolean; you?: boolean; chip?: string };

export function CallTile({ tile, avatar = 96 }: { tile: CallTileData; avatar?: number }) {
  const t = useJuiText().calls;
  return (
    <div className={'jui-tile' + (tile.speaking ? ' speaking' : '')} style={{ '--hue': hueOf(tile.person.id ?? tile.person.name) } as Vars}>
      <Avatar person={tile.person} size={avatar} />
      {tile.chip && <span className="jui-tile-chip">{tile.chip}</span>}
      <span className="jui-tile-tag">
        {tile.speaking && <Icon name="bars" className="jui-tile-bars" size={14} stroke={2} />}
        {tile.muted && <Icon name="micOff" className="jui-tile-muted" size={13} />}
        <span>{tile.you ? t.you : tile.person.name}</span>
      </span>
    </div>
  );
}

export function CallControls({ people, mic = true, camera = true, chat = true }: { people?: number; mic?: boolean; camera?: boolean; chat?: boolean }) {
  const t = useJuiText().calls;
  return (
    <footer className="jui-controls">
      <span className={'jui-control' + (mic ? '' : ' off')}><span className="jui-control-face"><Icon name={mic ? 'mic' : 'micOff'} size={22} stroke={1.7} /></span><span className="jui-control-label">{t.mic}</span></span>
      <span className={'jui-control' + (camera ? '' : ' off')}><span className="jui-control-face"><Icon name="video" size={22} stroke={1.7} /></span><span className="jui-control-label">{t.camera}</span></span>
      <span className="jui-control"><span className="jui-control-face"><Icon name="screen" size={22} stroke={1.7} /></span><span className="jui-control-label">{t.screen}</span></span>
      <span className="jui-control-divider" />
      <span className="jui-control"><span className="jui-control-face"><Icon name="people" size={22} stroke={1.7} />{people ? <span className="jui-control-badge">{people}</span> : null}</span><span className="jui-control-label">{t.participants}</span></span>
      {chat && <span className="jui-control"><span className="jui-control-face"><Icon name="room" size={22} stroke={1.7} /></span><span className="jui-control-label">{t.chat}</span></span>}
      <span className="jui-control"><span className="jui-control-face"><Icon name="dots" size={22} stroke={2.4} /></span><span className="jui-control-label">{t.more}</span></span>
      <span style={{ width: 24 }} />
      <span className="jui-leave"><Icon name="leave" size={22} stroke={1.7} />{t.leave}</span>
    </footer>
  );
}

/** The call page's main card. `cols` sets the grid; tiles beyond it wrap into rows. */
export function CallStage({ title, context, clock = '00:12', tiles, cols = 2, panel = true, controls = true, avatar }: {
  title: string;
  context?: string;
  clock?: string;
  tiles: CallTileData[];
  cols?: number;
  panel?: boolean;
  controls?: boolean;
  avatar?: number;
}) {
  return (
    <div className={'jui-call' + (panel ? ' panel' : '')}>
      <header className="jui-call-top">
        <span className="jui-clock">{clock}</span>
        <div className="jui-call-ident"><div className="jui-call-title">{title}</div>{context && <div className="jui-call-context">{context}</div>}</div>
      </header>
      <div className="jui-call-grid" style={{ '--cols': cols } as Vars}>{tiles.map((t) => <CallTile key={t.person.name} tile={t} avatar={avatar} />)}</div>
      {controls && <CallControls people={tiles.length} />}
    </div>
  );
}
