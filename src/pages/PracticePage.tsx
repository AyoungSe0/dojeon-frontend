import { useMemo, useState } from 'react'
import './PracticePage.css'
import { usePracticeTopics } from '../hooks/usePracticeTopics.ts'
import { usePracticeQuestions } from '../hooks/usePracticeQuestions.ts'
import { useCheckAnswer } from '../hooks/useCheckAnswer.ts'
import type { CheckAnswerData, PracticeTopic } from '../types/practice.types.ts'

interface PracticePageProps {
  onBack: () => void
}

function PracticePage({ onBack }: PracticePageProps) {
  const [selectedTopic, setSelectedTopic] = useState<PracticeTopic | null>(null)

  const handleBack = () => {
    if (selectedTopic) {
      setSelectedTopic(null) // back to topic list
    } else {
      onBack() // back to home
    }
  }

  return (
      <main className="practice-screen">
        <section className="practice-screen-content">
          <header className="practice-screen-header">
            <button
                type="button"
                className="practice-screen-back"
                onClick={handleBack}
                aria-label="뒤로 가기"
            >
              <svg
                  className="practice-screen-back-icon"
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
          </header>

          {selectedTopic ? (
              <QuestionRunner topic={selectedTopic} />
          ) : (
              <TopicList onSelect={setSelectedTopic} />
          )}
        </section>
      </main>
  )
}
function TopicList({ onSelect }: { onSelect: (topic: PracticeTopic) => void }) {
  const { data, loading, error, refetch } = usePracticeTopics()

  if (loading) return <p className="practice-status">Loading…</p>
  if (error) {
    return (
        <div className="practice-status">
          <p>{error.message}</p>
          <button type="button" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
    )
  }

  const topics = data?.topics.filter((t) => t.isActive) ?? []
  if (topics.length === 0) {
    return <p className="practice-status">No practice topics available.</p>
  }

  return (
      <>
        <h1 className="practice-screen-title">Practice</h1>
        <ul className="practice-topic-list">
          {topics.map((topic) => (
              <li key={topic.id}>
                <button
                    type="button"
                    className="practice-topic-item"
                    onClick={() => onSelect(topic)}
                >
                  {topic.titleEn}
                </button>
              </li>
          ))}
        </ul>
      </>
  )
}

function QuestionRunner({ topic }: { topic: PracticeTopic }) {
  const { data, loading, error, refetch } = usePracticeQuestions(topic.id)
  const checkAnswer = useCheckAnswer()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [result, setResult] = useState<CheckAnswerData | null>(null)

  const questions = useMemo(() => data?.questions ?? [], [data])
  const current = questions[currentIndex]

  if (loading) return <p className="practice-status">Loading questions…</p>
  if (error) {
    return (
        <div className="practice-status">
          <p>{error.message}</p>
          <button type="button" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
    )
  }
  if (questions.length === 0) {
    return <p className="practice-status">No questions in this topic.</p>
  }

  // Completed all questions
  if (!current) {
    return (
        <div className="practice-status">
          <h2 className="practice-screen-title">All done!</h2>
          <p>You finished {topic.titleEn}.</p>
        </div>
    )
  }

  const handleSubmit = async () => {
    if (!selectedOption || checkAnswer.isPending) return
    try {
      const data = await checkAnswer.mutateAsync({
        topicId: topic.id,
        payload: { questionId: current.id, userAnswer: selectedOption },
      })
      setResult(data)
    } catch {

    }
  }

  const handleNext = () => {
    setCurrentIndex((i) => i + 1)
    setSelectedOption(null)
    setResult(null)
    checkAnswer.reset()
  }

  const graded = result !== null

  return (
      <section className="practice-question">
        <p className="practice-question-progress">
          {currentIndex + 1} / {questions.length}
        </p>
        <h2 className="practice-question-text">{current.questionText}</h2>

        <ul className="practice-options">
          {current.options.map((option) => {
            const isSelected = selectedOption === option
            const isCorrectAnswer =
                graded && result?.correctAnswer && option === result.correctAnswer
            const isWrongChoice = graded && isSelected && !result?.correct

            let className = 'practice-option'
            if (isSelected && !graded) className += ' selected'
            if (isCorrectAnswer) className += ' correct'
            if (isWrongChoice) className += ' wrong'

            return (
                <li key={option}>
                  <button
                      type="button"
                      className={className}
                      disabled={graded}
                      onClick={() => setSelectedOption(option)}
                  >
                    {option}
                  </button>
                </li>
            )
          })}
        </ul>

        {checkAnswer.error && (
            <p className="practice-error">{checkAnswer.error.message}</p>
        )}

        {graded && result && (
            <div className={`practice-result ${result.correct ? 'is-correct' : 'is-wrong'}`}>
              <p className="practice-result-headline">
                {result.correct ? 'Correct!' : 'Wrong — try the next one.'}
              </p>
              {result.correct && result.explanation && (
                  <p className="practice-result-explanation">{result.explanation}</p>
              )}
            </div>
        )}

        <div className="practice-actions">
          {!graded ? (
              <button
                  type="button"
                  className="practice-submit-btn"
                  disabled={!selectedOption || checkAnswer.isPending}
                  onClick={() => void handleSubmit()}
              >
                {checkAnswer.isPending ? 'Checking…' : 'Submit'}
              </button>
          ) : (
              <button type="button" className="practice-submit-btn" onClick={handleNext}>
                {currentIndex + 1 < questions.length ? 'Next' : 'Finish'}
              </button>
          )}
        </div>
      </section>
  )
}

export default PracticePage