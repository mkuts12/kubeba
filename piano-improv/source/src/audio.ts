import type { Chord, Feel, Note, Style } from './music';
import { performedBeat } from './audio-timing';

export interface BackingOptions {
  style: Style;
  tempo: number;
  harmony: Chord[];
  feel?: Feel;
  onBeat?: (beat: number, chord: string, bar: number) => void;
}

/** A local piano-like synth. No samples, microphone access, or network requests. */
export class PianoAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<number, AudioBuffer>();
  private backingNodes = new Set<AudioBufferSourceNode>();
  private demoNodes = new Set<AudioBufferSourceNode>();
  private ticker: ReturnType<typeof setInterval> | null = null;
  private callbacks = new Set<ReturnType<typeof setTimeout>>();
  private options: BackingOptions | null = null;
  private nextBeatAt = 0;
  private beat = 0;
  private volume = 0.65;
  private demoTimer: ReturnType<typeof setTimeout> | null = null;
  private readyPromise: Promise<void> | null = null;

  async ready(): Promise<void> {
    if (!this.context) {
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass)
        throw new Error(
          'Audio is not available in this browser. You can still practice without sound.',
        );
      this.context = new AudioContextClass();
      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.ratio.value = 3;
      this.master = this.context.createGain();
      this.master.gain.value = this.volume * 0.6;
      this.master.connect(compressor);
      compressor.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') {
      this.readyPromise ??= this.context.resume().finally(() => {
        this.readyPromise = null;
      });
      await this.readyPromise;
    }
  }

  setVolume(value: number) {
    this.volume = Math.min(1, Math.max(0, value));
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(this.volume * 0.6, this.context.currentTime, 0.04);
  }

  private buffer(midi: number): AudioBuffer {
    const cached = this.buffers.get(midi);
    if (cached) return cached;
    const context = this.context!;
    const length = Math.ceil(context.sampleRate * 3);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    // Partial-dependent decay and slight inharmonicity approximate a struck string.
    for (let partial = 1; partial <= 7; partial++) {
      const hz = frequency * partial * Math.sqrt(1 + 0.00008 * partial * partial);
      if (hz > context.sampleRate * 0.45) break;
      const amplitude = 0.55 / partial ** 1.65;
      const decay = 1.8 + partial * 0.8;
      for (let i = 0; i < length; i++) {
        const t = i / context.sampleRate;
        data[i] +=
          amplitude *
          Math.sin(2 * Math.PI * hz * t) *
          Math.exp(-t * decay) *
          Math.min(1, t / 0.006);
      }
    }
    this.buffers.set(midi, buffer);
    return buffer;
  }

  private note(midi: number, at: number, duration: number, velocity: number, demo = false) {
    const context = this.context!;
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = this.buffer(midi);
    source.connect(gain);
    gain.connect(this.master!);
    const end = at + Math.min(2.85, duration);
    gain.gain.setValueAtTime(velocity, at);
    gain.gain.setValueAtTime(velocity, Math.max(at, end - 0.08));
    gain.gain.linearRampToValueAtTime(0, end);
    const nodes = demo ? this.demoNodes : this.backingNodes;
    nodes.add(source);
    source.onended = () => {
      nodes.delete(source);
      source.disconnect();
      gain.disconnect();
    };
    source.start(at);
    source.stop(end + 0.01);
  }

  startBacking(options: BackingOptions) {
    this.stopBacking();
    if (!this.context) return;
    this.options = options;
    this.beat = 0;
    this.nextBeatAt = this.context.currentTime + 0.12;
    this.schedule();
    this.ticker = setInterval(() => this.schedule(), 30);
  }

  private schedule() {
    const context = this.context;
    const options = this.options;
    if (!context || !options) return;
    const secondsPerBeat = 60 / options.tempo;
    while (this.nextBeatAt < context.currentTime + 0.18) {
      const beat = this.beat;
      const chord = options.harmony[Math.floor(beat / 4) % options.harmony.length];
      const withinBar = beat % 4;
      const at = this.nextBeatAt;
      if (options.style === 'classical') {
        if (withinBar === 0) this.note(chord.bass, at, secondsPerBeat * 3.8, 0.5);
        const pattern = [0, 1, 2, 1];
        this.note(chord.notes[pattern[withinBar]], at, secondsPerBeat * 1.5, 0.36);
        this.note(
          chord.notes[pattern[(withinBar + 1) % 4]],
          at + secondsPerBeat / 2,
          secondsPerBeat,
          0.23,
        );
      } else {
        const bass = withinBar === 0 ? chord.bass : withinBar === 2 ? chord.bass + 7 : chord.bass;
        this.note(bass - 12, at, secondsPerBeat * 0.8, withinBar % 2 === 0 ? 0.65 : 0.32);
        if (withinBar === 1 || withinBar === 3) {
          chord.notes.forEach((midi, i) =>
            this.note(midi, at + i * 0.012, secondsPerBeat * 0.6, 0.26),
          );
        }
        this.note(
          79,
          at + secondsPerBeat * (options.feel === 'straight' ? 0.5 : 2 / 3),
          0.07,
          0.055,
        );
      }
      const callback = setTimeout(
        () => {
          this.callbacks.delete(callback);
          options.onBeat?.(withinBar, chord.name, Math.floor(beat / 4) % options.harmony.length);
        },
        Math.max(0, (at - context.currentTime) * 1000),
      );
      this.callbacks.add(callback);
      this.nextBeatAt += secondsPerBeat;
      this.beat++;
    }
  }

  playDemo(notes: Note[], tempo: number, onEnd: () => void, feel: Feel = 'straight') {
    this.stopDemo();
    if (!this.context) return;
    const secondsPerBeat = 60 / tempo;
    const start = this.context.currentTime + 0.12;
    notes.forEach((note) =>
      this.note(
        note.midi,
        start + performedBeat(note.beat, feel) * secondsPerBeat,
        (performedBeat(note.beat + note.length, feel) - performedBeat(note.beat, feel)) *
          secondsPerBeat *
          0.9,
        0.85,
        true,
      ),
    );
    const end =
      Math.max(...notes.map((n) => performedBeat(n.beat + n.length, feel))) * secondsPerBeat + 0.2;
    this.demoTimer = setTimeout(() => {
      this.demoTimer = null;
      onEnd();
    }, end * 1000);
  }

  stopBacking() {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
    this.options = null;
    this.callbacks.forEach(clearTimeout);
    this.callbacks.clear();
    this.stopNodes(this.backingNodes);
  }

  stopDemo() {
    if (this.demoTimer) clearTimeout(this.demoTimer);
    this.demoTimer = null;
    this.stopNodes(this.demoNodes);
  }

  private stopNodes(nodes: Set<AudioBufferSourceNode>) {
    nodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        /* Already stopped. */
      }
    });
    nodes.clear();
  }

  stop() {
    this.stopBacking();
    this.stopDemo();
  }

  dispose() {
    this.stop();
    void this.context?.close();
    this.context = null;
    this.master = null;
    this.buffers.clear();
  }
}
