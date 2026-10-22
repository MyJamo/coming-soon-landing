// Jamo AI in the chats panel (features/chats/chats-panel-assistant.ts): the face and greeting,
// the conversation, the starters, the input and the disclaimer; the microphone in its composer
// (assistant/jamo/voice/jamo-mic.ts); the card an action leaves with its «Отменить»
// (features/assistant/jamo/effect-card.ts); and the dark toast (calls/call-float.css).
import type { ReactNode } from 'react';
import { JamoFace, type Mood } from '../../JamoFace';
import { Icon } from './icons';
import { useJuiText } from './locale';

export type AiMessage = { text: ReactNode; mine?: boolean } | { effect: EffectCardData };

export function JamoAssistant({ greeting, lead, mood = 'idle', faceSize = 112, messages, starters, starterOn, typed, placeholder, disclaimer, track, mic }: {
  greeting?: string;
  lead?: string;
  mood?: Mood;
  faceSize?: number;
  /** With messages the intro gives way to the conversation, as in the app. */
  messages?: AiMessage[];
  starters?: string[];
  starterOn?: number;
  typed?: string;
  placeholder?: string;
  disclaimer?: string;
  track?: boolean;
  /** Voice is available: an empty composer shows the microphone instead of «Отправить», as the app does. */
  mic?: boolean | JamoMicState;
}) {
  const t = useJuiText().assistant;
  const chips = starters ?? t.starters;
  return (
    <div className="jui-ai">
      <div className="jui-ai-scroll">
        {messages?.length ? (
          <>
            <div style={{ flex: 1 }} />
            {messages.map((m, i) => 'effect' in m
              ? <EffectCard key={i} card={m.effect} />
              : <p key={i} className={'jui-ai-msg' + (m.mine ? ' mine' : '')}>{m.text}</p>)}
          </>
        ) : (
          <div className="jui-ai-intro">
            <span className="jui-ai-face"><JamoFace mood={mood} size={faceSize} track={track} /></span>
            <h3>{greeting ?? t.greeting}</h3>
            <p>{lead ?? t.lead}</p>
          </div>
        )}
      </div>
      {chips.length > 0 && <div className="jui-ai-starters">{chips.map((s, i) => <span key={s} className={i === starterOn ? 'on' : ''}>{s}</span>)}</div>}
      <div className="jui-ai-composer">
        <span className={typed ? 'typed' : ''}>{typed || (placeholder ?? t.placeholder)}</span>
        {mic && !typed ? <JamoMic {...(mic === true ? {} : mic)} /> : <i><Icon name="send" size={16} stroke={1.8} /></i>}
      </div>
      <p className="jui-ai-disclaimer">{disclaimer ?? t.disclaimer}</p>
    </div>
  );
}

export type JamoMicState = { active?: boolean; clock?: string; level?: number; connecting?: boolean };

/** Idle, a microphone; in a session, a coral «stop» pill with the time and a ring that breathes with the level (0–1). The gear follows. */
export function JamoMic({ active, clock = '00:00', level = 0, connecting, onClick }: JamoMicState & { onClick?: () => void }) {
  const t = useJuiText().assistant;
  return (
    <span className="jui-mic">
      {active ? (
        <button type="button" className="jui-mic-stop" onClick={onClick} aria-label={t.micStop}>
          <span className="jui-mic-ring" style={{ transform: `scale(${1 + level * 0.35})` }} />
          <span className="jui-mic-dot" />
          <span className="jui-mic-time">{connecting ? t.connecting : clock}</span>
        </button>
      ) : (
        <button type="button" className="jui-mic-btn" onClick={onClick} aria-label={t.micStart} title={t.micStart}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
        </button>
      )}
      <span className="jui-mic-btn gear" aria-hidden="true">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>
      </span>
    </span>
  );
}

export type EffectCardData = {
  kind?: 'task' | 'event';
  code?: string;
  /** «Создана», «→ В прогрессе», «Срок 12 авг», … */
  badge: string;
  title: string;
  meta?: string;
  undone?: boolean;
  onUndo?: () => void;
  onOpen?: () => void;
};

export function EffectCard({ card }: { card: EffectCardData }) {
  const t = useJuiText().assistant;
  return (
    <div className={'jui-effect' + (card.undone ? ' undone' : '')}>
      <div className="jui-effect-label">
        <span className="jui-mono">{card.kind === 'event' ? t.meetingKind : t.taskKind}</span>
        {card.code && <span className="jui-mono code">{card.code}</span>}
        <span className={'jui-effect-badge' + (card.undone ? ' off' : '')}>{card.undone ? t.undone : card.badge}</span>
      </div>
      <p className="jui-effect-title">{card.title}</p>
      {card.meta && <p className="jui-effect-meta">{card.meta}</p>}
      <div className="jui-effect-actions">
        <button type="button" onClick={card.onOpen}>{t.open}</button>
        {!card.undone && <button type="button" onClick={card.onUndo}>{t.undo}</button>}
      </div>
    </div>
  );
}

export function Toast({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) {
  return <div className="jui-toast" role="status">{children}{action && <button type="button" onClick={onAction}>{action}</button>}</div>;
}
