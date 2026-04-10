"use client"

import { useEffect, useRef } from "react"

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x, -a_position.y) * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform float u_dpr;
uniform sampler2D u_snapshot;
uniform vec2 u_resolution;
varying vec2 v_uv;

vec3 blurBg(vec2 uv, vec2 res) {
  vec3 result = vec3(0.0);
  float total = 0.0;
  for (int x = -4; x <= 4; x++) {
    for (int y = -4; y <= 4; y++) {
      vec2 off = vec2(float(x), float(y)) * 1.5 / res;
      float w = exp(-(float(x*x + y*y)) / 6.0);
      result += texture2D(u_snapshot, uv + off).rgb * w;
      total += w;
    }
  }
  return result / total;
}

void main() {
  vec3 blurred = blurBg(v_uv, u_resolution);

  // Slight tint and transparency for glass look
  vec3 tinted = mix(blurred, vec3(1.0), 0.06);

  // Edge highlight at top
  float topEdge = smoothstep(0.0, 0.15, v_uv.y);
  float bottomEdge = 1.0 - smoothstep(0.85, 1.0, v_uv.y);
  float edgeGlow = (1.0 - topEdge) * 0.3 + (1.0 - bottomEdge) * 0.15;
  tinted += vec3(edgeGlow);

  gl_FragColor = vec4(tinted, 0.7);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s))
    return null
  }
  return s
}

export default function NavGlass() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const readyRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const navbar = document.getElementById("main-navbar")
    if (!navbar) return

    const gl = canvas.getContext("webgl", { antialias: true, alpha: true })
    if (!gl) {
      // Fallback: just make navbar have backdrop-filter
      navbar.style.backdropFilter = "blur(16px)"
      navbar.style.background = "rgba(255,255,255,0.08)"
      return
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return

    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(prog, "a_position")
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, "u_resolution")
    const uDpr = gl.getUniformLocation(prog, "u_dpr")
    const tex = gl.createTexture()

    // We'll capture what's behind the navbar using a snapshot approach
    // For the hero page, we capture the hero image; for other pages, capture page content
    const captureAndRender = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = navbar.getBoundingClientRect()

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + "px"
      canvas.style.height = rect.height + "px"

      // Find the hero image or any background content behind the navbar
      const heroImg = document.querySelector("section img") as HTMLImageElement | null

      if (heroImg && heroImg.complete && heroImg.naturalWidth > 0) {
        // Use the hero image as the texture source
        // Calculate which portion of the image is behind the navbar
        const imgRect = heroImg.getBoundingClientRect()

        // Create an offscreen canvas to extract the relevant portion
        const offscreen = document.createElement("canvas")
        offscreen.width = canvas.width
        offscreen.height = canvas.height
        const ctx2d = offscreen.getContext("2d")
        if (ctx2d) {
          // Map navbar position to image coordinates
          const scaleX = heroImg.naturalWidth / imgRect.width
          const scaleY = heroImg.naturalHeight / imgRect.height
          const sx = (rect.left - imgRect.left) * scaleX
          const sy = (rect.top - imgRect.top) * scaleY
          const sw = rect.width * scaleX
          const sh = rect.height * scaleY

          ctx2d.drawImage(heroImg, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

          gl.bindTexture(gl.TEXTURE_2D, tex)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
          readyRef.current = true
        }
      }
    }

    const draw = () => {
      captureAndRender()

      if (readyRef.current) {
        const dpr = window.devicePixelRatio || 1
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.uniform1f(uDpr, dpr)
        gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    // Wait for hero image to load
    const heroImg = document.querySelector("section img") as HTMLImageElement | null
    if (heroImg) {
      if (heroImg.complete) {
        draw()
      } else {
        heroImg.addEventListener("load", draw, { once: true })
      }
    } else {
      // No hero image, use CSS fallback
      navbar.style.backdropFilter = "blur(16px)"
      navbar.style.background = "rgba(255,255,255,0.08)"
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  )
}
