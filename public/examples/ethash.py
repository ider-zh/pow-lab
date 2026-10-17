"""ethash: structural teaching model; protocol differences are described in the lesson."""
import hashlib
import json
import sys

def h(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def word(text):
    return int(text[:8], 16)

def prime(n):
    if n < 2:
        return False
    d = 2
    while d*d <= n:
        if n % d == 0:
            return False
        d += 1
    return True

ETCHASH = False

def run(challenge="hello-pow", parameter=11700000):
    if parameter not in [11699999, 11700000, 12000000] or not isinstance(challenge,str) or len(challenge)>80:
        raise ValueError("Unsupported teaching parameters")
    epoch_length = 60000 if ETCHASH and parameter>=11700000 else 30000
    epoch = parameter//epoch_length
    values = [word(h(f'epoch:{epoch}:item:{i}')) for i in range(64)]
    mix, trace = word(h(challenge)), []
    for i in range(16):
        index = mix%64
        mix = ((mix*16777619)&0xffffffff)^values[index]
        trace.append(dict(round=i,index=index,mix=mix))
    return dict(kind='etchash' if ETCHASH else 'ethash',proof=dict(epoch=epoch,epochLength=epoch_length,mix=mix,output=h(f'{challenge}:{epoch}:{mix}')),stats=dict(datasetItems=64,accesses=16,block=parameter),trace=trace)

if __name__ == "__main__":
    print(json.dumps(run(sys.argv[1] if len(sys.argv)>1 else "hello-pow", int(sys.argv[2]) if len(sys.argv)>2 else 11700000),ensure_ascii=False))
