import './NotebookPage.css'
import homeIcon from '../assets/home.svg'
import editIcon from '../assets/edit.svg'
import fileIcon from '../assets/file.svg'
import bookOpenIcon from '../assets/book-open.svg'
import profileIcon from '../assets/user.svg'
import rightArrowIcon from '../assets/icon-park-outline_right-c.png'
import { useScrapDashboard } from '../hooks/useScrapDashboard.ts'

const tabs = [
  { icon: homeIcon, label: 'HOME' },
  { icon: editIcon, label: 'CLASS' },
  { icon: fileIcon, label: 'PRACTICE' },
  { icon: bookOpenIcon, label: 'NOTEBOOK' },
  { icon: profileIcon, label: 'PROFILE' },
]

interface NotebookPageProps {
  userName?: string
  onOpenGrammarNotebook: () => void
  onOpenVocabulary: () => void
  onOpenHome: () => void
  onOpenClass: () => void
  onOpenPractice: () => void
  onOpenProfile: () => void
}

function NotebookPage({
  userName,
  onOpenGrammarNotebook,
  onOpenVocabulary,
  onOpenHome,
  onOpenClass,
  onOpenPractice,
  onOpenProfile,
}: NotebookPageProps) {
  const { data, loading } = useScrapDashboard()

  const displayName = data?.userName ?? userName ?? ''
  const vocabGroups = data?.vocabularyPreview.groups ?? []
  const grammarItems = data?.grammarPreview ?? []

  return (
    <main className="notebook-screen">
      <section className="notebook-content">
        <h1 className="notebook-title">{`${displayName}'s personal notebook`}</h1>

        <section className="notebook-section">
          <div className="notebook-section-header">
            <h2 className="notebook-section-title">Vocabualry</h2>
            <button
              type="button"
              className="notebook-section-link"
              onClick={onOpenVocabulary}
            >
              see more
            </button>
          </div>

          {loading && vocabGroups.length === 0 ? (
            <p className="notebook-loading">Loading…</p>
          ) : (
            <div className="notebook-card-row">
              {vocabGroups.map((group, index) => (
                <article key={group.courseId} className="notebook-card">
                  <p className="notebook-card-title">{group.courseTitle}</p>
                  <div
                    className={`notebook-card-list ${
                      index % 2 === 0
                        ? 'notebook-card-list-numbered'
                        : 'notebook-card-list-bulleted'
                    }`}
                  >
                    {index % 2 === 0
                      ? group.words.map((word, i) => (
                          <p key={i}>{i + 1}. {word}</p>
                        ))
                      : group.words.map((word, i) => (
                          <p key={i}>
                            <span className="notebook-bullet" aria-hidden="true" />
                            <span>{word}</span>
                          </p>
                        ))}
                  </div>
                  <button type="button" className="notebook-card-link">
                    see more
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="notebook-section notebook-section-grammar">
          <div className="notebook-section-header">
            <h2 className="notebook-section-title">Grammar</h2>
            <button
              type="button"
              className="notebook-section-link"
              onClick={onOpenGrammarNotebook}
            >
              see more
            </button>
          </div>

          {loading && grammarItems.length === 0 ? (
            <p className="notebook-loading">Loading…</p>
          ) : (
            <div className="notebook-grammar-list">
              {grammarItems.map((item) => (
                <article key={item.scrapId} className="notebook-grammar-card">
                  <div className="notebook-grammar-top">
                    <p className="notebook-grammar-course">{item.courseTitle}</p>
                    <span className="notebook-grammar-badge">{item.lessonTitle}</span>
                  </div>
                  <div className="notebook-grammar-bottom">
                    <p className="notebook-grammar-topic">{item.grammarPoint}</p>
                  </div>
                  <img
                    src={rightArrowIcon}
                    alt=""
                    aria-hidden="true"
                    className="notebook-grammar-arrow"
                  />
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <nav className="notebook-bottom-nav">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`notebook-tab ${tab.label === 'NOTEBOOK' ? 'notebook-tab-active' : ''}`}
            onClick={() => {
              if (tab.label === 'HOME') {
                onOpenHome()
              }

              if (tab.label === 'CLASS') {
                onOpenClass()
              }

              if (tab.label === 'PRACTICE') {
                onOpenPractice()
              }

              if (tab.label === 'PROFILE') {
                onOpenProfile()
              }
            }}
          >
            <img className="notebook-tab-icon" src={tab.icon} alt="" aria-hidden="true" />
            <span className="notebook-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  )
}

export default NotebookPage
