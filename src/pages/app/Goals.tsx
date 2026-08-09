import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useGoalStore } from '../../store/goalStore'
import { useAuthStore } from '../../store/authStore'
import { GoalCard } from '../../components/goals/GoalCard'
import { GoalSheet } from '../../components/goals/GoalSheet'
import { AddFundsModal } from '../../components/goals/AddFundsModal'
import { ConfettiCelebration } from '../../components/ui/ConfettiCelebration'
import { Toast, type ToastType } from '../../components/ui/Toast'
import type { Goal } from '../../types'

export function Goals() {
  const [showGoalSheet, setShowGoalSheet] = useState(false)
  const [fundsTarget, setFundsTarget] = useState<Goal | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const userId = useAuthStore((s) => s.user?.id)

  const goals = useGoalStore((s) => s.goals)
  const fetchGoals = useGoalStore((s) => s.fetchGoals)

  useEffect(() => {
    if (isAuthLoading) return
    setIsLoading(true)
    fetchGoals().finally(() => setIsLoading(false))
  }, [isAuthLoading, userId, fetchGoals])

  const activeGoals = goals.filter((g) => !g.is_completed)
  const completedGoals = goals.filter((g) => g.is_completed)

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <h1 className="text-xl font-semibold text-textprimary">Goals</h1>

      {isAuthLoading || isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {activeGoals.map((g) => (
              <GoalCard key={g.id} goal={g} onClick={() => setFundsTarget(g)} />
            ))}
          </div>

          {goals.length === 0 && (
            <p className="py-6 text-center text-sm text-textsecondary">No goals yet</p>
          )}
        </>
      )}

      {!isAuthLoading && !isLoading && completedGoals.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex min-h-[48px] w-full items-center justify-between rounded-xl bg-card px-4"
          >
            <span className="text-sm font-medium text-textprimary">
              Completed ({completedGoals.length})
            </span>
            <ChevronDown
              size={18}
              className={`text-textsecondary transition-transform ${
                showCompleted ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showCompleted && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {completedGoals.map((g) => (
                <GoalCard key={g.id} goal={g} onClick={() => setFundsTarget(g)} />
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setShowGoalSheet(true)}
        className="min-h-[48px] w-full rounded-lg border-2 border-dashed border-accent/50 py-3 text-sm font-medium text-accent"
      >
        + New Goal
      </button>

      {showGoalSheet && (
        <GoalSheet
          onClose={() => setShowGoalSheet(false)}
          onSaved={() => {
            fetchGoals()
            setToast({ message: 'Goal added', type: 'success' })
          }}
        />
      )}

      {fundsTarget && (
        <AddFundsModal
          goal={fundsTarget}
          onClose={() => setFundsTarget(null)}
          onAdded={(completed) => {
            fetchGoals()
            setFundsTarget(null)
            if (completed) {
              setShowConfetti(true)
            } else {
              setToast({ message: 'Funds added', type: 'success' })
            }
          }}
        />
      )}

      {showConfetti && <ConfettiCelebration onDone={() => setShowConfetti(false)} />}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  )
}
