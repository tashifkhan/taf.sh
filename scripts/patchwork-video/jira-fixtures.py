"""Synthetic Jira API for filming populated boards in both native clients."""
from datetime import datetime, timedelta, timezone
from urllib.parse import urlsplit, parse_qs
import re

now=datetime.now(timezone.utc)
SPRINTS=[dict(id=14,name='Mobile Sprint 14',state='active',startDate=(now-timedelta(days=4)).isoformat(),endDate=(now+timedelta(days=10)).isoformat()),dict(id=13,name='Mobile Sprint 13',state='closed'),dict(id=15,name='Mobile Sprint 15',state='future',startDate=(now+timedelta(days=10)).isoformat())]
STATUSES=[('1','To do','new'),('2','In progress','indeterminate'),('3','In review','indeterminate'),('4','Done','done')]
TITLES=[
('Review the native iOS onboarding flow',1,14,True),('Document CalDAV account setup',1,14,True),('Check Android tablet board spacing',1,14,False),('Write the release notes for both phones',1,14,False),('Add keyboard shortcuts for search',1,None,True),('Improve empty list guidance',1,None,False),
('Keep offline task edits after reconnecting',2,14,True),('Polish card dragging between columns',2,14,True),('Check native date and reminder controls',2,14,False),
('Review task checklist accessibility',3,14,True),('Verify Jira sprint filters',3,14,False),('Check dark mode contrast on Android',3,None,False),
('Add provider model fallback settings',4,14,True),('Finish the unified task search',4,14,False),('Remember board and sprint selections',4,13,True),('Add OLED appearance options',4,13,False)]
ISSUES=[]
for i,(title,status,sprint,mine) in enumerate(TITLES):
 sid,name,category=STATUSES[status-1]
 f=dict(summary=title,status=dict(id=sid,name=name,statusCategory=dict(key=category)),issuetype=dict(name='Task' if i%3 else 'Bug',subtask=False),priority=dict(name='High' if i%4==0 else 'Medium'),assignee=dict(accountId='video-me' if mine else 'video-team',displayName='Alex Tan' if mine else 'Morgan Lee'),reporter=dict(accountId='video-me' if mine else 'video-team'),labels=['mobile'],description=None,created=now.isoformat(),updated=now.isoformat())
 if sprint:f['sprint']=next(s for s in SPRINTS if s['id']==sprint)
 ISSUES.append(dict(id=str(1000+i),key=f'PATCH-{266+i}',fields=f))

def dispatch(handler):
 u=urlsplit(handler.path);p=u.path;q=parse_qs(u.query)
 if not p.startswith('/rest/'):return False
 if handler.command=='GET':
  if p.endswith('/myself'):handler.send(dict(accountId='video-me',displayName='Alex Tan',emailAddress='demo@example.test'));return True
  if p=='/rest/agile/1.0/board':handler.send(dict(values=[dict(id=7,name='Patchwork Mobile',type='scrum',location=dict(projectKey='PATCH',projectName='Patchwork'))],isLast=True));return True
  if p.endswith('/configuration'):handler.send(dict(columnConfig=dict(columns=[dict(name=n,statuses=[dict(id=i)]) for i,n,c in STATUSES])));return True
  if re.search(r'/board/\d+/sprint$',p):handler.send(dict(values=SPRINTS,isLast=True));return True
  if p.endswith('/transitions'):handler.send(dict(transitions=[dict(id=i,name=n,to=dict(id=i,name=n)) for i,n,c in STATUSES]));return True
  if p.endswith('/issue') or p.endswith('/backlog') or p.endswith('/search/jql'):
   issues=ISSUES.copy();jql=q.get('jql',[''])[0]
   if 'currentUser()' in jql:issues=[x for x in issues if x['fields']['assignee']['accountId']=='video-me']
   match=re.search(r'/sprint/(\d+)/issue',p)
   if match:issues=[x for x in issues if x['fields'].get('sprint',{}).get('id')==int(match[1])]
   if p.endswith('/backlog'):issues=[x for x in issues if 'sprint' not in x['fields']]
   start=int(q.get('startAt',[0])[0]);handler.send(dict(issues=issues[start:start+100],total=len(issues),isLast=True));return True
  match=re.search(r'/issue/([^/]+)$',p)
  if match:handler.send(next(x for x in ISSUES if x['key']==match[1]));return True
  handler.send([]);return True
 data=__import__('json').loads(handler.body() or '{}')
 if p.endswith('/transitions'):
  key=p.split('/')[-2];issue=next(x for x in ISSUES if x['key']==key);status=next(s for s in STATUSES if s[0]==str(data['transition']['id']))
  issue['fields']['status']=dict(id=status[0],name=status[1],statusCategory=dict(key=status[2]))
 if p.endswith('/rank'):
  key=data['issues'][0];issue=next(x for x in ISSUES if x['key']==key);ISSUES.remove(issue)
  target=data.get('rankBeforeIssue') or data.get('rankAfterIssue');idx=next((i for i,x in enumerate(ISSUES) if x['key']==target),len(ISSUES))
  ISSUES.insert(idx+(0 if 'rankBeforeIssue' in data else 1),issue)
 handler.send('',204);return True
