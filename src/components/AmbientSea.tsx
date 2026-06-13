'use client';
// ROUND 50: Calm Sea — depth rebuild. A receding water plane rendered by a
// single WebGL fragment shader on one fullscreen quad. NOT an instrument, not
// a screensaver — atmospheric background. No horizon, no sky, no sun: the
// plane recedes upward (wave scale + spacing diminish toward the top) and
// dissolves into haze that fades to the page background. Desaturated grey,
// never navy (navy is chart water only). Persistent (mounted in the layout)
// so the FleetView↔VesselInspector scope change EASES, no cut.
//
// GPU-only: the wave math runs per-pixel in the shader; JS writes ~3 uniforms
// per frame (time + eased amp/freq) and issues one drawArrays — no per-frame
// allocation, no textures. Governance: off in expert mode and when toggled
// off; static depth-faded still under prefers-reduced-motion; paused when the
// tab is hidden; static still fallback if WebGL is unavailable or the context
// fails (never the old paper-wave; no layout shift).

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useFleet } from '../state/FleetProvider';
import { useLearn } from '../learn/LearnProvider';
import { waterScope, waterInputs } from './ambientReadout';

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

// Receding plane: depth grows toward the top (horizonless); wavelength
// compresses and amplitude decays with depth. ROUND 67 — SMOOTH GRADIENT
// REBUILD. The round-62 value-noise grain read as low-res/pixelated; it is
// removed entirely (no per-pixel noise texture). What stays is the DEPTH
// GRADIENT — the valued element — a vertical falloff from darker near the
// bottom easing up into a lighter haze band, with smooth sinuous luminance
// WAVES riding within it: layered sine bands with soft (gaussian-like)
// falloff, no edges to alias. A sub-LSB ordered dither (±1/255 — invisible as
// texture, NOT grain) breaks up 8-bit gradient banding so the falloff stays
// smooth on high-DPI with no stair-stepping. Greyscale only (R=G=B, zero
// chroma — navy stays chart-only); crests ~0.24 so SEVERITY STILL OUT-READS.
// Amplitude/cadence still bound to the dataset (round 50). Premultiplied alpha.
const FRAG_GRADIENT = `precision mediump float;
uniform vec2 u_res; uniform float u_time; uniform float u_amp; uniform float u_freq;
uniform float u_waveAmp;   // round 74: wave luminance amplitude/contrast (dev slider)
uniform float u_texDens;   // round 74: fine-texture density, 0 = off (dev slider)
uniform float u_texBright; // round 74: fine-texture brightness (dev slider)
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0,0.0)), c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float v = uv.y;
  float depth = v / max(0.04, 1.04 - v);
  float drift = u_time * 0.45;
  // smooth sinuous swell — three sine octaves, dataset-bound amp/freq (round 50)
  float w = sin(depth * (4.0 + 6.0*u_freq) + uv.x*2.0 - drift);
  w += 0.50 * sin(depth * (7.0 + 9.0*u_freq) - uv.x*3.4 - drift*1.6);
  w += 0.28 * sin(depth * 2.4 + uv.x*1.0 + drift*0.55);
  // ROUND 74: slower depth decay so the wave FORM persists up the plane (round
  // 67 over-smoothing flattened it into a vertical fade); the depth floor is kept
  // narrow so the waves, not the fade, carry the read.
  float amp = u_amp * exp(-depth * 0.22);
  float wave = 0.5 * w * amp;
  float depthLum = mix(0.05, 0.15, smoothstep(0.0, 0.92, v));
  float lum = depthLum + wave * u_waveAmp; // u_waveAmp = wave amplitude/contrast (dev slider)
  // ROUND 74 — DENSE fine texture riding ON the wave form (replaces the too-faint
  // round-72 shimmer; still NOT the coarse round-62 grain). Screen-space
  // value-noise at ~2px cells (fine, smooth-interpolated so no blocks/aliasing),
  // two drifting octaves, gated to glints that concentrate on the wave CRESTS and
  // near foreground so texture and form REINFORCE (surface detail on moving water,
  // not a flat wash). u_texDens lowers the glint threshold (denser, higher count);
  // u_texBright scales the add. Greyscale; dataset-bound (u_amp). 0 dens = off.
  if (u_texDens > 0.001) {
    vec2 sp = gl_FragCoord.xy / 2.0;
    float sh = vnoise(sp + vec2(drift * 2.0, u_time * 1.0)) * 0.55
             + vnoise(sp * 2.0 - u_time * 0.8) * 0.45;
    float crest = smoothstep(-0.05, 0.14, wave);             // ride the wave tops
    float near  = exp(-depth * 0.38);                         // denser in the foreground
    float bind  = 0.5 + 0.5 * clamp(u_amp / 1.3, 0.0, 1.0);   // same signal as the waves
    float thr   = mix(0.82, 0.28, clamp(u_texDens, 0.0, 1.0)); // density lowers the threshold
    lum += smoothstep(thr, thr + 0.16, sh) * crest * near * bind * u_texBright;
  }
  // sub-LSB ordered dither — defeats 8-bit gradient banding, no visible texture
  float dith = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  lum = clamp(lum + dith, 0.0, 1.0);
  vec3 col = vec3(lum); // pure grey
  float alpha = smoothstep(0.96, 0.26, v);
  gl_FragColor = vec4(col * alpha, alpha);
}`;

// ROUND 75 — PARTICLE FIELD: an ENTIRELY different rendering model. The wave is
// not painted as a gradient; it is built from DISCRETE marks (points + short
// line segments) sampled on a screen-space lattice. Marks AMASS on the wave
// crests (present-probability rises with crest) and are DISPLACED upward by the
// wave, so the form emerges from the field of marks, not a luminance fade —
// reading as measured/sampled water. Motion comes from the marks shifting
// (jitter drift + crest displacement). Greyscale, premultiplied; recession =
// finer cells toward the top, fading into haze. Dataset-bound via u_amp/u_freq;
// u_texDens = mark density, u_waveAmp = displacement, u_texBright = mark luminance.
const FRAG_PARTICLE = `precision mediump float;
uniform vec2 u_res; uniform float u_time; uniform float u_amp; uniform float u_freq;
uniform float u_waveAmp; uniform float u_texDens; uniform float u_texBright;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float vY = uv.y;
  float depth = vY / max(0.04, 1.04 - vY);
  float drift = u_time * 0.5;
  // the wave FIELD (places + displaces the marks; never drawn directly)
  float amp = u_amp * exp(-depth * 0.22);
  float w = sin(depth * (4.0 + 6.0*u_freq) + uv.x*2.0 - drift)
          + 0.5 * sin(depth * (7.0 + 9.0*u_freq) - uv.x*3.4 - drift*1.6);
  float wave = 0.5 * w * amp;
  float crest = smoothstep(-0.05, 0.13, wave);
  // screen-space lattice — finer cells toward the back (recession)
  float cell = mix(9.0, 22.0, vY);
  vec2 gid = floor(gl_FragCoord.xy / cell);
  float dens = (0.34 + 0.5 * crest) * clamp(u_texDens, 0.0, 1.3);
  float disp = wave * cell * (5.0 * u_waveAmp + 0.8); // crest displacement (form)
  // search a 3×3 cell neighborhood: marks (jittered + displaced ~a cell) and the
  // short line segments cross cell borders, so a single-cell lookup misses them.
  float acc = 0.0;
  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      vec2 cid = gid + vec2(float(dx), float(dy));
      float h = hash(cid), h2 = hash(cid + 7.13);
      vec2 jit = (vec2(h, h2) - 0.5) * cell * 0.55
               + vec2(sin(drift + h*6.28), cos(drift*0.8 + h2*6.28)) * cell * 0.13;
      vec2 mark = (cid + 0.5) * cell + vec2(jit.x, jit.y - disp);
      float present = step(h2, dens); // amass on crests (denser where crest high)
      vec2 dpx = gl_FragCoord.xy - mark;
      // ROUND 77: a simple round dot — NOT a point+line (the round-75 dash read as
      // a directional chevron/fish tiled across the field). Neutral points only.
      float dot = smoothstep(2.1, 0.7, length(dpx));
      acc = max(acc, dot * present);
    }
  }
  float fade = smoothstep(0.98, 0.26, vY);
  float lum = acc * u_texBright * 2.9 * fade * (0.6 + 0.6 * crest);
  gl_FragColor = vec4(vec3(lum), lum);
}`;

// ROUND 77 — DOT FLOW FIELD (the dot-based water, rebuilt from the static lattice
// into a FLOW FIELD per the envato reference, colour stripped to white/greyscale).
// A DENSE, FINE field of dots whose brightness + size CONCENTRATE on the wave
// crests: the crest ridges read as bright dense flowing lines of dots, the troughs
// go dark and sparse — the wave FORM is described by where the dots pack, and as
// the wave drifts the ridges travel (the "flow"). Per-dot MAGNIFICATION on the
// crest (Anthony's keeper) compounds it: crest dots swell + brighten, trough dots
// shrink + dim. u_flow = ridge sharpness (how tightly dots pack onto the crest).
// Perspective recession kept (foreground looser/larger, back denser/finer,
// dissolving to haze at top — NO horizon, NO sky). Single-cell lookup → O(1) per
// pixel, density is FREE (finer lattices cost nothing). Greyscale/white only;
// FREQUENCY/amplitude delta-bound (u_freq/u_amp, round 50); ridges are the
// brightest points but the thin lit area keeps it subordinate to severity.
const FRAG_MATRIX = `precision mediump float;
uniform vec2 u_res; uniform float u_time; uniform float u_amp; uniform float u_freq;
uniform float u_waveAmp; uniform float u_texBright; uniform float u_dotSize; uniform float u_dotSpace; uniform float u_mag; uniform float u_flow;
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float vY = uv.y;
  float drift = u_time * 0.5;
  float P = 2.0;
  float rows = max(8.0, u_dotSpace);
  float row = floor(pow(clamp(vY, 0.0, 1.0), P) * rows);
  float rowPy = (row + 0.5) / rows;            // row center in perspective space
  float rowV = pow(rowPy, 1.0 / P);            // → screen v (rows bunch toward top)
  float rec = mix(1.0, 0.22, rowPy);           // recession: looser/larger front → denser/finer back
  float colStep = (0.85 / rows) * mix(1.0, 0.5, rowPy); // FINE columns (dense), converge toward top
  float colCenter = (floor(uv.x / colStep) + 0.5) * colStep;
  // wave at this dot; FREQUENCY/amplitude delta-bound; drift travels the ridges
  float ph = rowPy * (10.0 + 22.0 * u_freq) + colCenter * 7.0 - drift * (1.0 + u_freq);
  float wv = sin(ph);
  float crest = 0.5 + 0.5 * wv;                // 0 trough → 1 crest
  // FLOW: dots concentrate on the crest ridges; sharpness packs them onto a thin
  // band (high u_flow = tight bright ridge lines, low = broad field)
  float ridge = pow(crest, 1.0 + u_flow * 9.0);
  // displacement secondary — nudge dots toward the crest so ridges read as lines
  float disp = wv * 0.006 * (u_waveAmp * 4.0 + 0.3) * (0.4 + u_amp);
  vec2 center = vec2(colCenter, rowV + disp);
  vec2 dpx = (uv - center) * u_res.xy;
  // MAGNIFICATION on the crest (kept): swell + brighten on ridges
  float baseR = max(0.5, u_dotSize * rec);
  float radius = baseR * (1.0 + u_mag * 2.4 * crest);
  float dot = smoothstep(radius, radius - 1.2, length(dpx));
  float bright = 0.10 + 0.95 * ridge;          // faint sparse troughs → bright dense ridges
  float fade = smoothstep(0.97, 0.30, vY);      // dissolve into haze at top — no horizon/sky
  // ×4 internal boost: the shared brightness slider reads subtle for the gradient
  // texture but must read as bright ridges here, so the flow default is visible.
  float lum = dot * bright * u_texBright * 4.0 * fade;
  gl_FragColor = vec4(vec3(lum), lum);
}`;

const MODE_FRAG: Record<string, string> = { gradient: FRAG_GRADIENT, particle: FRAG_PARTICLE, matrix: FRAG_MATRIX };

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
  return s;
}

export function AmbientSea() {
  const { fleet, ambientSea, shimmer, waveAmp, texDens, texBright, waterMode, dotSize, dotSpace, mag, flow } = useFleet();
  const { expertOn } = useLearn();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false); // no WebGL / context fail → static still
  const [reduced, setReduced] = useState(false);

  // live inputs in a ref so the rAF loop reads them without re-subscribing.
  // round 74: waveAmp/texDens/texBright are dev sliders; the shimmer toggle
  // gates the texture (off → density 0).
  const inputs = useRef({ amp: 0.4, freq: 1, waveAmp: 0.34, texDens: 0.7, texBright: 0.11, dotSize: 1.4, dotSpace: 72, mag: 1.0, flow: 0.5 });
  const { scope, vesselId } = waterScope(pathname);
  const target = waterInputs(fleet ?? null, scope, vesselId);
  useEffect(() => {
    inputs.current = { amp: target.amp, freq: target.freq, waveAmp, texDens: shimmer ? texDens : 0, texBright, dotSize, dotSpace, mag, flow };
  }, [target.amp, target.freq, shimmer, waveAmp, texDens, texBright, dotSize, dotSpace, mag, flow]);

  const on = ambientSea && !expertOn;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => setReduced(mq.matches);
    onMq(); mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  useEffect(() => {
    if (!on) return; // expert-off / toggled off → no canvas at all
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' }) as WebGLRenderingContext | null;
    if (!gl) { setFallback(true); return; }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, MODE_FRAG[waterMode] ?? FRAG_GRADIENT);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) { setFallback(true); return; }
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFallback(true); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // fullscreen triangle
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uAmp = gl.getUniformLocation(prog, 'u_amp');
    const uFreq = gl.getUniformLocation(prog, 'u_freq');
    const uWaveAmp = gl.getUniformLocation(prog, 'u_waveAmp');
    const uTexDens = gl.getUniformLocation(prog, 'u_texDens');
    const uTexBright = gl.getUniformLocation(prog, 'u_texBright');
    const uDotSize = gl.getUniformLocation(prog, 'u_dotSize');
    const uDotSpace = gl.getUniformLocation(prog, 'u_dotSpace');
    const uMag = gl.getUniformLocation(prog, 'u_mag');
    const uFlow = gl.getUniformLocation(prog, 'u_flow');

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const resize = () => {
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let amp = inputs.current.amp, freq = inputs.current.freq; // eased render values
    const t0 = performance.now();
    const onLost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf); setFallback(true); };
    canvas.addEventListener('webglcontextlost', onLost);

    const paint = (tSec: number, ampV: number, freqV: number) => {
      gl.uniform1f(uTime, tSec);
      gl.uniform1f(uAmp, ampV);
      gl.uniform1f(uFreq, freqV);
      gl.uniform1f(uWaveAmp, inputs.current.waveAmp);
      gl.uniform1f(uTexDens, inputs.current.texDens);
      gl.uniform1f(uTexBright, inputs.current.texBright);
      gl.uniform1f(uDotSize, inputs.current.dotSize);
      gl.uniform1f(uDotSpace, inputs.current.dotSpace);
      gl.uniform1f(uMag, inputs.current.mag);
      gl.uniform1f(uFlow, inputs.current.flow);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const cleanup = () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onLost);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    };

    // ROUND 74: reduced-motion freezes to a TEXTURED still — render ONE frame at
    // a mid-motion time so the wave FORM + texture are visible (not a flat
    // gradient), then stop. No rAF loop.
    if (reduced) { paint(6.0, inputs.current.amp, inputs.current.freq); return cleanup; }

    const frame = () => {
      if (document.hidden) { raf = requestAnimationFrame(frame); return; } // Page Visibility — free perf
      // ease toward the current scope's inputs (no cut on fleet↔vessel)
      amp += (inputs.current.amp - amp) * 0.02;
      freq += (inputs.current.freq - freq) * 0.02;
      paint((performance.now() - t0) / 1000, amp, freq);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => { cancelAnimationFrame(raf); cleanup(); };
  }, [on, reduced, waterMode]);

  if (!on) return null;

  // z-index:-1 → above the body background, below all content (no per-page
  // wrappers); page bg shows through where the plane dissolves
  const base: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' };

  // ROUND 74: reduced-motion now renders the CANVAS too — a single frozen frame
  // showing the wave FORM + texture (painted once in the effect, no loop), not a
  // flat gradient. Only the WebGL-unavailable FALLBACK uses the CSS gradient still
  // (no shader possible). No layout shift (same fixed layer either way).
  if (fallback) {
    return (
      <div aria-hidden style={{ ...base, background: 'linear-gradient(to top, rgba(122,124,127,0.18) 0%, rgba(122,124,127,0.09) 35%, transparent 64%)' }} />
    );
  }
  // key per (waterMode + still/live): switching mode or reduced-motion remounts a
  // FRESH canvas, so the prior context's loseContext() (cleanup hygiene) never
  // leaves a dead canvas for the next getContext() (round 74/75 context-loss fix).
  return <canvas key={`${waterMode}-${reduced ? 'still' : 'live'}`} ref={canvasRef} aria-hidden style={base} />;
}
