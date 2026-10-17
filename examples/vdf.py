"""vdf: structural teaching model; protocol differences are described in the lesson."""
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
    if parameter not in [128, 256, 512] or not isinstance(challenge,str) or len(challenge)>80:
        raise ValueError("Unsupported teaching parameters")
    modulus, x = 1022117, 2+word(h(challenge))%1000000
    while x%1009==0 or x%1013==0: x+=1
    y, trace = x, []
    for i in range(parameter):
        y=y*y%modulus
        if i<16 or i==parameter-1: trace.append(dict(step=i+1,value=str(y)))
    l=257+word(h(f'{modulus}:{x}:{y}:{parameter}'))%1000
    while not prime(l): l+=1
    quotient=(1<<parameter)//l
    return dict(kind='vdf',proof=dict(modulus=str(modulus),x=str(x),y=str(y),l=l,pi=str(pow(x,quotient,modulus)),steps=parameter),stats=dict(sequentialSquarings=parameter),trace=trace)

if __name__ == "__main__":
    print(json.dumps(run(sys.argv[1] if len(sys.argv)>1 else "hello-pow", int(sys.argv[2]) if len(sys.argv)>2 else 256),ensure_ascii=False))
