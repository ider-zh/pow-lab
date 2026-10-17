from pathlib import Path
root=Path(__file__).resolve().parents[1]
common='''import hashlib
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

'''
bodies={
'equihash':'''    values = [int(h(f'{challenge}:leaf:{i}')[:4],16) for i in range(parameter)]
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
''',
'cuckoo':'''    edges, lookup = [], {}
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
''',
'randomx':'''    registers = [1,2,3,4]
    memory = [word(h(f'{challenge}:memory:{i}')) for i in range(32)]
    trace, ops = [], ['ADD','XOR','MUL','LOAD','STORE']
    for i in range(parameter):
        code = h(f'{challenge}:program:{i}')
        op, a, b, imm = int(code[:2],16)%5, int(code[2:4],16)%4, int(code[4:6],16)%4, int(code[6:8],16)
        if op==0: registers[a]=(registers[a]+registers[b])&0xffffffff
        if op==1: registers[a]=(registers[a]^registers[b])&0xffffffff
        if op==2: registers[a]=(registers[a]*registers[b])&0xffffffff
        if op==3: registers[a]=memory[(registers[b]+imm)%32]
        if op==4: memory[(registers[b]+imm)%32]=registers[a]
        trace.append(dict(step=i,op=ops[op],a=a,b=b,imm=imm,registers=registers.copy()))
    text=','.join(map(str,registers))+':'+','.join(map(str,memory))
    return dict(kind='randomx',proof=dict(registers=registers,memory=memory,output=h(text)),stats=dict(instructions=parameter,memoryWords=32),trace=trace)
''',
'dataset':'''    epoch_length = 60000 if ETCHASH and parameter>=11700000 else 30000
    epoch = parameter//epoch_length
    values = [word(h(f'epoch:{epoch}:item:{i}')) for i in range(64)]
    mix, trace = word(h(challenge)), []
    for i in range(16):
        index = mix%64
        mix = ((mix*16777619)&0xffffffff)^values[index]
        trace.append(dict(round=i,index=index,mix=mix))
    return dict(kind='etchash' if ETCHASH else 'ethash',proof=dict(epoch=epoch,epochLength=epoch_length,mix=mix,output=h(f'{challenge}:{epoch}:{mix}')),stats=dict(datasetItems=64,accesses=16,block=parameter),trace=trace)
''',
'primecoin':'''    start, tested = 2+word(h(challenge))%1000, 0
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
''',
'kheavyhash':'''    vector = [int(x,16) for x in h(challenge+':input')[:parameter]]
    matrix, product = [], []
    for row in range(parameter):
        values = [int(h(f'{challenge}:matrix:{row}:{column}')[0],16) for column in range(parameter)]
        matrix.append(values)
        product.append(sum(v*vector[i] for i,v in enumerate(values))%16)
    mixed = [v^vector[i] for i,v in enumerate(product)]
    output = h(''.join(format(v,'x') for v in mixed))
    return dict(kind='kheavyhash',proof=dict(vector=vector,matrix=matrix,product=product,mixed=mixed,output=output),stats=dict(dimension=parameter,multiplications=parameter*parameter),trace=[dict(row=i,values=row,product=product[i]) for i,row in enumerate(matrix)])
''',
'vdf':'''    modulus, x = 1022117, 2+word(h(challenge))%1000000
    while x%1009==0 or x%1013==0: x+=1
    y, trace = x, []
    for i in range(parameter):
        y=y*y%modulus
        if i<16 or i==parameter-1: trace.append(dict(step=i+1,value=str(y)))
    l=257+word(h(f'{modulus}:{x}:{y}:{parameter}'))%1000
    while not prime(l): l+=1
    quotient=(1<<parameter)//l
    return dict(kind='vdf',proof=dict(modulus=str(modulus),x=str(x),y=str(y),l=l,pi=str(pow(x,quotient,modulus)),steps=parameter),stats=dict(sequentialSquarings=parameter),trace=trace)
''',
'argon2':'''    # pip install argon2-cffi; Argon2id v1.3, real low-resource derivation.
    from argon2.low_level import hash_secret_raw, Type
    output=hash_secret_raw(challenge.encode('utf-8'),b'pow-lab-argon2-v1',time_cost=2,memory_cost=parameter,parallelism=1,hash_len=32,type=Type.ID,version=19).hex()
    return dict(kind='argon2',proof=dict(output=output,memoryKiB=parameter,iterations=2,parallelism=1),stats=dict(parameterMemoryKiB=parameter,passes=2),trace=[])
'''
}
options={'argon2':[64,256,1024],'equihash':[64,128,256],'cuckoo':[32,64,96],'ethash':[11699999,11700000,12000000],'etchash':[11699999,11700000,12000000],'randomx':[8,16,32],'primecoin':[3,4,5],'kheavyhash':[4,8],'vdf':[128,256,512]}
defaults={'argon2':64,'equihash':256,'cuckoo':64,'ethash':11700000,'etchash':11700000,'randomx':16,'primecoin':4,'kheavyhash':4,'vdf':256}
for name, default in defaults.items():
 body=bodies['dataset' if name in ('ethash','etchash') else name]
 text=f'"""{name}: '+('Argon2id teaching parameters' if name=='argon2' else 'structural teaching model; protocol differences are described in the lesson')+'."""\n'+common
 if name in ('ethash','etchash'):text+=f'ETCHASH = {name=="etchash"}\n\n'
 text+=f'def run(challenge="hello-pow", parameter={default}):\n    if parameter not in {options[name]!r} or not isinstance(challenge,str) or len(challenge)>80:\n        raise ValueError("Unsupported teaching parameters")\n'+body
 text+=f'\nif __name__ == "__main__":\n    print(json.dumps(run(sys.argv[1] if len(sys.argv)>1 else "hello-pow", int(sys.argv[2]) if len(sys.argv)>2 else {default}),ensure_ascii=False))\n'
 stem='argon2_demo' if name=='argon2' else name
 for folder in ['examples','public/examples']:(root/folder/f'{stem}.py').write_text(text)
