import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const vid = process.env.VID || '/tmp/patchwork-video';
const base = JSON.parse(readFileSync(`${here}/composition.ios-preview.json`));
const shot = (platform, name) => `${root}/public/reel/patchwork-${platform}-${name}.png`;
const recording = (name, end, start = 0) => ({ raw: `${here}/recordings/${name}.mp4`, a: start, b: end });
const pair = (state, tracks = {}) => ({
  dual: true,
  phones: ['ios', 'android'].map(platform => ({
    platform: `Native ${platform === 'ios' ? 'iOS' : 'Android'}`,
    state,
    still: shot(platform, state),
    ...tracks[platform],
  })),
});
const chapters = ['', 'Tasks and search', 'One task, up close', 'Jira boards', 'Themes and AI'];
const scene = (id, n, state, title, body, points, extra = {}) => ({
  id, type: 'phone', n, dur: 9, title, body, points,
  showPlatform: false,
  note: '',
  kicker: n ? `0${n} · ${chapters[n]}` : 'Patchwork',
  ...pair(state),
  ...extra,
});

const comp = {
  ...base,
  name: 'patchwork-native-demo',
  out: `${root}/public/reel/patchwork-native-demo.mp4`,
  poster: `${root}/public/reel/patchwork-native-poster.jpg`,
  posterAt: 3.2,
  product: { ...base.product, icon: '/Users/taf/Projects/Patchwork/app/assets/images/icon.png' },
  scenes: [
    {
      id: 'opening', type: 'opening', dur: 4.8,
      title: 'Every task list you have, in one app.',
      body: 'CalDAV tasks, Deck cards, Jira boards and GitHub issues.',
    },
    scene('intro', null, 'tasks', 'Stop checking <em>four apps.</em>',
      'Patchwork signs in to CalDAV, Nextcloud Deck, Jira and GitHub, then edits your work where it already lives.',
      ['The phone talks to your servers directly', 'Passwords and API keys stay in secure storage'],
      { showPlatform: true, kicker: 'Patchwork · iOS + Android' }),
    scene('tasks', 1, 'tasks', 'Start with <em>today.</em>',
      'Every list lands in one view, split into Today, Tomorrow and Upcoming.',
      ['Tag chips filter the list in one tap', 'Each row shows its due date and its list']),
    scene('search', 1, 'search', 'One search across <em>tasks and cards.</em>',
      'Searching release finds six matches. Two are tasks and four are Deck cards.',
      ['Chips narrow the results to tasks or cards', 'Each card names its board and column']),
    scene('detail', 2, 'detail', 'Open a task <em>inside the list.</em>',
      'Tap a row and it expands in place to show its Markdown notes and checklist.',
      ['Tag, due date and list sit under the notes', 'Move it, delete it or open the full editor'], {
        ...pair('detail', {
          ios: { src: recording('ios-detail', 5.8, 2), timeline: [[0,0],[2,.5],[2.15,.6],[2.8,1.2],[4,1.8],[6,3.6],[9,3.6]] },
          android: { src: recording('android-detail', 4.5), timeline: [[0,0],[2,.5],[2.15,.65],[2.8,1.2],[4,2.6],[6,4],[9,4]] },
        }),
        events: [{ at: 2, state: 'Open release checklist' }, { at: 4, state: 'Release details visible' }],
      }),
    scene('priority', 2, 'editor', 'Edit the <em>whole task.</em>',
      'The full editor adds priority, deadline and reminder. Here the release task drops from High to Medium.',
      ['Edits save back to your CalDAV server', 'ETags stop two devices overwriting each other'], {
        ...pair('editor', {
          ios: { src: recording('ios-edit', 6.6), timeline: [[0,0],[2,1.7],[2.5,2.2],[3,2.6],[4,3.6],[6,5.6],[9,5.6]] },
          android: { src: recording('android-priority', 4.5), timeline: [[0,0],[2,1.1],[2.5,1.5],[3,1.8],[4,2.8],[6,4],[9,4]] },
        }),
        events: [{ at: 3, state: 'Medium priority selected' }],
      }),
    scene('board', 3, 'jira-board', 'Your Jira board, <em>sprints included.</em>',
      'Columns scroll sideways. Each card carries its issue key, priority and assignee.',
      ['Sprint chips show the days left', 'Backlog issues sit under the active sprint']),
    scene('filter', 3, 'jira-filter', 'Show only <em>your issues.</em>',
      'The filter sheet cuts a board down to issues assigned to you, reported by you, or both.',
      ['Sprint, type and priority filters stack on top', 'The board subtitle names the active scope'], {
        ...pair('jira-filter', {
          ios: { src: recording('ios-jira-filter', 5), timeline: [[0,0],[2,1.6],[2.5,2.2],[3,2.5],[4.2,2.6],[4.7,3.3],[6,4.5],[9,4.5]] },
          android: { src: recording('android-jira-filter', 5.67), timeline: [[0,.4],[2,.8],[2.5,1.2],[3,1.5],[4.2,4],[4.7,4.7],[6,5.4],[9,5.4]] },
        }),
        events: [{ at: 3, state: 'Assigned or reported selected' }, { at: 4.7, state: 'Filtered board visible' }],
      }),
    scene('focused-board', 3, 'jira-assigned', 'Six issues become <em>three.</em>',
      'With Assigned or reported on, To do keeps only your issues, still split by sprint and backlog.',
      ['PATCH-266 and PATCH-267 in Sprint 14', 'PATCH-270 waiting in the backlog']),
    scene('drag', 3, 'jira-drag', 'Hold a card and <em>move it.</em>',
      'A long press lifts PATCH-267. A line shows where the card will land.',
      ['Dropping it updates the rank in Jira', 'Deck cards drag the same way'], {
        ...pair('jira-drag', {
          ios: { src: recording('ios-jira-drag', 4.6), timeline: [[0,0],[1.8,1.7],[2.3,2.15],[3.3,2.8],[4.5,3.7],[6,4.3],[9,4.3]] },
          android: { src: recording('android-jira-drag', 8), timeline: [[0,0],[1.8,.9],[2.3,1.7],[3.3,4.8],[4.5,6.5],[6,7.4],[9,7.4]] },
        }),
        events: [{ at: 2.3, state: 'Drag marker visible' }, { at: 4.5, state: 'PATCH-267 lifted to the same row' }],
      }),
    scene('appearance', 4, 'appearance', 'Choose the theme <em>and the accent.</em>',
      'iOS takes a custom accent. Android pulls Material You colours from your wallpaper, or a fixed palette.',
      ['System, light and dark themes', 'High contrast and pure black OLED modes'], {
        note: '',
        ...pair('appearance', {
          ios: { src: recording('ios-appearance', 4), timeline: [[0,0],[2,1.6],[2.6,2.2],[3,2.6],[4.5,3.9],[9,3.9]] },
          android: { src: recording('android-appearance', 4.8), timeline: [[0,0],[2,1.6],[2.6,2.05],[3,2.5],[4.5,4.5],[9,4.5]] },
        }),
        events: [{ at: 3, state: 'Light mode on both phones' }],
      }),
    scene('ai', 4, 'ai', 'Bring your <em>own model.</em>',
      'AI import drafts tasks from a photo of your notes or a typed prompt. Nothing saves until you review it.',
      ['OpenAI, Anthropic, Google or OpenRouter', 'Your key stays on the phone']),
    {
      id: 'close', type: 'close', dur: 6.5,
      title: 'Install it. <em>Add your accounts.</em>',
      body: 'Your lists and boards show up as they are. Nothing to import.',
      url: 'github.com/tashifkhan/Patchwork',
      phones: [
        { still: shot('ios', 'tasks') },
        { still: shot('android', 'jira-board') },
      ],
      facts: [
        { k: 'Android', v: 'F-Droid repo or APK' },
        { k: 'iOS', v: 'Build from source' },
        { k: 'Connects to', v: 'CalDAV, Deck, Jira, GitHub' },
      ],
      by: 'taf.sh',
    },
  ],
};

for (const sc of comp.scenes) {
  if (sc.type !== 'phone') continue;
  if (sc.phones.length !== 2 || sc.phones.some(p => p.state !== sc.phones[0].state)) throw Error(`Unmatched states in ${sc.id}`);
  const animated = sc.phones.filter(p => p.src);
  if (animated.length && animated.length !== 2) throw Error(`Only one phone moves in ${sc.id}`);
  for (const p of animated) {
    if (p.timeline.at(-1)[0] !== sc.dur) throw Error(`Timeline does not cover ${sc.id}`);
    for (let i = 1; i < p.timeline.length; i++) {
      if (p.timeline[i][0] <= p.timeline[i-1][0] || p.timeline[i][1] < p.timeline[i-1][1]) throw Error(`Invalid timeline in ${sc.id}`);
    }
  }
}
mkdirSync(`${vid}/comp`, { recursive: true });
writeFileSync(`${vid}/comp/${comp.name}.json`, JSON.stringify(comp, null, 2));
writeFileSync(`${here}/composition.combined.json`, JSON.stringify(comp, null, 2));
console.log(`${comp.scenes.length} matched scene pairs, ${comp.scenes.filter(s => s.events).length} synchronized interactions.`);
