"""primecoin: structural teaching model; protocol differences are described in the lesson."""
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

def run(challenge="hello-pow", parameter=4):
    if parameter not in [3, 4, 5] or not isinstance(challenge,str) or len(challenge)>80:
        raise ValueError("Unsupported teaching parameters")
    start, tested = 2+word(h(challenge))%1000, 0
    for origin in range(start,start+20000):
        tested += 1
        chain, value = [], origin
        for i in range(parameter):
            if not prime(value): break
            chain.append(value)
            value = 2*value+1
        if len(chain)==parameter:
            return dict(kind='primecoin',proof=dict(origin=origin,chain=chain,start=start),stats=dict(candidates=tested,length=parameter),trace=[dict(index=i,value=v) for i,v in enumerate(chain)])
    return dict(kind='primecoin',proof=dict(origin=None,chain=[],start=start),stats=dict(candidates=tested,length=parameter),trace=[])

if __name__ == "__main__":
    print(json.dumps(run(sys.argv[1] if len(sys.argv)>1 else "hello-pow", int(sys.argv[2]) if len(sys.argv)>2 else 4),ensure_ascii=False))
