"""Build the phone-led Paisa walkthrough and complete portrait feature cut."""
from pathlib import Path
import copy,json
ROOT=Path(__file__).resolve().parent
SITE=ROOT.parents[1]
F=lambda n:str(ROOT/n)
R=lambda n:str(ROOT/'raw'/n)
# Keep the product's existing light green identity.
old=json.loads((ROOT/'composition.json').read_text())
theme=old['theme']
theme['css']='.intro .chip{display:none}.intro .copy{width:550px}.intro .title{font-size:72px}.intro .tagline{max-width:490px}.intro .orbit{left:1050px}.chapter .copy{width:480px}.chapter .title{font-size:54px}.chapter .tilt{left:650px;width:590px}.chapter .tilt .win{width:590px}.chapter .tilt .view{height:368px}.outro .title{font-size:64px}.outro .copy{top:170px}.outro .stackrow{top:540px}.intro.landing .orbit{left:830px;right:auto;top:75px;width:290px;height:652px}.intro.landing .card3d{width:290px;height:auto;border:7px solid #263522;border-radius:34px}.intro.landing .card3d .bar{display:none}.intro.landing .card3d img{width:100%;height:auto;aspect-ratio:1080/2424;border-radius:27px}.intro.landing .copy{width:550px}'
scenes=[]
def add(t,**kw):
 s=dict(type=t,**kw);scenes.append(s);return s
def chapter(n,title,body,still):
 return add('chapter',n=n,dur=4.2,title=title,body=body,points=[],still=F(still),path='')
def demo(n,raw,a,b,title,body,caption,layout='phone',speed=1,hold=.7,points=None,highlights=None):
 src=dict(raw=R(raw),a=a,b=b,speed=speed)
 if layout=='phone':src['crop']='1080:2424:498:0'
 if layout=='foldable':src['crop']='2076:2152:0:136'
 return add('demo',n=n,path='',caption=caption,layout=layout,src=src,hold=hold,kicker={1:'Capture your spending',2:'Understand your money',3:'Make Paisa yours',4:'Room for every screen'}[n],title=title,body=body,points=points or [],highlights=highlights or [])
add('intro',dur=5.5,pre='Paisa',kicker='Paisa',title='Your money.<br>On <em>your terms.</em>',tagline='Bank SMS, quick entries, budgets and private records. On your phone and every bigger screen.',shots=[F('phone-manual-saved.png')],landing=True,decor='none')
chapter(1,'Less typing.<br>More <em>recorded.</em>','Capture a bank alert automatically, use your own AI provider, or add an expense by hand.','desktop-home.png')
demo(1,'phone-sms.mp4',0,8,'A bank SMS becomes a transaction','Paisa reads supported bank alerts on your Android device and saves the amount and account.','SMS parsing happens on the device',speed=1.25,points=['Live sample bank alert','No AI key needed for bank SMS'])
demo(1,'phone-sms.mp4',45,50,'Keep the source with the record','Open the parsed expense to check the amount, account, reference and original bank message.','₹460 parsed from a sample bank SMS',highlights=[dict(at=1,dur=2.5,box=[.035,.195,.93,.235],label='Parsed amount and SMS source')])
demo(1,'phone-sms.mp4',58,62.5,'Read the original message','The SMS remains attached, so you can check what the bank actually sent.','Original SMS attached to the transaction')
demo(1,'phone-ai-results.mp4',104,117,'Let AI read the payment text','Gemini turns a bank message and a ride note into two drafts with amounts, merchants and categories.','Real Gemini response · two editable drafts',speed=1.6,hold=.6,points=['Use your own AI provider','Check the drafts before saving'])
demo(1,'phone-ai-results.mp4',126,140,'Change the drafts in plain words','Ask AI to use HDFC Savings for both payments. Review the updated accounts before saving.','Ask AI to change the account',speed=1.8,hold=.6)
demo(1,'phone-ai-results.mp4',145,152.5,'Save the payments together','Choose the drafts to include, then save both transactions to your records.','Two AI drafts saved after review',speed=1.5,hold=.6)
demo(1,'phone-manual.mp4',0,4,'Add a cash expense in seconds','Enter ₹180 and a title. The category and account stay beside the amount.','Fast manual entry · no AI service needed',speed=1.45,hold=.5)
demo(1,'phone-manual.mp4',16,18.7,'Review. Save. Done.','Save the entry locally and return to your updated balance and recent transactions.','A sample coffee expense saved on the device',speed=1.35,hold=1.5)
chapter(2,'Know where<br>it <em>went.</em>','Search individual payments, compare categories, and keep monthly spending within a budget.','desktop-analytics.png')
demo(2,'phone-search.mp4',0,3,'Find the payments you need','Search a merchant to bring matching records together.','Merchant search on your phone',hold=2.0)
demo(2,'phone-analytics.mp4',0,3,'See the spending by category','Monthly totals and category breakdowns help you review the original records.','Monthly analytics · real sample records',hold=2)
demo(2,'phone-review.mp4',2.4,6.1,'Give each category a budget','Set monthly caps and compare spending with the amount you planned.','Monthly budgets and category progress',hold=1)
demo(2,'phone-accounts.mp4',0,1.2,'Keep every account in view','Review bank, cash and credit card balances separately.','Bank, cash, card and wallet accounts',hold=3.5)
demo(2,'phone-backup.mp4',0,1.5,'Choose your backup','Connect Google Drive or Nextcloud, or keep a backup file. Backup and sync are optional.','Your choice of backup destination',hold=3)
chapter(3,'Your colors.<br>Your <em>privacy.</em>','Material You colors, appearance controls, hidden amounts and an app lock.','desktop-home.png')
demo(3,'phone-appearance.mp4',.2,6.6,'Material You, your way','Follow your wallpaper colors on Android 12 and later, or pick a fixed palette.','Material 3 · wallpaper colors and 31 themes',points=['Dynamic Material You colors','System, light or dark appearance'])
demo(3,'phone-appearance.mp4',7,13.2,'Make the interface yours','Choose AMOLED black, expressive motion, stronger contrast and a floating navigation bar.','Customize color, contrast, motion and navigation',speed=1.15)
demo(3,'phone-appearance.mp4',14,16.5,'An AMOLED black home','Your selected palette carries through the app, including the floating bottom bar.','Ocean palette · AMOLED black · floating navbar',hold=2)
demo(3,'phone-privacy.mp4',0,4.7,'Hide the amounts','Tap the eye to hide balances and transaction amounts. Reveal them when you need them.','Hide amounts on the home screen',hold=1,highlights=[dict(at=1.2,dur=1.8,box=[.025,.25,.95,.18],label='Amounts concealed with one tap')])
demo(3,'phone-lock.mp4',14,19,'Lock your finances','Require fingerprint, face or your device credentials when you return to Paisa.','App lock · real locked screen',hold=1.2)
chapter(4,'Fits the screen<br>you <em>have.</em>','Use Paisa on a phone, an unfolded foldable, a tablet or the web.','desktop-detail.png')
demo(4,'foldable.mp4',27,34,'Unfold into two panes','Open a transaction beside your records on the inner display.','Foldable · list and details together',layout='foldable',speed=1.15)
demo(4,'tablet.mp4',0,4.5,'A proper tablet layout','A larger display keeps navigation, records and transaction details visible together.','Native Android · tablet support',layout='tablet',hold=1)
demo(4,'tablet.mp4',6,9,'More room for analytics','Review totals, category charts and spending patterns across the tablet display.','Tablet analytics',layout='tablet',hold=1.2)
demo(4,'desktop-details.mp4',46,53,'Paisa in your browser','Open transaction details beside your search results.','Web · paisa.tashif.codes',layout='desktop',highlights=[dict(at=2,dur=2.8,box=[.672,.135,.322,.5],label='Transaction details stay beside your records')])
add('outro',dur=6,kicker='Paisa',title='Keep your money<br>record <em>yours.</em>',url='paisa.tashif.codes',stack=['Phone','Foldable','Tablet','Web'],sign='<b>Built by taf.sh</b> · Open source')
comp=dict(name='paisa',out=str(SITE/'public/reel/paisa-demo.mp4'),poster=str(SITE/'public/reel/paisa-poster.jpg'),posterAt=3.6,fps=30,product=dict(name='Paisa',host='paisa.tashif.codes',icon=F('paisa-icon.svg')),cursor=False,theme=theme,music=old['music'],scenes=scenes)
(ROOT/'composition.json').write_text(json.dumps(comp,indent=2)+'\n')
phone=copy.deepcopy(comp)
phone.update(name='paisa-phone',format='portrait',out=str(SITE/'public/reel/paisa-phone-demo.mp4'),poster=str(SITE/'public/reel/paisa-phone-poster.jpg'),posterAt=3)
phone['scenes']=[copy.deepcopy(s) for s in scenes if s['type']=='demo' and s.get('layout')=='phone']
for s in phone['scenes']:
 s['layout']='portrait';s['highlights']=[];s['title']=s['title'].replace('<br>',' ')
 s['body']=''
 s['caption']=s['caption'].replace(' · no AI service needed','')
phone['theme']['css']='''html,body{width:720px;height:1280px}.hud{display:none}.demo.portrait .win{left:146px;top:223px;width:428px;border:7px solid #263522;border-radius:34px;background:#000}.demo.portrait .bar{display:none}.demo.portrait .view{height:auto;aspect-ratio:1080/2424;border-radius:27px;background:#000}.demo.portrait .shot{object-fit:fill!important}.portrait-header{position:absolute;left:32px;right:32px;top:24px;text-align:center}.portrait-header small{display:block;height:42px}.portrait-header small .product-icon{width:42px;height:42px;border-radius:12px}.portrait-header h2{font:600 36px/1.1 var(--head);letter-spacing:-.03em;margin:16px 0 10px}.portrait-header p{font:18px/1.3 var(--body);color:var(--muted);margin:0}.caption{left:24px;right:24px;bottom:37px;justify-content:center;padding:10px 5px;font-size:18px;box-shadow:none}.caption b{display:none}.sample-data{left:0;right:0;bottom:12px;text-align:center;font-size:11px}'''
(ROOT/'phone-composition.json').write_text(json.dumps(phone,indent=2)+'\n')
print(len(scenes),'main scenes;',len(phone['scenes']),'phone scenes')
