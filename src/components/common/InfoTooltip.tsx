import { useState, useEffect, useRef } from 'react'
import { Info, X } from 'lucide-react'

interface InfoTooltipProps {
  title: string
  content: string
  bullets?: string[]
  className?: string
}

export function InfoTooltip({ title, content, bullets, className = '' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // モバイル判定
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    // 外側クリックで閉じる
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    // Escキーで閉じる
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen])

  const handleMouseEnter = () => {
    if (isMobile) return
    // 200ms遅延でツールチップを表示
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(true)
    }, 200)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }
    setIsOpen(false)
  }

  const handleClick = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
    }
  }

  const handleFocus = () => {
    if (!isMobile) {
      handleMouseEnter()
    }
  }

  const handleBlur = () => {
    if (!isMobile && timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={title}
        aria-expanded={isOpen}
      >
        <Info className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          className="absolute z-50 w-[360px] mt-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0"
          role="tooltip"
          onMouseEnter={() => {
            if (timeoutRef.current !== null) {
              window.clearTimeout(timeoutRef.current)
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-left">
            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              {isMobile && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
                  aria-label="閉じる"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 本文 */}
            <p className="text-xs text-gray-700 leading-relaxed mb-3">
              {content}
            </p>

            {/* 箇条書き */}
            {bullets && bullets.length > 0 && (
              <ul className="text-xs text-gray-700 space-y-1.5">
                {bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-1.5 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* 三角形の矢印 */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0">
              <div className="w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
