"use client"

import { useEffect, useRef, useCallback } from "react"

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
uniform sampler2D u_background;
uniform vec2 u_resolution;
uniform vec2 u_center;
uniform vec2 u_size;
uniform vec2 u_imageSize;
uniform float u_scroll;
varying vec2 v_uv;

// Simulate object-fit: cover with parallax scroll offset
vec2 coverUV(vec2 uv, vec2 canvasSize, vec2 imgSize) {
  float canvasAspect = canvasSize.x / canvasSize.y;
  float imgAspect = imgSize.x / imgSize.y;
  vec2 scale = vec2(1.0);
  if (canvasAspect > imgAspect) {
    // Canvas is wider than image: fit width, crop height
    scale.y = imgAspect / canvasAspect;
  } else {
    // Canvas is taller than image: fit height, crop width
    scale.x = canvasAspect / imgAspect;
  }
  vec2 result = (uv - 0.5) * scale + 0.5;
  // Apply parallax: shift image up as user scrolls down
  result.y += u_scroll * 0.15;
  return result;
}

float roundedBoxSDF(vec2 p, vec2 b, float r) {
  vec2 d = abs(p) - b + vec2(r);
  return length(max(d, 0.0)) - r;
}

float roundedBox(vec2 uv, vec2 center, vec2 size, float radius) {
  vec2 q = abs(uv - center) - size + radius;
  return length(max(q, 0.0)) - radius;
}

vec3 blurBg(vec2 uv, vec2 res) {
  vec3 result = vec3(0.0);
  float total = 0.0;
  float rad = 3.0;
  for (int x = -3; x <= 3; x++) {
    for (int y = -3; y <= 3; y++) {
      vec2 off = vec2(float(x), float(y)) * 2.0 / res;
      float w = exp(-(float(x*x + y*y)) / (2.0 * rad));
      result += texture2D(u_background, coverUV(uv + off, u_resolution / u_dpr, u_imageSize)).rgb * w;
      total += w;
    }
  }
  return result / total;
}

vec2 getNormal(vec2 uv, vec2 center, vec2 size, float radius) {
  vec2 eps = vec2(1.0) / u_resolution * 2.0;
  vec2 p = uv - center;
  float dx = (roundedBoxSDF(p + vec2(eps.x, 0.0), size, radius) -
              roundedBoxSDF(p - vec2(eps.x, 0.0), size, radius)) * 0.5;
  float dy = (roundedBoxSDF(p + vec2(0.0, eps.y), size, radius) -
              roundedBoxSDF(p - vec2(0.0, eps.y), size, radius)) * 0.5;
  vec2 gradient = vec2(dx, dy);
  float dxy1 = roundedBoxSDF(p + eps, size, radius);
  float dxy2 = roundedBoxSDF(p - eps, size, radius);
  gradient = mix(gradient, vec2(dxy1 - dxy2), 0.25);
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

  // Outside the glass: show background as-is
  if (dist > 1.0) {
    gl_FragColor = texture2D(u_background, coverUV(v_uv, u_resolution / u_dpr, u_imageSize));
    return;
  }

  // Radial curvature refraction
  float r = clamp(length(local), 0.0, 1.0);
  float curvature = pow(r, 1.0);
  vec2 domeNormal = normalize(local + vec2(0.001)) * curvature;
  float eta = 1.0 / 1.5;
  vec2 refractVec = refract(-domeNormal, domeNormal, eta);
  vec2 curvedUV = v_uv + refractVec * 0.03;

  // Edge contour refraction
  float contourFalloff = exp(-abs(dist) * 0.4);
  vec2 normal = getNormal(pixelUV, center, size, radius);
  vec2 contourNormal = normal * pow(contourFalloff, 1.5);
  vec2 contourRefract = refract(vec2(0.0), contourNormal, eta);
  vec2 contourUV = v_uv + contourRefract * 0.35 * contourFalloff;

  // Blend based on distance from edge
  float edgeWeight = smoothstep(0.0, 1.0, abs(dist));
  float radialWeight = smoothstep(0.5, 1.0, r);
  float combined = clamp(edgeWeight - radialWeight * 0.5, 0.0, 1.0);
  vec2 finalUV = mix(curvedUV, contourUV, combined);

  vec3 refracted = texture2D(u_background, coverUV(finalUV, u_resolution / u_dpr, u_imageSize)).rgb;
  vec3 blurred = blurBg(finalUV, u_resolution);
  vec3 base = mix(refracted, blurred, 0.5);

  // Top shadow
  float edgeFalloff = smoothstep(0.01, 0.0, dist);
  float vertBand = 1.0 - smoothstep(-1.5, -0.2, local.y);
  base = mix(base, vec3(0.0), edgeFalloff * vertBand * 0.1);

  // Edge glow
  float edge = 1.0 - smoothstep(0.0, 0.03, dist * -2.0);
  base = mix(base, vec3(0.7), edge * 0.5);

  gl_FragColor = vec4(base, 0.75);
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

interface Props {
  imageSrc: string
  imageSrcMobile?: string
  imageSrcTablet?: string
  glassTargetId: string
}

function pickImage(desktop: string, tablet?: string, mobile?: string): string {
  if (typeof window === "undefined") return desktop
  const w = window.innerWidth
  if (w < 640 && mobile) return mobile
  if (w < 1024 && tablet) return tablet
  return desktop
}

export default function LiquidGlassHero({ imageSrc, imageSrcMobile, imageSrcTablet, glassTargetId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  const init = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const selectedSrc = pickImage(imageSrc, imageSrcTablet, imageSrcMobile)

    const gl = canvas.getContext("webgl", { antialias: true, alpha: true })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return

    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog))
      return
    }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(prog, "a_position")
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, "u_resolution")
    const uCenter = gl.getUniformLocation(prog, "u_center")
    const uSize = gl.getUniformLocation(prog, "u_size")
    const uDpr = gl.getUniformLocation(prog, "u_dpr")
    const uImageSize = gl.getUniformLocation(prog, "u_imageSize")
    const uScroll = gl.getUniformLocation(prog, "u_scroll")

    const tex = gl.createTexture()
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = selectedSrc

    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.uniform1i(gl.getUniformLocation(prog, "u_background"), 0)
      gl.uniform2f(uImageSize, img.naturalWidth, img.naturalHeight)

      const draw = () => {
        const dpr = window.devicePixelRatio || 1
        const parent = canvas.parentElement
        if (!parent) return

        const parentRect = parent.getBoundingClientRect()
        canvas.width = parentRect.width * dpr
        canvas.height = parentRect.height * dpr
        canvas.style.width = parentRect.width + "px"
        canvas.style.height = parentRect.height + "px"

        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.uniform1f(uDpr, dpr)
        gl.uniform2f(uRes, canvas.width, canvas.height)

        // Parallax: normalize scroll to 0-1 range based on section height
        const scrollY = window.scrollY || window.pageYOffset
        const scrollNorm = Math.min(scrollY / parentRect.height, 1.0)
        gl.uniform1f(uScroll, scrollNorm)

        // Find the glass target element
        const target = document.getElementById(glassTargetId)
        if (target) {
          const tRect = target.getBoundingClientRect()
          // Convert to coordinates relative to the canvas/parent
          const cx = tRect.left - parentRect.left + tRect.width / 2
          const cy = tRect.top - parentRect.top + tRect.height / 2
          gl.uniform2f(uCenter, cx, cy)
          gl.uniform2f(uSize, tRect.width + 24, tRect.height + 24)
        }

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 6)

        rafRef.current = requestAnimationFrame(draw)
      }

      draw()
    }
  }, [imageSrc, imageSrcMobile, imageSrcTablet, glassTargetId])

  useEffect(() => {
    init()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [init])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  )
}
