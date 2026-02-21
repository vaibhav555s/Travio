import './StepIndicator.css'

const steps = ['Setup', 'Crew', 'Routes', 'Drive']

export default function StepIndicator({ currentStep = 0 }) {
  return (
    <div className="step-indicator">
      {steps.map((step, idx) => (
        <div key={idx} className="step-item">
          <div
            className={`step-circle ${
              idx < currentStep ? 'complete' : idx === currentStep ? 'active' : 'incomplete'
            }`}
          >
            {idx < currentStep ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6L4.5 9.5L11 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <span>{idx + 1}</span>
            )}
          </div>
          {idx < steps.length - 1 && <div className="step-connector" />}
        </div>
      ))}
      <span className="step-label">{steps[currentStep]}</span>
    </div>
  )
}
