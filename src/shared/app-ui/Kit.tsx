// #/kit: every piece of the kit, and four whole windows drawn at the app's own 1440×960, to hold
// beside screenshots of the live app (board, chat, calendar, drive).
import type { ReactNode } from 'react';
import {
  AppWindow, Avatar, Board, BoardToolbar, Button, CalendarPage, CallRecord, CallStage, ChatsButton, ChatsPanel, Conversation, ConversationHeader, DayDivider,
  DrivePage, EffectCard, FileChip, HomeHeader, JamoAssistant, JamoMic, JuiRoot, MessageBubble, PriorityFlag, ProjectHeader, SearchBox, StatusBadge,
  StatusPill, TaskCard, TaskChip, TaskDetail, TaskListTable, Toast, TypeChip, type Person, type TaskCardData,
} from '.';

const DEV: Person = { name: 'Dev One', photo: true };
const DR: Person = { name: 'Дилноза Рахимова' };
const AK: Person = { name: 'Алишер Каримов' };
const BT: Person = { name: 'Бобур Тошев' };
const JA: Person = { name: 'Жасур Абдуллаев' };
const ACME = { name: 'Сайт Acme', id: 'acme' };

const CARDS: TaskCardData[] = [
  { title: 'Ревью пул-реквеста по навигации', code: 'ACM-11', people: [DR], type: 'story' },
  { title: 'Testing animation #1', code: 'ACM-22', people: [DEV], type: 'task' },
  { title: 'Починить прокрутку на мобильных', code: 'ACM-19', priority: 'urgent', people: [DR], type: 'feature', comments: 1 },
  { title: 'Исправить баг с датами в календаре', code: 'ACM-13', priority: 'high', due: '17.09.2026', overdue: true, type: 'bug' },
];

function Section({ title, children, pad = true }: { title: string; children: ReactNode; pad?: boolean }) {
  return (
    <section data-kit style={{ marginBottom: 48 }}>
      <h2 style={{ font: '500 13px/1 ui-monospace, monospace', letterSpacing: '.06em', textTransform: 'uppercase', color: '#6f6b62', margin: '0 0 14px', padding: pad ? '0 32px' : 0 }}>{title}</h2>
      {children}
    </section>
  );
}

export function Kit() {
  return (
    // Windows stay at the app's native 1440px for side-by-side checks; narrower screens scroll the page sideways inside this box.
    <div style={{ background: '#f3f1ec', minHeight: '100vh', overflowX: 'auto' }}>
    <div style={{ padding: '32px 0', minWidth: 1440 }}>
      <Section title="board · AppWindow + ProjectHeader + BoardToolbar + Board + ChatsPanel (cf. app/board.png)" pad>
        <AppWindow rail="boards" main={<>
          <ProjectHeader project={ACME} members={6} openTasks={7} chatsActive unread={0} />
          <BoardToolbar />
          <Board columns={[
            { status: 'todo', tasks: [CARDS[0]] },
            { status: 'progress', tasks: [] },
            { status: 'review', tasks: CARDS.slice(1) },
            { status: { name: 'PreProd', color: '#d58400' }, tasks: [] },
          ]} />
        </>} side={<ChatsPanel tabs={['Все', 'Сайт Acme', 'Бренд 2026']} tab={1} sections={[
          { title: 'Каналы', rows: [{ kind: 'channel', name: '# Общее', preview: 'Вы: Звонок', time: '05.10' }] },
          { title: 'Комнаты встреч', rows: [{ kind: 'room', name: 'General', preview: 'Пока никого' }] },
        ]} />} />
      </Section>

      <Section title="chat · ChatsPanel expanded + Conversation (cf. app/chat-dm.png)">
        <AppWindow rail="chats" bare main={
          <ChatsPanel expanded flat style={{ height: '100%' }} tabs={['Все', 'Сайт Acme', 'Бренд 2026']} rows={[
            { kind: 'assistant' },
            { kind: 'project', name: 'Сайт Acme', id: 'acme', preview: 'Вы: Звонок', time: '05.10' },
            { kind: 'direct', person: AK, preview: 'Вы: Звонок', time: '05.10', selected: true },
            { kind: 'direct', person: BT, preview: 'Вы: Звонок', time: '18.09' },
            { kind: 'direct', person: DR, preview: 'Вы: Heello', time: '05.09' },
            { kind: 'project', name: 'Бренд 2026', id: 'brand-2026', preview: '', time: '05.09' },
          ]} conversation={
            <Conversation expanded who={{ kind: 'direct', person: AK }}>
              <MessageBubble text="Меняем" time="15:16" />
              <MessageBubble text="На Inter, как в брендбуке" time="15:16" tail />
              <MessageBubble mine time="" attach={<span className="jui-bubble" style={{ background: 'var(--color-primary-soft)' }}><CallRecord label="Исходящий звонок" detail="Звонок · 0:02" time="21:07" /></span>} />
              <MessageBubble mine time="" attach={<span className="jui-bubble" style={{ background: 'var(--color-primary-soft)' }}><CallRecord label="Звонок отклонён" detail="Звонок" time="21:07" failed /></span>} />
              <DayDivider>10 сентября</DayDivider>
              <MessageBubble mine text="Поставил задачу, глянь" time="01:25" read attach={<TaskChip chip={{ code: 'ACM-19', title: 'Починить прокрутку на мобильных', trailing: 'На проверке', color: '#ff8447' }} />} />
              <MessageBubble text="Хорошо, после обеда" time="01:27" tail attach={<FileChip name="Макет «Чаты».fig" size="2.4 MB" />} />
            </Conversation>
          } />
        } />
      </Section>

      <Section title="calendar · CalendarPage week (cf. app/calendar-week.png)">
        <AppWindow rail="calendar" main={
          <CalendarPage period="12 – 18 октября" legend={[{ name: 'Личный', tone: 'personal' }, { name: 'Сайт Acme', tone: 'purple' }, { name: 'Бренд 2026', tone: 'green' }, { name: 'Сроки задач', tone: '', icon: 'tasks' }]}
            days={[{ wd: 'Пн', num: 12 }, { wd: 'Вт', num: 13 }, { wd: 'Ср', num: 14 }, { wd: 'Чт', num: 15 }, { wd: 'Пт', num: 16 }, { wd: 'Сб', num: 17 }, { wd: 'Вс', num: 18, today: true }]}
            events={[
              { day: 3, start: 9, end: 9.5, title: 'test event', tone: 'personal' },
              { day: 0, start: 10, end: 10.25, title: 'Ежедневный стендап', tone: 'purple' },
              { day: 1, start: 11, end: 12, title: 'Синк по дизайну', tone: 'green' },
              { day: 2, start: 14, end: 15, title: 'Ревью API', tone: 'purple', found: true },
              { day: 4, start: 15, end: 16.5, title: 'Демо', tone: 'orange' },
            ]} now={{ day: 6, at: 13.5 }} />
        } />
      </Section>

      <Section title="drive · DrivePage (cf. app/drive.png)">
        <AppWindow rail="library" main={<DrivePage projects={['Сайт Acme', 'Бренд 2026']} rows={[
          { kind: 'folder', name: 'Design review', owner: DEV, date: '07.09.2026' },
          { kind: 'file', name: 'Бриф релиза 2.4.pdf', owner: DEV, date: '10.09.2026', size: '635.3 KB' },
          { kind: 'picture', name: 'Обложка.png', owner: DR, date: '12.09.2026', size: '1.2 MB' },
        ]} />} />
      </Section>

      <Section title="home · HomeHeader + compact Board (cf. app/home.png)">
        <AppWindow rail="home" bare main={<div style={{ padding: '24px 20px' }}>
          <HomeHeader open={3} today={0} overdue={1} />
          <Board compact columns={[
            { status: 'todo', tasks: [] },
            { status: 'progress', tasks: [] },
            { status: 'review', tasks: [
              { title: 'Добавить тёмную тему', code: 'ACM-1', priority: 'low', people: [DEV], type: 'task', project: ACME, subtasks: [1, 3] },
              { title: 'Настроить кэширование API', code: 'ACM-5', due: '17.09.2026', overdue: true, people: [DEV], type: 'feature', project: ACME, subtasks: [3, 3] },
            ] },
            { status: 'done', tasks: [] },
          ]} />
        </div>} />
      </Section>

      <Section title="task list · ProjectHeader tab=tasks + TaskListTable (cf. app/tasks.png)">
        <AppWindow rail="boards" height={720} main={<>
          <ProjectHeader project={ACME} members={6} tab="tasks" openTasks={7} />
          <div style={{ padding: 24 }}>
            <TaskListTable rows={[
              { code: 'ACM-22', title: 'Testing animation #1', type: 'task', status: 'review', priority: 'normal', assignee: DEV },
              { code: 'ACM-19', title: 'Починить прокрутку на мобильных', type: 'feature', status: 'review', priority: 'urgent', assignee: DR },
              { code: 'ACM-16', title: 'Собрать макет главной страницы', subtasks: '0/1', type: 'feature', status: 'done', priority: 'high', due: '19.09.2026' },
              { code: 'ACM-15', title: 'Настроить CI для фронтенда', type: 'task', status: 'done', priority: 'low', assignee: JA, due: '21.09.2026' },
              { code: 'ACM-13', title: 'Исправить баг с датами в календаре', type: 'bug', status: 'review', priority: 'high', due: '17.09.2026', overdue: true },
            ]} />
          </div>
        </>} />
      </Section>

      <Section title="task detail · TaskDetail (cf. app/task-detail.png)">
        <div style={{ padding: '0 32px' }}>
          <JuiRoot style={{ background: 'var(--gradient-bg)', padding: 40, borderRadius: 24 }}>
            <TaskDetail style={{ height: 640 }} title="Testing animation #1" code="ACM-22" date="06.09.2026" creator={DEV} assignees={[DEV]} status="review"
              checklist={[{ text: 'Сценарий анимации', done: true }, { text: 'Проверить на Safari' }]} comments={[{ person: DR, time: '10:12', text: 'Сделала превью, глянь' }]} />
          </JuiRoot>
        </div>
      </Section>

      <Section title="Jamo AI · JamoAssistant + EffectCard + Toast (cf. app/chat-jamo.png)">
        <div style={{ display: 'flex', gap: 24, padding: '0 32px' }}>
          <JuiRoot style={{ width: 400, height: 640, display: 'flex' }}>
            <div className="jui-chats" style={{ flexDirection: 'column' }}>
              <ConversationHeader who={{ kind: 'assistant' }} />
              <JamoAssistant greeting="Добрый день, Dev!" mic />
            </div>
          </JuiRoot>
          <JuiRoot style={{ width: 400, height: 640, display: 'flex' }}>
            <div className="jui-chats" style={{ flexDirection: 'column' }}>
              <ConversationHeader who={{ kind: 'assistant' }} />
              <JamoAssistant starters={[]} messages={[
                { text: 'Aziz должен обновить лендинг до запуска во вторник', mine: true },
                { text: 'Готово. Задача для Aziz, срок — вторник, в колонке «Сделать».' },
                { effect: { code: 'ACM-24', badge: 'Создана', title: 'Обновить лендинг к запуску', meta: 'Сделать · Срок 11 авг · Aziz' } },
              ]} />
            </div>
          </JuiRoot>
          <JuiRoot style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
            <EffectCard card={{ kind: 'event', badge: 'Чт 11:00', title: 'Дизайн-ревью', meta: '4 участника · видеокомната' }} />
            <EffectCard card={{ code: 'ACM-24', badge: 'Создана', title: 'Обновить лендинг к запуску', undone: true }} />
            <Toast action="Отменить">Задача создана</Toast>
            <JamoMic /><JamoMic active clock="00:07" level={0.5} />
          </JuiRoot>
        </div>
      </Section>

      <Section title="call · CallStage">
        <div style={{ padding: '0 32px' }}>
          <JuiRoot style={{ background: 'var(--gradient-bg)', padding: 16, height: 620, display: 'flex', borderRadius: 24 }}>
            <CallStage title="Синк по дизайну" context="Acme Studio · # Сайт Acme" tiles={[
              { person: DR, speaking: true }, { person: AK, muted: true }, { person: BT }, { person: DEV, you: true },
            ]} />
          </JuiRoot>
        </div>
      </Section>

      <Section title="primitives">
        <JuiRoot style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', padding: '24px 32px', background: 'var(--gradient-bg)' }}>
          <Avatar person={DR} /><Avatar person={AK} size={40} presence="online" /><Avatar person={DEV} size={40} />
          <PriorityFlag priority="normal" /><PriorityFlag priority="high" /><PriorityFlag priority="urgent" label />
          <TypeChip type="task" /><TypeChip type="feature" /><TypeChip type="bug" /><TypeChip type="story" /><TypeChip type="epic" />
          <StatusPill status="done" /><StatusPill status="review" /><StatusPill status="cancelled" /><StatusBadge status="review" />
          <Button variant="primary" icon="plus">Задача</Button><Button variant="soft" icon="plus">Добавить участника</Button><Button variant="ghost" icon="filter">Фильтр</Button><Button variant="glass" icon="upload">Загрузить</Button>
          <ChatsButton /><ChatsButton active unread={3} /><SearchBox />
          <div style={{ width: 280 }}><TaskCard task={CARDS[3]} /></div>
          <div style={{ width: 280 }}><TaskCard task={{ ...CARDS[2], people: [DR, AK, BT, JA, DEV] }} highlight /></div>
          <div style={{ width: 280 }}><TaskCard task={CARDS[1]} lifted /></div>
          <TaskChip chip={{ code: 'ACM-19', title: 'Починить прокрутку', trailing: '12 авг', tint: 'ahead' }} />
          <TaskChip chip={{ code: 'ACM-13', title: 'Исправить баг с датами', trailing: 'сегодня', tint: 'due' }} />
          <span className="jui-bubble"><CallRecord label="Входящий звонок" detail="Звонок · 4:12" time="11:02" incoming /></span>
        </JuiRoot>
      </Section>
    </div>
    </div>
  );
}
