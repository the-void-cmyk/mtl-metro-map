"use client"

import { useEffect, useRef, useCallback } from "react"

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x, -a_position.y) * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision mediump float;
uniform float u_dpr;
uniform sampler2D u_background;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform vec2 u_size;
varying vec2 v_uv;

float roundedBox(vec2 uv, vec2 center, vec2 size, float radius) {
  vec2 q = abs(uv - center) - size + radius;
  return length(max(q, 0.0)) - radius;
}

vec3 blurBackground(vec2 uv, vec2 resolution) {
  vec3 result = vec3(0.0);
  float total = 0.0;
  float radius = 3.0;
  for (int x = -3; x <= 3; x++) {
    for (int y = -3; y <= 3; y++) {
      vec2 offset = vec2(float(x), float(y)) * 2.0 / resolution;
      float weight = exp(-(float(x * x + y * y)) / (2.0 * radius));
      result += texture2D(u_background, uv + offset).rgb * weight;
      total += weight;
    }
  }
  return result / total;
}

float roundedBoxSDF(vec2 p, vec2 b, float r) {
  vec2 d = abs(p) - b + vec2(r);
  return length(max(d, 0.0)) - r;
}

vec2 getNormal(vec2 uv, vec2 center, vec2 size, float radius) {
  vec2 eps = vec2(1.0) / u_resolution * 2.0;
  vec2 p = uv - center;
  float dx = (roundedBoxSDF(p + vec2(eps.x, 0.0), size, radius) - roundedBoxSDF(p - vec2(eps.x, 0.0), size, radius)) * 0.5;
  float dy = (roundedBoxSDF(p + vec2(0.0, eps.y), size, radius) - roundedBoxSDF(p - vec2(0.0, eps.y), size, radius)) * 0.5;
  vec2 gradient = vec2(dx, dy);
  float dxy1 = roundedBoxSDF(p + eps, size, radius);
  float dxy2 = roundedBoxSDF(p - eps, size, radius);
  vec2 diag = vec2(dxy1 - dxy2);
  gradient = mix(gradient, diag, 0.25);
  if (length(gradient) < 0.001) return vec2(0.0);
  return normalize(gradient);
}

void main() {
  vec2 pixelUV = (v_uv * u_resolution) / u_dpr;
  vec2 center = u_center;
  vec2 size = u_size * 0.5;
  vec2 local = (pixelUV - center) / size;
  local.y *= u_resolution.x / u_resolution.y;

  float radius = 20.0;
  float dist = roundedBox(pixelUV, center, size, radius);

  if (dist > 1.0) {
    gl_FragColor = texture2D(u_background, v_uv);
    return;
  }

  float r = clamp(length(local * 1.0), 0.0, 1.0);
  float curvature = pow(r, 1.0);
  vec2 domeNormal = normalize(local) * curvature;
  float eta = 1.0 / 1.5;
  vec2 incident = -domeNormal;
  vec2 refractVec = refract(incident, domeNormal, eta);
  vec2 curvedRefractUV = v_uv + refractVec * 0.03;

  float contourFalloff = exp(-abs(dist) * 0.4);
  vec2 normal = getNormal(pixelUV, center, size, radius);
  vec2 domeNormalContour = normal * pow(contourFalloff, 1.5);
  vec2 refractVecContour = refract(vec2(0.0), domeNormalContour, eta);
  vec2 uvContour = v_uv + refractVecContour * 0.35 * contourFalloff;

  float edgeWeight = smoothstep(0.0, 1.0, abs(dist));
  float radialWeight = smoothstep(0.5, 1.0, r);
  float combinedWeight = clamp((edgeWeight * 1.0) + (-radialWeight * 0.5), 0.0, 1.0);
  vec2 refractUV = mix(curvedRefractUV, uvContour, combinedWeight);

  vec3 refracted = texture2D(u_background, refractUV).rgb;
  vec3 blurred = blurBackground(refractUV, u_resolution);
  vec3 base = mix(refracted, blurred, 0.5);

  float edgeFalloff = smoothstep(0.01, 0.0, dist);
  float verticalBand = 1.0 - smoothstep(-1.5, -0.2, local.y);
  float topShadow = edgeFalloff * verticalBand;
  base = mix(base, vec3(0.0), topShadow * 0.1);

  float edge = 1.0 - smoothstep(0.0, 0.03, dist * -2.0);
  vec3 glow = vec3(0.7);
  vec3 color = mix(base, glow, edge * 0.5);

  gl_FragColor = vec4(color, 0.75);
}
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

interface LiquidGlassProps {
  backgroundSrc: string
  className?: string
  children: React.ReactNode
}

export default function LiquidGlass({ backgroundSrc, className = "", children }: LiquidGlassProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const glRef = useRef<{
    gl: WebGLRenderingContext
    program: WebGLProgram
    u_resolution: WebGLUniformLocation | null
    u_center: WebGLUniformLocation | null
    u_size: WebGLUniformLocation | null
    u_dpr: WebGLUniformLocation | null
  } | null>(null)

  const setup = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const gl = canvas.getContext("webgl", { antialias: true, alpha: true })
    if (!gl) return

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    glRef.current = {
      gl,
      program,
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_center: gl.getUniformLocation(program, "u_center"),
      u_size: gl.getUniformLocation(program, "u_size"),
      u_dpr: gl.getUniformLocation(program, "u_dpr"),
    }

    // Load background texture
    const texture = gl.createTexture()
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = backgroundSrc
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.uniform1i(gl.getUniformLocation(program, "u_background"), 0)
      gl.uniform1f(glRef.current!.u_dpr, window.devicePixelRatio || 1)
      draw()
    }
  }, [backgroundSrc])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const content = contentRef.current
    const ctx = glRef.current
    if (!canvas || !container || !content || !ctx) return

    const { gl, u_resolution, u_center, u_size } = ctx
    const dpr = window.devicePixelRatio || 1

    // Size canvas to container
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = rect.width + "px"
    canvas.style.height = rect.height + "px"
    gl.viewport(0, 0, canvas.width, canvas.height)

    // Get content card position relative to canvas
    const contentRect = content.getBoundingClientRect()
    const centerX = contentRect.left - rect.left + contentRect.width / 2
    const centerY = contentRect.top - rect.top + contentRect.height / 2

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.uniform2f(u_resolution, canvas.width, canvas.height)
    gl.uniform2f(u_center, centerX, centerY)
    gl.uniform2f(u_size, contentRect.width + 40, contentRect.height + 40)
    gl.activeTexture(gl.TEXTURE0)
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    animRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    setup()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [setup])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <div ref={contentRef} className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}
