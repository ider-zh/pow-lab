"""argon2: Argon2id teaching parameters."""
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
    if parameter not in [64, 256, 1024] or not isinstance(challenge,str) or len(challenge)>80:
        raise ValueError("Unsupported teaching parameters")
    # pip install argon2-cffi; Argon2id v1.3, real low-resource derivation.
    from argon2.low_level import hash_secret_raw, Type
    output=hash_secret_raw(challenge.encode('utf-8'),b'pow-lab-argon2-v1',time_cost=2,memory_cost=parameter,parallelism=1,hash_len=32,type=Type.ID,version=19).hex()
    return dict(kind='argon2',proof=dict(output=output,memoryKiB=parameter,iterations=2,parallelism=1),stats=dict(parameterMemoryKiB=parameter,passes=2),trace=[])

if __name__ == "__main__":
    print(json.dumps(run(sys.argv[1] if len(sys.argv)>1 else "hello-pow", int(sys.argv[2]) if len(sys.argv)>2 else 64),ensure_ascii=False))
