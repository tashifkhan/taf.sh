"""Synthesize the soundtrack for a rendered composition.

Usage: uv run --with numpy python audio.py meta.json out.wav

meta.json comes from render.mjs: total length, the music settings and the cue
list the engine collected (whoosh on scene changes, pops on squish entrances,
ticks on highlights). Nothing sampled, nothing licensed.
"""
import json, subprocess, sys, wave
import numpy as np

meta = json.load(open(sys.argv[1]))
SR = 48000
total = meta["total"]
n = int(total * SR) + SR
mix = np.zeros((n, 2))
fx = np.zeros((n, 2))
rng = np.random.default_rng(7)
M = meta["music"]
beat = 60 / M["bpm"]
bar = beat * 4


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


def put(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= n or i < 0:
        return
    sig = sig[: n - i]
    buf[i:i + len(sig), 0] += sig * gain * (1 - max(pan, 0))
    buf[i:i + len(sig), 1] += sig * gain * (1 + min(pan, 0))


def lp(x, cut):
    w = max(1, int(SR / cut / 2))
    return np.convolve(x, np.ones(w) / w, mode="same")


def env(L, a, r):
    e = np.ones(L)
    ai, ri = int(a * SR), int(r * SR)
    e[:ai] = np.linspace(0, 1, ai)
    if ri < L:
        e[-ri:] *= np.linspace(1, 0, ri)
    return e


# ---- music bed: pads, plucked arp, bass, drums
prog = M["chords"]
for b in range(int(total / bar) + 2):
    chord = prog[b % len(prog)]
    L = int((bar + 0.6) * SR)
    t = np.arange(L) / SR
    sig = np.zeros(L)
    for note in chord:
        f = midi(note)
        for det in (-0.1, 0.0, 0.1):
            ff = f * 2 ** (det / 12)
            sig += np.sin(2 * np.pi * ff * t) + 0.22 * np.sin(2 * np.pi * 2 * ff * t)
    put(mix, lp(sig, 2000) * env(L, 0.5, 0.7) / (len(chord) * 3), b * bar, 0.2)
    root = midi(chord[0] - 12)
    for q in range(4):
        Lb = int(beat * 0.9 * SR)
        tb = np.arange(Lb) / SR
        put(mix, np.sin(2 * np.pi * root * tb) * np.exp(-tb * 3), b * bar + q * beat, 0.28)
    # Eighth-note pluck arpeggio an octave up.
    if b >= 1:
        for q in range(8):
            note = chord[q % len(chord)] + 12
            Lp = int(0.3 * SR)
            tp = np.arange(Lp) / SR
            f = midi(note)
            pl = (np.sin(2 * np.pi * f * tp) + 0.3 * np.sin(2 * np.pi * 3 * f * tp)) * np.exp(-tp * 14)
            put(mix, pl, b * bar + q * beat / 2, 0.05, pan=0.35 if q % 2 else -0.35)

kl = int(0.35 * SR)
tk = np.arange(kl) / SR
kick = np.sin(2 * np.pi * (45 + 90 * np.exp(-tk * 25)) * tk) * np.exp(-tk * 9)
hat = rng.standard_normal(int(0.05 * SR))
hat = np.diff(hat, prepend=0) * np.exp(-np.arange(len(hat)) / SR * 70)
sn = rng.standard_normal(int(0.2 * SR))
sn = (np.diff(sn, prepend=0) * 0.6 + lp(sn, 1800)) * np.exp(-np.arange(len(sn)) / SR * 22)
first = meta["scenes"][1]["start"] if len(meta["scenes"]) > 1 else 0
last = meta["scenes"][-1]["start"]
t0, k = first, 0
while t0 < last + 1.5:
    if k % 2 == 0:
        put(mix, kick, t0, 0.5)
    else:
        put(mix, sn, t0, 0.12)
    put(mix, hat, t0 + beat / 2, 0.05, pan=0.3 if k % 2 else -0.3)
    t0 += beat
    k += 1

# ---- sound effects from the cue list
def whoosh(length=0.75):
    L = int(length * SR)
    t = np.arange(L) / SR
    noise = rng.standard_normal(L)
    e = np.sin(np.pi * t / length) ** 2
    s = t / length
    return ((noise - lp(noise, 900)) * (0.4 + 0.6 * s) + lp(noise, 2500) * (1 - s)) * e


def pop_snd():
    # A pitched bubble: fast upward sweep with a short tail, reads as "squish".
    L = int(0.16 * SR)
    t = np.arange(L) / SR
    f = 380 + 900 * (1 - np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 30) * np.minimum(1, t * 400)


def tick_snd():
    L = int(0.06 * SR)
    t = np.arange(L) / SR
    return (np.sin(2 * np.pi * 2400 * t) * 0.6 + rng.standard_normal(L) * 0.25) * np.exp(-t * 90)


def riser(length):
    L = int(length * SR)
    t = np.arange(L) / SR
    nz = rng.standard_normal(L)
    return (nz - lp(nz, 600)) * (t / t[-1]) ** 2.5


for c in meta["cues"]:
    k, at, g = c["kind"], c["t"], c["gain"]
    if k == "whoosh":
        put(fx, whoosh(), at - 0.3, 0.3 * g, pan=rng.uniform(-0.4, 0.4))
    elif k == "pop":
        put(fx, pop_snd() * rng.uniform(0.9, 1.1), at, 0.16 * g, pan=rng.uniform(-0.3, 0.3))
    elif k == "tick":
        put(fx, tick_snd(), at, 0.18 * g)
    elif k == "riser":
        put(fx, riser(2.2), at, 0.05 * g)

# ---- original audio for scenes that carry it (the voice demo)
voice = np.zeros(n)
for s in meta["scenes"]:
    a = s.get("audio")
    if not a:
        continue
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a["a"]), "-to", str(a["b"]), "-i", a["raw"], "-af", f"atempo={a.get('speed', 1)}",
                          "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, "<i2").astype(float) / 32768
    x = x / (np.max(np.abs(x)) + 1e-9) * a.get("gain", 1)
    i0 = int(s["start"] * SR)
    x = x[: n - i0]
    voice[i0:i0 + len(x)] += x

mix /= np.max(np.abs(mix)) + 1e-9
fx /= max(1.0, np.max(np.abs(fx)) / 0.9)
out = mix * 0.55 + fx * 0.9
if voice.any():
    e = np.convolve(np.abs(voice), np.ones(SR // 5) / (SR // 5), mode="same")
    duck = 1 - 0.75 * np.clip(e * 6, 0, 1)
    out = out * duck[:, None] + voice[:, None]
n = int(total * SR)
out = out[:n]
fade = np.ones(n)
fi, fo = int(0.6 * SR), int(2.0 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] *= np.linspace(1, 0, fo)
out *= fade[:, None]
out /= np.max(np.abs(out)) + 1e-9
out *= 10 ** (-1 / 20)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype("<i2").tobytes())
