"""equihash: structural teaching model; protocol differences are described in the lesson."""
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

def run(challenge="hello-pow", parameter=256):
    if parameter not in [64, 128, 256] or not isinstance(challenge,str) or len(challenge)>80:
        raise ValueError("Unsupported teaching parameters")
    values = [int(h(f'{challenge}:leaf:{i}')[:4],16) for i in range(parameter)]
    pairs, trace, matches = {}, [], 0
    for i in range(parameter):
        for j in range(i+1,parameter):
            if values[i] >> 8 != values[j] >> 8:
                continue
            matches += 1
            xor = values[i] ^ values[j]
            previous = pairs.get(xor)
            if previous and i not in previous and j not in previous:
                ids = previous + [i,j]
                return dict(kind='equihash',proof=dict(indices=ids,values=[values[k] for k in ids],xor=0),stats=dict(leaves=parameter,prefixPairs=matches),trace=trace+[dict(pair=[i,j],xor=xor)])
            if previous is None:
                pairs[xor] = [i,j]
            if len(trace)<24:
                trace.append(dict(pair=[i,j],xor=xor))
    return dict(kind='equihash',proof=dict(indices=[],values=[],xor=None),stats=dict(leaves=parameter,prefixPairs=matches),trace=trace)

if __name__ == "__main__":
    print(json.dumps(run(sys.argv[1] if len(sys.argv)>1 else "hello-pow", int(sys.argv[2]) if len(sys.argv)>2 else 256),ensure_ascii=False))
