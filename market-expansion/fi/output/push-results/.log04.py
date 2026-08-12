import json,sys
path="/home/user/yognftnfgn/market-expansion/fi/output/push-results/chunk-04.log.jsonl"
with open(path,"a") as f:
    f.write(json.dumps(json.loads(sys.argv[1]),ensure_ascii=False)+"\n")
print("logged")
