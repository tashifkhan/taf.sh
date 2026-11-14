from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
SITE=ROOT.parents[1]
F=lambda name:str(ROOT/name)
R=lambda name:str(ROOT/'raw'/name)
scenes=[]
def add(type,**kw):scenes.append(dict(type=type,**kw))
def demo(n,raw,a,b,caption,**kw):add('demo',n=n,path=' · local Wasm build',caption=caption,src=dict(raw=R(raw),a=a,b=b,speed=1),hold=.5,**kw)
def chapter(n,title,body,points,still):add('chapter',n=n,dur=7,title=title,body=body,points=points,still=F(still),path=' · Compose Multiplatform')
add('intro',dur=7,pre='Paisa · open source',kicker='Paisa',title='Your expenses. On <em>your device</em>',tagline='An expense manager for Android and the web. Built with Kotlin and Compose Multiplatform.',shots=[F('desktop-home.png'),F('desktop-analytics.png'),F('desktop-detail.png')],decor='none')
add('stats',dur=8,kicker='A local money record',title='Start without an <em>account</em>',items=[dict(text='On-device',label='Android parses bank SMS locally'),dict(text='Optional',label='AI uses the provider and key you choose'),dict(text='Your choice',label='Keep a file or connect your own backup')],foot='No Paisa account required. The app keeps its database on your device.')
add('arch',dur=9,kicker='The everyday loop',title='Capture, categorize, <em>review</em>',cols=4,rows=2,nodes=[dict(id='capture',x=0,y=0,kind='Capture',label='Manual or SMS',sub='SMS on Android only',hot=True),dict(id='category',x=1,y=0,kind='Organize',label='Merchant rules',sub='Remember corrections'),dict(id='data',x=2,y=0,kind='Store',label='Local database',sub='SQLite on each device',hot=True),dict(id='review',x=3,y=0,kind='Review',label='Spending + budgets',sub='See the original records'),dict(id='backup',x=2,y=1,kind='Optional',label='Backup + sync',sub='Your file, Drive or server')],edges=[dict(from_='capture',to='category'),dict(from_='category',to='data'),dict(from_='data',to='review'),dict(from_='data',to='backup')])
# Convert Python-safe edge key to engine field.
for sc in scenes:
 for edge in sc.get('edges',[]):edge['from']=edge.pop('from_')
chapter(1,'Keep the everyday <em>record</em>','Add a cash expense by hand. On Android, bank alerts can become records on the device.', ['Choose a category and account','Merchant rules remember your corrections'], 'desktop-home.png')
demo(1,'phone.mp4',3,11,'Native Android · phone',layout='phone',kicker='Phone · native Android',title='A balance you can check at a glance',body='Your accounts, recent records and credit card usage fit the cover display.',points=['Bottom navigation stays within reach','All amounts shown here are sample data'])
scenes[-1]['src']['crop']='1080:2424:498:0'
# Entry window inspected in the native recording.
demo(1,'phone.mp4',91,100,'Manual entry · real app',layout='phone',kicker='Phone · add an expense',title='Put the details with the amount',body='The add sheet keeps the amount, date, category and account together.',points=['Manual entry needs no AI service','Review the record before saving'])
scenes[-1]['src']['crop']='1080:2424:498:0'
demo(1,'phone.mp4',147,150,'Saved locally · a ₹240 expense',layout='phone',kicker='Phone · local record',title='Save it on the device',body='Saving the expense updates the balance and adds it to the transaction list.',points=['₹240 sample expense','No account or cloud connection needed'])
scenes[-1]['src']['crop']='1080:2424:498:0'
scenes[-1]['hold']=5.5
chapter(2,'Give the layout <em>room</em>','The same Kotlin UI adapts when the foldable opens or the browser gets wider.', ['A rail replaces the phone bottom bar','Transaction details can stay beside the list'], 'desktop-detail.png')
demo(2,'foldable.mp4',3,11,'Native Android · unfolded foldable',layout='foldable',kicker='Foldable · native Android',title='Unfold into more context',body='The inner display makes room for the overview and a navigation rail.',points=['One app across both displays','No separate tablet rewrite'])
scenes[-1]['src']=dict(raw=R('foldable.mp4'),a=3,b=11,speed=1,crop='2076:2152:0:136')
demo(2,'foldable.mp4',27,35,'Native Android · list and detail',layout='foldable',kicker='Foldable · two panes',title='Open a record. Keep the list.',body='Check the source, category and account while the transaction list remains visible.',points=['Edit the amount or title in place','Return to the next record without losing context'])
scenes[-1]['src']['crop']='2076:2152:0:136'
chapter(3,'See where the money <em>went</em>','Search the original records, compare spending and set a monthly category budget.', ['Desktop keeps navigation visible','Charts lead back to actual transactions'], 'desktop-analytics.png')
demo(3,'desktop-details.mp4',16,24,'Search a merchant across the record',highlights=[dict(at=3,dur=2.7,box=[.185,.05,.50,.09],label='Swiggy · 4 matching transactions',side='below')])
demo(3,'desktop-details.mp4',46,54,'Open the source record beside the results',highlights=[dict(at=3,dur=2.6,box=[.68,.06,.30,.52],label='Source, date, category and account',side='below')])
demo(3,'desktop.mp4',15,23,'Compare the month and inspect category spending',highlights=[dict(at=2,dur=2.5,box=[.18,.19,.80,.10],label='Income, expense and savings for the selected period',side='below')])
demo(3,'desktop.mp4',40,48,'Monthly budgets with category progress',highlights=[dict(at=2,dur=2.7,box=[.18,.07,.79,.20],label='Set caps for the categories you want to watch',side='below')])
chapter(4,'Choose what <em>leaves</em> the device','Keep your records local. Connect backup, sync or an AI provider when you want them.', ['File, Google Drive or Nextcloud','AI sends only what you choose to submit'], 'desktop-backup.png')
demo(4,'desktop.mp4',54,61,'Accounts keep cash, bank and credit records separate',highlights=[dict(at=2,dur=2.5,box=[.18,.06,.38,.35],label='Sample cash, bank, card and wallet accounts',side='below')])
demo(4,'desktop.mp4',89,97,'Backup and sync are optional',highlights=[dict(at=2,dur=2.8,box=[.45,.35,.53,.29],label='Connect your own destination first',side='below')])
demo(4,'desktop.mp4',104,112,'Bring your own AI provider and model',highlights=[dict(at=3,dur=2.6,box=[.45,.36,.53,.29],label='Configure optional import and Add with AI',side='below')])
add('arch',dur=9,kicker='One shared codebase',title='Kotlin on Android. Compose in the <em>browser</em>',cols=3,rows=2,nodes=[dict(id='shared',x=1,y=0,kind='Shared',label='Kotlin + Compose',sub='UI and application logic',hot=True),dict(id='android',x=0,y=1,kind='Android',label='Phone + foldable',sub='Native app and local SMS'),dict(id='web',x=2,y=1,kind='Web',label='Kotlin/Wasm',sub='SQLite in browser storage')],edges=[dict(**{'from':'shared'},to='android'),dict(**{'from':'shared'},to='web')])
add('outro',dur=8,kicker='Paisa · open source',title='Keep your money record <em>yours</em>',url='github.com/tashifkhan/Paisa',trace=[dict(name='Android phone',status='native app'),dict(name='Unfolded foldable',status='adaptive two panes'),dict(name='Web browser',status='Kotlin/Wasm')],stack=['Kotlin','Compose Multiplatform','SQLite','AGPL-3.0'],sign='<b>Built by taf.sh</b> · github.com/tashifkhan/Paisa')
comp=dict(name='paisa',out=str(SITE/'public/reel/paisa-demo.mp4'),poster=str(SITE/'public/reel/paisa-poster.jpg'),posterAt=3.6,fps=30,product=dict(name='Paisa',host='Kotlin Multiplatform',icon=F('paisa-icon.svg')),cursor=False,theme=dict(fonts='family=Roboto:wght@400;500;600;700&family=Roboto+Mono:wght@400;500',vars={'bg':'#F1F8E9','fg':'#172116','muted':'#4E604A','card':'#E5EFDD','line':'#C8D8BF','shadow':'rgba(28,58,22,.20)','chrome':'#E1ECD9','urlbg':'#F1F8E9','slab':'#CBDCC3','accent':'#1B5E20','accent-fg':'#FFFFFF','accent-soft':'rgba(27,94,32,.10)','accent-line':'rgba(27,94,32,.30)','grid':'rgba(27,94,32,.08)','dim':'rgba(15,32,12,.22)','pill-bg':'#193A1A','pill-fg':'#FFFFFF','fadebg':'#F1F8E9','head':'Roboto, Arial, sans-serif','head-weight':'600','head-track':'-.035em','body':'Roboto, Arial, sans-serif','mono':'"Roboto Mono", monospace','hand':'Roboto, Arial, sans-serif','hand-weight':'600','bgimg':'none'},css='.intro .chip{display:none}.intro .copy{width:550px}.intro .title{font-size:72px}.intro .tagline{max-width:480px}.intro .orbit{left:1050px}.chapter .copy{width:480px}.chapter .title{font-size:54px}.chapter .tilt{left:650px;width:590px}.chapter .tilt .win{width:590px}.chapter .tilt .view{height:368px}.stats .title{font-size:56px}.stat b{font-size:37px}.statrow{top:370px}.outro .term{top:300px;height:270px}.outro .title{font-size:55px}.outro .term .row b{width:325px}.arch .title{font-size:43px}'),music=dict(bpm=94,chords=[[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59]]),scenes=scenes)
(ROOT/'composition.json').write_text(json.dumps(comp,indent=2)+'\n')
print(len(scenes),'scenes')

# A separate portrait cut uses the native phone capture at its own aspect ratio.
import copy
phone=copy.deepcopy(comp)
phone.update(name='paisa-phone',format='portrait',out=str(SITE/'public/reel/paisa-phone-demo.mp4'),poster=str(SITE/'public/reel/paisa-phone-poster.jpg'),posterAt=2.5)
phone['scenes']=[]
for a,b,title,body,caption in [
 (3,11,'Your expenses. On your device.','The native Kotlin app on a phone.','Check balances and recent records'),
 (37,46,'Add an expense','Choose the amount, category and account.','Manual entry · no AI service needed'),
 (91,100,'Review the details','A sample ₹240 expense in the add sheet.','Review before saving'),
 (147,150,'Saved on the device','The balance updates with your new record.','github.com/tashifkhan/Paisa')]:
 phone['scenes'].append(dict(type='demo',n=1,layout='portrait',title=title,body=body,caption=caption,path='',src=dict(raw=R('phone.mp4'),a=a,b=b,speed=1,crop='1080:2424:498:0'),hold=5.5 if a==147 else .5))
phone['theme']['css']='html,body{width:720px;height:1280px}.hud{display:none}.demo.portrait .win{left:132px;top:190px;width:456px;border:7px solid #263522;border-radius:32px}.demo.portrait .bar{display:none}.demo.portrait .view{height:990px;background:var(--bg)}.demo.portrait .shot{object-fit:contain!important}.portrait-header{position:absolute;left:40px;right:40px;top:26px;text-align:center}.portrait-header small{font:14px var(--mono);letter-spacing:.13em;color:var(--accent)}.portrait-header h2{font:600 38px/1.12 var(--head);letter-spacing:-.03em;margin:16px 0 8px}.portrait-header p{font:20px/1.4 var(--body);color:var(--muted);margin:0}.caption{left:40px;right:40px;bottom:31px;justify-content:center;padding:11px 12px;font-size:20px;box-shadow:none}.caption b{display:none}.sample-data{left:0;right:0;bottom:8px;text-align:center;font-size:11px}'
(ROOT/'phone-composition.json').write_text(json.dumps(phone,indent=2)+'\n')
