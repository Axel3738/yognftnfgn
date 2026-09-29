import json,os,time,urllib.request
K=os.environ['KIE_API_KEY']
IDS={'CS':'187e1Ddbx5Lpw93o-H0_scLTRKBq2BCEn','GT':'103ReKE1EhQ2XUM6abLYkRBluIDSD-tHa','PD':'1aoOZZWGFzmFFvYFC0ceuaIn0mQptZvkn','SP':'1ciQTmQNy191zoMw_PhSrIF67heB_gGwa'}
P=("Remove ALL text, letters, numbers, star rating icons, corner ribbons/banners and quotation marks from this image. "
   "Keep buttons as empty shapes with no text. Keep the product (black wall-mounted tool shelf with yellow drills) and the background exactly as they are. "
   "Where text was removed, fill with the surrounding background seamlessly.")
def call(path,body=None):
    req=urllib.request.Request('https://api.kie.ai'+path,data=json.dumps(body).encode() if body else None,headers={'Authorization':'Bearer '+K,'Content-Type':'application/json'},method='POST' if body else 'GET')
    return json.load(urllib.request.urlopen(req,timeout=60))
tasks={}
for k,i in IDS.items():
    if os.path.exists(f'images/clean/{k}.png'): continue
    r=call('/api/v1/jobs/createTask',{'model':'google/nano-banana-edit','input':{'prompt':P,'image_urls':[f'https://drive.usercontent.google.com/download?id={i}&confirm=t'],'output_format':'png','image_size':'1:1'}})
    print(k,r); tasks[k]=r['data']['taskId']
while tasks:
    time.sleep(10)
    for k,t in list(tasks.items()):
        d=call(f'/api/v1/jobs/recordInfo?taskId={t}')['data']
        if d['state']=='success':
            u=json.loads(d['resultJson'])['resultUrls'][0]; urllib.request.urlretrieve(u,f'images/clean/{k}.png'); print('klar',k); del tasks[k]
        elif d['state']=='fail': print('fel',k,d.get('failMsg')); del tasks[k]
