"""kheavyhash: structural teaching model; protocol differences are described in the lesson."""
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
    if parameter not in [4, 8] or not isinstance(challenge,str) or len(challenge)>80:
        raise ValueError("Unsupported teaching parameters")
    vector = [int(x,16) for x in h(challenge+':input')[:parameter]]
    matrix, product = [], []
    for row in range(parameter):
        values = [int(h(f'{challenge}:matrix:{row}:{column}')[0],16) for column in range(parameter)]
        matrix.append(values)
        product.append(sum(v*vector[i] for i,v in enumerate(values))%16)
    mixed = [v^vector[i] for i,v in enumerate(product)]
    output = h(''.join(format(v,'x') for v in mixed))
    return dict(kind='kheavyhash',proof=dict(vector=vector,matrix=matrix,product=product,mixed=mixed,output=output),stats=dict(dimension=parameter,multiplications=parameter*parameter),trace=[dict(row=i,values=row,product=product[i]) for i,row in enumerate(matrix)])

if __name__ == "__main__":
    print(json.dumps(run(sys.argv[1] if len(sys.argv)>1 else "hello-pow", int(sys.argv[2]) if len(sys.argv)>2 else 4),ensure_ascii=False))
