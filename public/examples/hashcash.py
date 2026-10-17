"""PoW Lab: hashcash. UTF-8 challenge + ':' + decimal nonce."""
import hashlib
import time

def digest(challenge, nonce):
    data = f"{challenge}:{nonce}".encode("utf-8")
    return hashlib.sha256(data).digest().hex()

def solve(challenge="hello-pow", difficulty=2):
    # Each extra hexadecimal zero multiplies expected work by 16.
    if not 1 <= difficulty <= 4:
        raise ValueError("difficulty must be 1..4")
    start = time.perf_counter()
    for nonce in range(5_000_000):
        proof = digest(challenge, nonce)
        if proof.startswith("0" * difficulty):
            assert digest(challenge, nonce) == proof
            return dict(nonce=nonce, hash=proof, attempts=nonce+1,
                        seconds=time.perf_counter()-start)
        if time.perf_counter()-start > 15:
            raise TimeoutError("15 second budget reached")
    raise RuntimeError("attempt budget reached")

if __name__ == "__main__":
    print(solve())
