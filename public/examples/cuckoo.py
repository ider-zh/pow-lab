"""cuckoo: structural teaching model; protocol differences are described in the lesson."""
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

def run(challenge="hello-pow", parameter=64):
    if parameter not in [32, 64, 96] or not isinstance(challenge,str) or len(challenge)>80:
        raise ValueError("Unsupported teaching parameters")
    edges, lookup = [], {}
    for i in range(parameter):
        value = h(f'{challenge}:edge:{i}')
        u, v = int(value[:2],16)%8, 8+int(value[2:4],16)%8
        edges.append(dict(id=i,u=u,v=v))
        lookup.setdefault((u,v),i)
    checked = 0
    for a in range(8):
        for b in range(a+1,8):
            for c in range(8,16):
                for d in range(c+1,16):
                    checked += 1
                    ids = [lookup.get(pair) for pair in [(a,c),(a,d),(b,c),(b,d)]]
                    if all(i is not None for i in ids):
                        return dict(kind='cuckoo',proof=dict(edgeIds=ids,nodes=[a,b,c,d]),stats=dict(edges=parameter,rectanglesChecked=checked),trace=edges)
    return dict(kind='cuckoo',proof=dict(edgeIds=[],nodes=[]),stats=dict(edges=parameter,rectanglesChecked=checked),trace=edges)

if __name__ == "__main__":
    print(json.dumps(run(sys.argv[1] if len(sys.argv)>1 else "hello-pow", int(sys.argv[2]) if len(sys.argv)>2 else 64),ensure_ascii=False))
