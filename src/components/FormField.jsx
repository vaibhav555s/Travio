import { MapPinIcon, CalendarIcon } from './SVGIcons'
import './FormField.css'

export const TextInput = ({ label, icon: Icon, placeholder, value, onChange, ...props }) => {
  return (
    <div className="form-field">
      <label className="text-label form-label">{label}</label>
      <div className="input-wrapper">
        {Icon && (
          <div className="input-icon">
            <Icon size={20} color="var(--color-accent)" />
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="form-input"
          {...props}
        />
      </div>
    </div>
  )
}

export const DateInput = ({ label, icon: Icon, value, onChange, ...props }) => {
  return (
    <div className="form-field">
      <label className="text-label form-label">{label}</label>
      <div className="input-wrapper">
        {Icon && (
          <div className="input-icon">
            <Icon size={20} color="var(--color-accent)" />
          </div>
        )}
        <input
          type="date"
          value={value}
          onChange={onChange}
          className="form-input"
          {...props}
        />
      </div>
    </div>
  )
}

export const FormSection = ({ children, title }) => {
  return (
    <div className="form-section">
      {title && <h3 className="text-title form-section-title">{title}</h3>}
      <div className="form-fields-grid">
        {children}
      </div>
    </div>
  )
}
