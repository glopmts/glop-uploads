import type React from "react"
import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "react-feather"
import "./select.scss"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

export const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value)
  const selectRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Update internal state when value prop changes
  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return

    setSelectedValue(option.value)
    setIsOpen(false)

    if (onChange) {
      onChange(option.value)
    }
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const selectedOption = options.find((option) => option.value === selectedValue)
  const displayValue = selectedOption ? selectedOption.label : placeholder

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleDropdown()
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div className={`custom-select ${isOpen ? "open" : ""} ${disabled ? "disabled" : ""} ${className}`} ref={selectRef}>
      <div
        className="select-trigger"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-haspopup="listbox"
      >
        <span className="select-value">{displayValue}</span>
        <ChevronDown className="select-icon" />
      </div>

      {isOpen && (
        <ul className="select-options" role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              className={`select-option ${option.disabled ? "disabled" : ""} ${option.value === selectedValue ? "selected" : ""}`}
              onClick={() => handleSelect(option)}
              role="option"
              aria-selected={option.value === selectedValue}
              aria-disabled={option.disabled}
              tabIndex={option.disabled ? -1 : 0}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

