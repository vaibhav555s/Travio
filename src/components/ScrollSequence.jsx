import { useEffect, useRef, useState } from 'react'
import './ScrollSequence.css'

const TOTAL_FRAMES = 181
const FRAME_STEP = 2 // Skip every Nth frame (e.g. 2 means load 0, 2, 4...)
const RENDER_FRAMES = Math.floor(TOTAL_FRAMES / FRAME_STEP)

// Preload cache in global scope so we don't re-download if unmounted
const framesCache = []

const ScrollSequence = ({ children }) => {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const [loaded, setLoaded] = useState(0)

    // Animation state
    const currentFrameRef = useRef(0)
    const targetFrameRef = useRef(0)
    const isAnimating = useRef(false)

    // Preload frames
    useEffect(() => {
        if (framesCache.length === RENDER_FRAMES) {
            setLoaded(RENDER_FRAMES)
            drawFrame(0)
            return
        }

        let loadedCount = 0
        for (let i = 0; i < RENDER_FRAMES; i++) {
            const actualFrameNumber = i * FRAME_STEP
            const img = new Image()
            img.src = `/sequence/frame_${String(actualFrameNumber).padStart(3, '0')}.png`
            img.onload = () => {
                loadedCount++
                setLoaded(loadedCount)
                if (i === 0) drawFrame(0)
            }
            framesCache[i] = img
        }
    }, [])

    const drawFrame = (index) => {
        if (!framesCache[index] || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const img = framesCache[index]

        if (img.width === 0 || img.height === 0) return

        // Ensure canvas resolution matches display size exactly
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Calculate aspect ratio to perfectly "cover" the canvas (like object-fit: cover)
        const canvasRatio = canvas.width / canvas.height
        const imgRatio = img.width / img.height

        let drawWidth = canvas.width
        let drawHeight = canvas.height
        let offsetX = 0
        let offsetY = 0

        if (canvasRatio > imgRatio) {
            drawHeight = canvas.width / imgRatio
            offsetY = (canvas.height - drawHeight) / 2
        } else {
            drawWidth = canvas.height * imgRatio
            offsetX = (canvas.width - drawWidth) / 2
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
    }

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => drawFrame(0)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [loaded])

    // Auto-Play Animation Loop
    const animateToTarget = () => {
        if (!isAnimating.current) return

        const current = currentFrameRef.current
        const target = targetFrameRef.current

        // Spring ease towards target
        const diff = target - current
        const step = diff * 0.1 // 10% closing speed per frame for smooth ease

        if (Math.abs(diff) < 0.5) {
            currentFrameRef.current = target
            drawFrame(target)
            isAnimating.current = false
            return
        }

        currentFrameRef.current += step
        drawFrame(Math.floor(currentFrameRef.current))
        requestAnimationFrame(animateToTarget)
    }

    // Trigger on scroll wheel
    useEffect(() => {
        const handleWheel = (e) => {
            // Prevent default scroll lock behavior until animation finishes if desired, 
            // but for now, just trigger the animation.
            if (e.deltaY > 0) {
                // Scrolling down -> Play to the end
                targetFrameRef.current = RENDER_FRAMES - 1
            } else if (e.deltaY < 0) {
                // Scrolling up -> Play to the beginning
                targetFrameRef.current = 0
            }

            if (!isAnimating.current) {
                isAnimating.current = true
                requestAnimationFrame(animateToTarget)
            }
        }

        // Add non-passive listener to allow preventing default if we ever decide to swallow scroll
        window.addEventListener('wheel', handleWheel, { passive: true })

        // Touch support
        let touchStartY = 0
        const handleTouchStart = (e) => touchStartY = e.touches[0].clientY
        const handleTouchMove = (e) => {
            const touchEndY = e.touches[0].clientY
            const deltaY = touchStartY - touchEndY
            if (Math.abs(deltaY) > 10) handleWheel({ deltaY })
        }

        window.addEventListener('touchstart', handleTouchStart, { passive: true })
        window.addEventListener('touchmove', handleTouchMove, { passive: true })

        return () => {
            window.removeEventListener('wheel', handleWheel)
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchmove', handleTouchMove)
        }
    }, [])

    return (
        <div className="scroll-sequence-container" ref={containerRef}>
            <div className="scroll-sequence-sticky">
                <canvas ref={canvasRef} className="scroll-sequence-canvas" />
                <div className="scroll-sequence-overlay" />
                {loaded < RENDER_FRAMES && (
                    <div className="loading-overlay">
                        Preloading assets... {Math.round((loaded / RENDER_FRAMES) * 100)}%
                    </div>
                )}
                <div className="scroll-sequence-content">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default ScrollSequence
