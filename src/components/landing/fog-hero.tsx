'use client';

/* eslint-disable @next/next/no-img-element --
   The scene stacks masked, blurred and cut-out layers that must share one exact
   object-position, so they are plain <img> elements served from /public/hero. */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import styles from './fog-hero.module.css';

/** Milliseconds the house takes to sink into the fog, then to rise back out. */
const SINK = 240;
const RISE = 820;
/** How far the house sinks, as a fraction of the hero height. */
const DEPTH = 0.27;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const VERTEX_SHADER = `#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}`;

// R = canvas size, T = seconds, S = surge (0..1), K = night amount (0..1).
const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform vec2 R;uniform float T,S,K;out vec4 O;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;mat2 m=mat2(1.6,1.2,-1.2,1.6);p=mat2(.8,.6,-.6,.8)*p+5.3;for(int i=0;i<5;i++){s+=a*n(p);p=m*p;a*=.5;}return s;}
void main(){
  vec2 uv=gl_FragCoord.xy/R;uv.y=1.-uv.y;
  float asp=R.x/R.y;vec2 p=vec2(uv.x*asp,uv.y);
  float t=T*.05;
  vec2 w=vec2(fbm(p*1.3+vec2(t,-t*.6)),fbm(p*1.3+vec2(-t*.8,t)+7.));
  float d=fbm(p*1.9+w*1.7+vec2(t*1.6,-t*1.1+S*.5));
  float e=fbm(p*.9-w+vec2(-t,t*.5)+3.);
  float low=smoothstep(.70,1.04,uv.y+(d-.5)*.34);
  float side=smoothstep(.2,.0,uv.x+(e-.5)*.28)+smoothstep(.8,1.,uv.x+(e-.5)*.28);
  side*=smoothstep(.25,.6,uv.y)*.2;
  float wisps=smoothstep(.5,.78,d)*smoothstep(.22,.5,uv.y)*smoothstep(.86,.6,uv.y)*.18;
  float rest=clamp(low+side+wisps,0.,1.);
  float front=1.02-S*.68;
  float rise=smoothstep(front-.02,front+.26,uv.y+(d-.5)*.5);
  float haze=S*(.3+.46*d);
  float a=clamp(max(rest,max(rise*.97,haze)),0.,1.);
  vec3 dayA=vec3(.97,.93,.84),dayB=vec3(.79,.78,.71);
  vec3 nitA=vec3(.40,.45,.57),nitB=vec3(.15,.19,.29);
  vec3 c=mix(mix(dayB,dayA,d*1.15),mix(nitB,nitA,d*1.1),K);
  float porch=exp(-dot((uv-vec2(.72,.74))*vec2(1.7,2.6),(uv-vec2(.72,.74))*vec2(1.7,2.6))*3.2);
  c=mix(c,vec3(.86,.55,.27),K*porch*.42*(1.-S));
  O=vec4(c*a,a);
}`;

type TimeOfDay = 0 | 1; // 0 = morning, 1 = night

interface FogHeroProps {
  isBn: boolean;
  onToggleLocale: () => void;
  onContact: () => void;
}

export function FogHero({ isBn, onToggleLocale, onContact }: FogHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pickRef = useRef<(n: TimeOfDay) => void>(() => {});
  // Mirrors the scene's target only for aria-pressed; the scene itself runs outside React.
  const [night, setNight] = useState<TimeOfDay>(1);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });

    let program: WebGLProgram | null = null;
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    if (gl) {
      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(shader));
        }
        return shader;
      };
      program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
      gl.linkProgram(program);
      gl.useProgram(program);
      for (const name of ['R', 'T', 'S', 'K']) {
        uniforms[name] = gl.getUniformLocation(program, name);
      }
    }

    // The fog renders at 960px wide at most; CSS upscales it.
    const size = () => {
      if (!gl) return;
      const w = Math.round(Math.min(hero.clientWidth, 960));
      const h = Math.round((w * hero.clientHeight) / Math.max(hero.clientWidth, 1));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    size();
    window.addEventListener('resize', size);

    let target: TimeOfDay = 1;
    let from = 1;
    let start = -1e9;
    let queued: TimeOfDay | null = null;
    let swapped = true;
    let k = 1;
    let animating = false;
    let clock = 0;

    const show = (n: TimeOfDay) => {
      hero.dataset.set = n ? 'night' : 'morning';
    };

    const begin = (n: TimeOfDay, now: number) => {
      target = n;
      from = k;
      start = now;
      swapped = false;
      animating = true;
    };

    pickRef.current = (n) => {
      if (n === target && queued === null) return;
      if (calm) {
        target = n;
        k = n;
        show(n);
        return;
      }
      // A click during the animation is queued and runs next.
      if (animating) queued = n;
      else begin(n, clock);
    };

    const frame = (now: number) => {
      clock = now;
      const d = now - start;
      let y = 0;
      let surge = 0;
      let dip = 0;
      let k2 = k;
      if (animating) {
        if (d < SINK) {
          const x = d / SINK;
          y = x * x * (3 - 2 * x) * DEPTH;
        } else {
          // Swap the house at the deepest point, while fog covers the roof.
          if (!swapped) {
            swapped = true;
            show(target);
          }
          const x = clamp((d - SINK) / RISE);
          y = Math.pow(1 - x, 3.4) * DEPTH;
        }
        surge = smooth(0, SINK * 0.92, d) * (1 - smooth(SINK + 70, SINK + RISE * 0.92, d));
        dip = smooth(30, 190, d) * (1 - smooth(330, 720, d));
        k = from + (target - from) * smooth(120, 520, d);
        k2 = from + (target - from) * smooth(340, 760, d);
        if (d >= SINK + RISE) {
          animating = false;
          k = k2 = target;
          y = surge = dip = 0;
          if (queued !== null && queued !== target) {
            const next = queued;
            queued = null;
            begin(next, now);
          } else {
            queued = null;
          }
        }
      }
      hero.style.setProperty('--sink', `${(y * hero.clientHeight).toFixed(1)}px`);
      hero.style.setProperty('--k', k.toFixed(3));
      hero.style.setProperty('--k2', k2.toFixed(3));
      hero.style.setProperty('--dip', dip.toFixed(3));
      if (gl) {
        gl.uniform2f(uniforms.R, canvas.width, canvas.height);
        gl.uniform1f(uniforms.T, calm ? 0 : now / 1000);
        gl.uniform1f(uniforms.S, surge);
        gl.uniform1f(uniforms.K, k);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };

    // Run the clock only while the hero is on screen.
    let raf = 0;
    const loop = (now: number) => {
      frame(now);
      raf = requestAnimationFrame(loop);
    };
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(loop);
    });
    observer.observe(hero);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', size);
      pickRef.current = () => {};
      if (gl && program) gl.deleteProgram(program);
    };
  }, []);

  const choose = (n: TimeOfDay) => {
    setNight(n);
    pickRef.current(n);
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      data-set="night"
      className={`${styles.hero} ${isBn ? styles.bn : ''}`}
    >
      <div className={`${styles.layer} ${styles.sky}`}>
        <img alt="" src="/hero/sky-morning.webp" />
        <img alt="" src="/hero/sky-night.webp" className={styles.skyNight} />
      </div>

      <div className={`${styles.layer} ${styles.home}`}>
        <div className={`${styles.set} ${styles.setMorning}`}>
          <div className={`${styles.layer} ${styles.ground}`}>
            <img alt="" src="/hero/ground-morning.webp" />
          </div>
          <div className={styles.layer}>
            <img alt="A modern home in soft morning light" src="/hero/house-morning.webp" />
          </div>
        </div>
        <div className={`${styles.set} ${styles.setNight}`}>
          <div className={`${styles.layer} ${styles.ground}`}>
            <img alt="" src="/hero/ground-night.webp" />
          </div>
          <div className={styles.layer}>
            <img
              alt="The same home at dusk with warm lit windows"
              src="/hero/house-night.webp"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>

      <div className={styles.tilt} />
      <canvas ref={canvasRef} className={styles.fog} aria-hidden="true" />
      <div className={styles.seam} aria-hidden="true" />

      <div className={styles.ui}>
        <header className={styles.bar}>
          <Link className={styles.logo} href="#hero" aria-label="BariVara">
            <img src="/logo.png" alt="" />
            BARIVARA
          </Link>

          <ul className={styles.links}>
            <li>
              <a href="#process">{isBn ? 'পদ্ধতি' : 'How It Works'}</a>
            </li>
            <li>
              <a href="#properties">{isBn ? 'কোর ফিচার' : 'Features'}</a>
            </li>
            <li>
              <a href="#testimonials">{isBn ? 'অভিজ্ঞতা' : 'Reviews'}</a>
            </li>
            <li>
              <a href="#blog">{isBn ? 'ব্লগ ও গাইড' : 'Guides'}</a>
            </li>
            <li>
              <a href="#cta">{isBn ? 'যোগাযোগ' : 'Contact'}</a>
            </li>
          </ul>

          <div className={styles.side}>
            <button
              type="button"
              onClick={onToggleLocale}
              aria-label="Switch Language"
              className={styles.sideLink}
            >
              <Globe aria-hidden="true" />
              <span>{isBn ? 'English' : 'বাংলা'}</span>
            </button>
            <Link href="/login" className={`${styles.sideLink} ${styles.signIn}`}>
              {isBn ? 'লগ ইন' : 'Sign In'}
            </Link>
            <button type="button" onClick={onContact} className={styles.cta}>
              {isBn ? 'যোগাযোগ করুন' : 'Get in Touch'}
            </button>
          </div>
        </header>

        <h1 className={styles.title}>
          <span className={styles.l1}>{isBn ? 'কাগজের খাতা আর নয়' : 'No More Paper Khata'}</span>
          <span>
            <i>{isBn ? 'আপনার' : 'for your'}</i>{' '}
            <span className={styles.y}>{isBn ? '১–১৫টি ফ্ল্যাটের জন্য' : '1–15 Flats'}</span>
          </span>
        </h1>

        <div className={styles.dock}>
          <div
            className={styles.toggle}
            role="group"
            aria-label={isBn ? 'দিনের সময়' : 'Time of day'}
          >
            <button
              type="button"
              className={styles.morningBtn}
              aria-pressed={night === 0}
              onClick={() => choose(0)}
            >
              <b>{isBn ? 'সকাল' : 'Morning'}</b>
              <small>{isBn ? 'ভাড়ার নোটিশ পাঠানো হয়' : 'Rent notices go out'}</small>
            </button>
            <button
              type="button"
              className={styles.nightBtn}
              aria-pressed={night === 1}
              onClick={() => choose(1)}
            >
              <b>{isBn ? 'রাত' : 'Night'}</b>
              <small>{isBn ? 'হিসাব মিলে যায়' : 'Books are balanced'}</small>
            </button>
          </div>
          <p className={styles.cap}>
            {isBn
              ? 'ভাড়ার হিসাব, বিদ্যুৎ সাব-মিটার বিল বণ্টন ও বিকাশ/নগদ পেমেন্ট রাখুন এক জায়গায়। ১-ক্লিকে হোয়াটসঅ্যাপ রসিদ পাঠান।'
              : 'Manage rents, split electricity sub-meter bills and reconcile bKash/Nagad payments in one place. Send official WhatsApp receipts in one click.'}
          </p>
        </div>
      </div>
    </section>
  );
}
