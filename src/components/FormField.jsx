import { useRef } from 'react'
import { MapPinIcon, CalendarIcon } from './SVGIcons'
import './FormField.css'

export const TextInput = ({ label, icon: Icon, onIconClick, placeholder, value, onChange, ...props }) => {
  return (
    <div className="form-field">
      <label className="text-label form-label">{label}</label>
      <div className="input-wrapper">
        {Icon && (
          <div
            className="input-icon"
            onClick={onIconClick}
            style={{ cursor: onIconClick ? 'pointer' : 'default' }}
          >
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

export const DateInput = ({ label, value, onChange, ...props }) => {
  const dateRef = useRef(null);
  const displayValue = value ? value.split('-').reverse().join('-') : '';

  return (
    <div className="form-field">
      <label className="text-label form-label">{label}</label>
      <div className="input-wrapper" style={{ position: 'relative' }}>
        <input
          type="text"
          value={displayValue}
          readOnly
          className="form-input"
          placeholder="dd-mm-yyyy"
          style={{ width: '100%' }}
          {...props}
        />
        <input
          ref={dateRef}
          type="date"
          value={value}
          onChange={onChange}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        />
        <div
          style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
          onClick={() => dateRef.current && dateRef.current.showPicker ? dateRef.current.showPicker() : null}
        >
          <CalendarIcon size={20} color="var(--color-accent)" />
        </div>
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
