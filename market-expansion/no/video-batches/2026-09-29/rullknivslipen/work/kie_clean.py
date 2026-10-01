import json,os,time,urllib.request
K=os.environ['KIE_API_KEY']
IDS={'CS':'1xTT7dZC2whXng7Ui480yMzBu8Zwk2UMB','GT':'1bKwQCYynI1VxUzh8fXdhDGYHy6Myapug','PD':'1iBJPkdGh5nxxZHZ23Ra_B_vwxdsorccG','SP':'1VkKLEB-1JP00cHMHTseVlh25mjkulMzG'}
P=("Remove ALL overlaid text, headlines, prices, letters, numbers, star rating icons, quotation marks and banner strips from this image. "
   "Keep buttons as empty shapes with no text. Keep the product (wooden rolling knife sharpener cylinder and wooden angle block, including the small '20°' plate printed on the block), the knife and the background exactly as they are. "
   "Where text was removed, fill with the surrounding background seamlessly.")
def call(path,body=None):
    req=urllib.request.Request('https://api.kie.ai'+path,data=json.dumps(body).encode() if body else None,headers={'Authorization':'Bearer '+K,'Content-Type':'application/json'},method='POST' if body else 'GET')
    return json.load(urllib.request.urlopen(req,timeout=60))
tasks={}
for k,i in IDS.items():
    if os.path.exists(f'images/clean/{k}.png'): continue
    r=call('/api/v1/jobs/createTask',{'model':'google/nano-banana-edit','input':{'prompt':P,'image_urls':[f'https://drive.usercontent.google.com/download?id={i}&confirm=t'],'output_format':'png','image_size':'1:1'}})
    print(k,r); tasks[k]=r['data']['taskId']
t0=time.time()
while tasks and time.time()-t0<900:
    time.sleep(10)
    for k,t in list(tasks.items()):
        d=call(f'/api/v1/jobs/recordInfo?taskId={t}')['data']
        if d['state']=='success':
            u=json.loads(d['resultJson'])['resultUrls'][0]; urllib.request.urlretrieve(u,f'images/clean/{k}.png'); print('klar',k); del tasks[k]
        elif d['state']=='fail': print('fel',k,d.get('failMsg')); del tasks[k]
