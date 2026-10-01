import json,os,urllib.request,time,sys
K=os.environ['KIE_API_KEY']
ids={'CS':'1SDNpES0FZVw8b7EoK5fExCGrndg_eTAr','G':'1uZAo0U0d0Q-OCR2JfdMf5NF1dD7XtNTe','PD':'1B3jMFcaZ-Kc3fE3kezEkOxuei6LeiRzU','SP':'13vjuB3xTNkewdqIfs5BJWBffp5CW7MiU'}
P="Remove ALL text, letters, numbers, prices, stars, quotation marks and badges from this image. Keep buttons as empty shapes with no text. Keep the product, people, background, lighting and composition exactly the same. Fill removed areas with the natural surrounding background. Do not add any circles, rings, logos or new objects."
def api(path,body=None):
    r=urllib.request.Request('https://api.kie.ai'+path,data=json.dumps(body).encode() if body else None,headers={'Authorization':'Bearer '+K,'Content-Type':'application/json'})
    return json.load(urllib.request.urlopen(r,timeout=60))
tasks={}
for k,i in ids.items():
    if os.path.exists(f'clean/{k}.png'): continue
    d=api('/api/v1/jobs/createTask',{'model':'google/nano-banana-edit','input':{'prompt':P,'image_urls':[f'https://drive.usercontent.google.com/download?id={i}&confirm=t'],'output_format':'png','image_size':'1:1'}})
    print(k,d); tasks[k]=d['data']['taskId']
os.makedirs('clean',exist_ok=True)
while tasks:
    time.sleep(8)
    for k,t in list(tasks.items()):
        d=api(f'/api/v1/jobs/recordInfo?taskId={t}')['data']
        if d['state']=='success':
            u=json.loads(d['resultJson'])['resultUrls'][0]; urllib.request.urlretrieve(u,f'clean/{k}.png'); print(k,'ok'); del tasks[k]
        elif d['state']=='fail': print(k,'FAIL',d.get('failMsg')); del tasks[k]
