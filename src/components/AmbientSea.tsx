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
const FRAG = `precision mediump float;
uniform vec2 u_res; uniform float u_time; uniform float u_amp; uniform float u_freq;
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float v = uv.y;
  float depth = v / max(0.04, 1.04 - v);
  float drift = u_time * 0.45;
  // smooth sinuous swell — three sine octaves, dataset-bound amp/freq (round 50)
  float w = sin(depth * (4.0 + 6.0*u_freq) + uv.x*2.0 - drift);
  w += 0.50 * sin(depth * (7.0 + 9.0*u_freq) - uv.x*3.4 - drift*1.6);
  w += 0.28 * sin(depth * 2.4 + uv.x*1.0 + drift*0.55);
  float amp = u_amp * exp(-depth * 0.32); // waves decay with depth (recede)
  float wave = 0.5 * w * amp;             // smooth ripple around 0
  // depth gradient floor: darker near the bottom → lighter haze higher up
  float depthLum = mix(0.05, 0.17, smoothstep(0.0, 0.92, v));
  float lum = depthLum + wave * 0.20;
  // sub-LSB ordered dither — defeats 8-bit gradient banding, no visible texture
  float dith = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  lum = clamp(lum + dith, 0.0, 1.0);
  vec3 col = vec3(lum); // pure grey
  float alpha = smoothstep(0.96, 0.26, v);
  gl_FragColor = vec4(col * alpha, alpha);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
  return s;
}

export function AmbientSea() {
  const { fleet, ambientSea } = useFleet();
  const { expertOn } = useLearn();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false); // no WebGL / context fail → static still
  const [reduced, setReduced] = useState(false);

  // live inputs in a ref so the rAF loop reads them without re-subscribing
  const inputs = useRef({ amp: 0.4, freq: 1 });
  const { scope, vesselId } = waterScope(pathname);
  const target = waterInputs(fleet ?? null, scope, vesselId);
  useEffect(() => { inputs.current = { amp: target.amp, freq: target.freq }; }, [target.amp, target.freq]);

  const on = ambientSea && !expertOn;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => setReduced(mq.matches);
    onMq(); mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  useEffect(() => {
    if (!on || reduced) return; // reduced-motion → render the static still (below), no GL loop
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' }) as WebGLRenderingContext | null;
    if (!gl) { setFallback(true); return; }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
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

    const frame = () => {
      if (document.hidden) { raf = requestAnimationFrame(frame); return; } // Page Visibility — free perf
      // ease toward the current scope's inputs (no cut on fleet↔vessel)
      amp += (inputs.current.amp - amp) * 0.02;
      freq += (inputs.current.freq - freq) * 0.02;
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform1f(uAmp, amp);
      gl.uniform1f(uFreq, freq);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onLost);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    };
  }, [on, reduced]);

  if (!on) return null;

  // z-index:-1 → above the body background, below all content (no per-page
  // wrappers); page bg shows through where the plane dissolves
  const base: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' };

  // static depth-faded still: reduced-motion or WebGL fallback. Not blank, not
  // the old paper-wave — a grey plane fading up into the page bg. No layout
  // shift (same fixed layer as the canvas). ROUND 62: luminance raised to match
  // the live layer's new presence (greyscale only, severity still out-reads).
  if (reduced || fallback) {
    return (
      <div aria-hidden style={{ ...base, background: 'linear-gradient(to top, rgba(122,124,127,0.18) 0%, rgba(122,124,127,0.09) 35%, transparent 64%)' }} />
    );
  }
  return <canvas ref={canvasRef} aria-hidden style={base} />;
}
