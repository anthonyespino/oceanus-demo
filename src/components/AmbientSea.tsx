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
// compresses and amplitude decays with depth. Luminance held in [0.066,0.085]
// — below the dimmest UI surface fill (surface/raised #181818 = 0.094) — and
// pure grey (R=G=B). Premultiplied alpha; the layer dissolves upward.
const FRAG = `precision mediump float;
uniform vec2 u_res; uniform float u_time; uniform float u_amp; uniform float u_freq;
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float v = uv.y;
  float depth = v / max(0.04, 1.04 - v);
  float drift = u_time * 0.25;
  float w = sin(depth * (5.0 + 7.0*u_freq) + uv.x*2.2 - drift);
  w += 0.55 * sin(depth * (9.0 + 12.0*u_freq) - uv.x*4.5 - drift*1.7);
  w += 0.30 * sin(depth * 3.0 + uv.x*1.1 + drift*0.6);
  float amp = u_amp * exp(-depth * 0.30);
  float shade = clamp(0.5 + 0.5 * w * amp, 0.0, 1.0);
  vec3 col = mix(vec3(0.066), vec3(0.085), shade);
  float alpha = smoothstep(0.92, 0.30, v);
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
  // shift (same fixed layer as the canvas). Luminance stays below surface fill.
  if (reduced || fallback) {
    return (
      <div aria-hidden style={{ ...base, background: 'linear-gradient(to top, rgba(120,122,125,0.07) 0%, rgba(120,122,125,0.03) 35%, transparent 62%)' }} />
    );
  }
  return <canvas ref={canvasRef} aria-hidden style={base} />;
}
