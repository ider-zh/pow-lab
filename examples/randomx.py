"""randomx: structural teaching model; protocol differences are described in the lesson."""
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

def run(challenge="hello-pow", parameter=16):
    if parameter not in [8, 16, 32] or not isinstance(challenge,str) or len(challenge)>80:
        raise ValueError("Unsupported teaching parameters")
    registers = [1,2,3,4]
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

if __name__ == "__main__":
    print(json.dumps(run(sys.argv[1] if len(sys.argv)>1 else "hello-pow", int(sys.argv[2]) if len(sys.argv)>2 else 16),ensure_ascii=False))
