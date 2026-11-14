"""Local, synthetic CalDAV and Deck data for filming the real native clients.

No upstream requests, real accounts, credentials, or customer data.
Run with `python3 demo-server.py`. Android uses an adb reverse for port 5232.
"""
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from html import escape
import json
import re
import base64

NOW = datetime.now(timezone.utc).replace(hour=12, minute=0, second=0, microsecond=0)
SAMPLES = [
    ("work", "Plan the Patchwork release", 0, "release", "## Before we ship\n\n- [ ] Review the iOS build\n- [ ] Check the Android layout\n- [ ] Write the release notes\n\nKeep the two phone experiences consistent.", 1),
    ("personal", "Pick up groceries", 0, "home", "Coffee, oat milk, tomatoes and pasta.", 0),
    ("work", "Review the onboarding flow", 0, "design", "Check the first-run copy on both phones.", 0),
    ("personal", "Book a dentist appointment", 1, "admin", "Call after lunch.", 0),
    ("work", "Test offline task edits", 1, "testing", "Make an edit offline, then reconnect and check the outbox.", 0),
    ("work", "Write the CalDAV setup guide", 3, "docs", "Explain app passwords and choosing a server.", 0),
    ("personal", "Plan the weekend walk", 4, "weekend", "A short route near home.", 0),
    ("work", "Polish the board card layout", 5, "design", "Check title wrapping and column spacing.", 0),
    ("work", "Publish release notes", 7, "release", "Include the iOS and Android builds.", 0),
]
TASKS = {}
for i, (slug, title, offset, tag, notes, priority) in enumerate(SAMPLES):
    due = NOW + timedelta(days=offset)
    uid = f"video-sample-{i+1}"
    TASKS[uid] = dict(id=uid, uid=uid, list_id=slug, list_name=slug.title(), title=title,
                     description=notes, markdown=notes, completed=False, tags=[tag],
                     due_at=due.isoformat(), priority=priority or None, children=[],
                     parent_uid=None, etag='"1"', updated_at=NOW.isoformat())

BOARDS = [dict(id=1, title="Release plan", color="FF887E", archived=False, deletedAt=0),
          dict(id=2, title="Ideas for later", color="9D8AC7", archived=False, deletedAt=0)]
STACKS = [
    dict(id=11, title="To do", order=0, cards=[
        dict(id=101, title="Write the setup guide", description="Document CalDAV and app passwords.", order=0, stackId=11, labels=[dict(id=1,title="Docs",color="8AACE1")]),
        dict(id=102, title="Check both phone layouts", description="Review native iOS and Android screens.", order=1, stackId=11, labels=[dict(id=2,title="Design",color="D3A4DB")])]),
    dict(id=12, title="In progress", order=1, cards=[
        dict(id=103,title="Prepare the release",description="## Release checklist\n\n- [x] Confirm task sync\n- [ ] Review the phone builds\n- [ ] Publish release notes",order=0,stackId=12,labels=[dict(id=3,title="Release",color="FF887E")])]),
    dict(id=13, title="Done", order=2, cards=[dict(id=104,title="Test the offline outbox",description="Reconnect and verify pending changes.",order=0,stackId=13,labels=[])])
]

def ics(task):
    def val(s): return str(s).replace("\\", "\\\\").replace("\n", "\\n").replace(",", "\\,").replace(";", "\\;")
    due = datetime.fromisoformat(task["due_at"]).strftime('%Y%m%dT%H%M%SZ')
    return '\r\n'.join(["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Patchwork video samples//EN", "BEGIN:VTODO",
        f"UID:{task['uid']}", f"SUMMARY:{val(task['title'])}", f"DESCRIPTION:{val(task['markdown'])}",
        f"DUE:{due}", f"CATEGORIES:{','.join(task['tags'])}", f"PRIORITY:{task['priority'] or 0}",
        f"STATUS:{'COMPLETED' if task['completed'] else 'NEEDS-ACTION'}", "END:VTODO", "END:VCALENDAR", ""])

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(self.command, self.path, flush=True)

    def send(self, data, status=200, kind='application/json'):
        payload = (json.dumps(data) if not isinstance(data, str) else data).encode()
        self.send_response(status)
        self.send_header('Content-Type', kind)
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('ETag', '"1"')
        self.end_headers()
        self.wfile.write(payload)

    def body(self): return self.rfile.read(int(self.headers.get('Content-Length', 0))).decode()

    def do_PROPFIND(self):
        self.body()
        home = self.path.rstrip('/') + '/'
        if '/calendars/test/' in home:
            return self.send('<d:multistatus xmlns:d="DAV:"/>',207,'application/xml')
        responses = ''.join(f'<d:response><d:href>{home}{slug}/</d:href><d:propstat><d:prop><d:displayname>{slug.title()}</d:displayname><d:resourcetype><d:collection/><c:calendar/></d:resourcetype><c:supported-calendar-component-set><c:comp name="VTODO"/></c:supported-calendar-component-set></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>' for slug in ['work','personal'])
        self.send(f'<d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">{responses}</d:multistatus>',207,'application/xml')

    def do_REPORT(self):
        self.body()
        slug=self.path.rstrip('/').split('/')[-1]
        responses=''.join(f'<d:response><d:href>{self.path.rstrip("/")}/{t["uid"]}.ics</d:href><d:propstat><d:prop><d:getetag>&quot;1&quot;</d:getetag><c:calendar-data>{escape(ics(t))}</c:calendar-data></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>' for t in TASKS.values() if t['list_id']==slug)
        self.send(f'<d:multistatus xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">{responses}</d:multistatus>',207,'application/xml')

    def do_GET(self):
        # An older simulator has a second, empty local test account.
        # Keep its fixtures empty so accounts do not duplicate the demo board.
        auth=self.headers.get('Authorization','').removeprefix('Basic ')
        try: user=base64.b64decode(auth).decode().split(':',1)[0]
        except Exception: user=''
        if '/boards' in self.path and user=='test': return self.send([])
        if '/boards/2/stacks' in self.path:
            return self.send([dict(id=21,title='Ideas',order=0,cards=[dict(id=201,title='Explore a calendar view',description='An idea for a later iteration.',order=0,stackId=21,labels=[])])])
        if self.path.endswith('/stacks'): return self.send(STACKS)
        if '/boards' in self.path: return self.send(BOARDS)
        if self.path.endswith('.ics'):
            uid=self.path.rsplit('/',1)[-1][:-4]
            return self.send(ics(TASKS[uid]),kind='text/calendar')
        if self.path.startswith('/api/task-lists'): return self.send([dict(id=s,name=s.title(),href=f'/calendars/demo/{s}/',is_deck=False) for s in ['work','personal']])
        if self.path.startswith('/api/tasks'): return self.send(list(TASKS.values()))
        self.send(dict(status='ok',nextcloud_configured=True,gemini_configured=False))

    def do_PUT(self):
        data=self.body()
        uid=self.path.rsplit('/',1)[-1][:-4]
        if uid in TASKS:
            t=TASKS[uid]
            for field,prop in [('title','SUMMARY'),('markdown','DESCRIPTION')]:
                m=re.search(rf'(?m)^{prop}:(.*)',data)
                if m:t[field]=m[1].rstrip('\r').replace('\\n','\n')
            t['completed']='STATUS:COMPLETED' in data
        self.send('',204)

    def do_PATCH(self):
        data=json.loads(self.body() or '{}')
        uid=self.path.rsplit('/',1)[-1]
        if uid in TASKS:
            TASKS[uid].update(data)
            return self.send(TASKS[uid])
        self.send(data)

    def do_POST(self):
        self.send(json.loads(self.body() or '{}'))

if __name__ == '__main__':
    print('Patchwork sample server on http://127.0.0.1:5232',flush=True)
    ThreadingHTTPServer(('0.0.0.0',5232),Handler).serve_forever()
