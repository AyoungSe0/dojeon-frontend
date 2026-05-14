import { useEffect, useRef, useState } from 'react'
import './GrammarNotebookPage.css'
import rightArrowIcon from '../assets/icon-park-outline_right-c.png'
import { useGrammarScraps } from '../hooks/useGrammarScraps.ts'
import { useDeleteScrap } from '../hooks/useDeleteScrap.ts'

interface GrammarNotebookPageProps {
  onBack: () => void
}

function GrammarNotebookPage({ onBack }: GrammarNotebookPageProps) {
  const [isRecentSort, setIsRecentSort] = useState(true)
  const { items, loading, loadingMore, hasMore, error, fetchNextPage, refetch } =
      useGrammarScraps()
  const deleteMutation = useDeleteScrap()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    if (!hasMore) return

    const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry?.isIntersecting && !loadingMore) {
            fetchNextPage()
          }
        },
        { rootMargin: '200px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, fetchNextPage])

  const handleDelete = (scrapId: string) => {
    if (pendingDeleteId === scrapId) {
      deleteMutation.mutate(scrapId, {
        onSettled: () => setPendingDeleteId(null),
      })
    } else {
      setPendingDeleteId(scrapId)
    }
  }

  return (
      <main className="grammar-notebook-screen">
        <section className="grammar-notebook-content">
          <header className="grammar-notebook-header">
            <button
                type="button"
                className="grammar-notebook-back"
                onClick={onBack}
                aria-label="뒤로 가기"
            >
              <svg
                  className="grammar-notebook-back-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
              >
                <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="grammar-notebook-title">Grammar</h1>
          </header>

          <div className="grammar-notebook-sort-row">
            <button
                type="button"
                className="grammar-notebook-sort-button"
                onClick={() => setIsRecentSort((prev) => !prev)}
                aria-label="Sort"
            >
              <span>Recently viewed</span>
              <svg
                  className={`grammar-notebook-sort-icon ${isRecentSort ? 'is-recent' : 'is-alt'}`}
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
              >
                <path
                    d="M4.5 6.75L9 11.25L13.5 6.75"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {loading ? (
              <p className="grammar-notebook-status">Loading…</p>
          ) : error ? (
              <div className="grammar-notebook-status">
                <p>{error.message}</p>
                <button type="button" onClick={() => void refetch()}>
                  Retry
                </button>
              </div>
          ) : items.length === 0 ? (
              <p className="grammar-notebook-status">No grammar scraps yet.</p>
          ) : (
              <section className="grammar-notebook-card-list">
                {items.map((scrap) => {
                  const isArmed = pendingDeleteId === scrap.scrapId
                  const isDeleting = deleteMutation.isPending && isArmed

                  return (
                      <article key={scrap.scrapId} className="grammar-notebook-card">
                        <div className="grammar-notebook-card-top">
                          <p className="grammar-notebook-course">{scrap.courseTitle}</p>
                          <span className="grammar-notebook-badge">{scrap.lessonTitle}</span>
                        </div>
                        <div className="grammar-notebook-card-bottom">
                          <p className="grammar-notebook-topic">{scrap.grammarPoint}</p>
                        </div>
                        <img
                            src={rightArrowIcon}
                            alt=""
                            aria-hidden="true"
                            className="grammar-notebook-arrow"
                        />
                        <button
                            type="button"
                            className={`grammar-notebook-delete ${isArmed ? 'is-armed' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(scrap.scrapId)
                            }}
                            disabled={isDeleting}
                            aria-label={isArmed ? 'Confirm delete' : 'Delete scrap'}
                        >
                          {isDeleting ? '…' : isArmed ? '확인' : '×'}
                        </button>
                      </article>
                  )
                })}

                {hasMore && <div ref={sentinelRef} className="grammar-notebook-sentinel" />}

                {loadingMore && <p className="grammar-notebook-status">Loading more…</p>}
              </section>
          )}

          {deleteMutation.error && (
              <p className="grammar-notebook-error">{deleteMutation.error.message}</p>
          )}
        </section>
      </main>
  )
}

export default GrammarNotebookPage