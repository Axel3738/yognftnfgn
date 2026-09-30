import json,os,time,urllib.request
K=os.environ['KIE_API_KEY']
IDS={'CS':'1le5rLXag-SE2yivBe_uZWyPkWLiJmr--','G':'1siJbdVDOX3kbQ3lbAto5AaWDGkz16pWn','PD':'1wBic9Kng_2pPtEHlpQLYXwTgopvZzklL','SP':'1CYAXfhLHgnYonZRI13vb9br7aIljgDnn'}
P="Remove ALL text, letters, numbers, prices, stars, quotation marks and badges from this image. Keep buttons and the white card as empty shapes with no text. Keep the product, background, lighting and composition exactly the same. Fill removed areas with the natural surrounding background. Do not add any circles, rings, logos, symbols or new objects. Keep the small black remote control key fob exactly where it is. The boot must keep its original plain look with no white marks."
def call(path,body=None):
    req=urllib.request.Request('https://api.kie.ai'+path,data=json.dumps(body).encode() if body else None,headers={'Authorization':'Bearer '+K,'Content-Type':'application/json'},method='POST' if body else 'GET')
    return json.load(urllib.request.urlopen(req,timeout=60))
tasks={}
for k,i in IDS.items():
    if k!='CS': continue
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
