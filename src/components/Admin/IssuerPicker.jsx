import React, { useState, useEffect, useRef, useId, useMemo } from "react";
import {
  canonicalizeIssuer,
  issuerMatches,
  normalizeIssuer,
  DEFAULT_ISSUERS,
} from "../../utils/issuers";
import "./IssuerPicker.css";

function IssuerPicker({
  value = "",
  onChange,
  options = [],
  disabled = false,
  placeholder = "select or type an issuer",
  id,
}) {
  const generatedId = useId();
  const inputId = id || `issuer-input-${generatedId}`;
  const listboxId = `issuer-listbox-${generatedId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter options based on typed input
  const query = normalizeIssuer(value);
  const filteredOptions = useMemo(() => {
    if (!query) return options;
    const lowerQuery = query.toLowerCase();
    return options.filter(
      (opt) =>
        opt.toLowerCase().includes(lowerQuery) || issuerMatches(opt, query)
    );
  }, [options, query]);

  // Determine if typed text is a new issuer not matching any option
  const exactMatchExists = useMemo(() => {
    if (!query) return true;
    return options.some((opt) => issuerMatches(opt, query));
  }, [options, query]);

  // Build items array: filtered options + optional Add entry
  const items = useMemo(() => {
    const list = filteredOptions.map((opt) => ({
      type: "option",
      value: opt,
      label: opt,
      isDefault: DEFAULT_ISSUERS.some((d) => issuerMatches(d, opt)),
    }));

    if (query && !exactMatchExists) {
      list.push({
        type: "add",
        value: canonicalizeIssuer(query, options),
        label: `Add "${query}"`,
      });
    }

    return list;
  }, [filteredOptions, query, exactMatchExists, options]);

  // Keep highlightedIndex in valid bounds
  useEffect(() => {
    if (highlightedIndex >= items.length) {
      setHighlightedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, highlightedIndex]);

  // Outside click / touch listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        if (value) {
          const canonicalized = canonicalizeIssuer(value, options);
          if (canonicalized !== value) {
            onChange(canonicalized);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, value, options, onChange]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeItem = listRef.current.children[highlightedIndex];
    if (activeItem) {
      activeItem.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, highlightedIndex]);

  const selectItem = (item) => {
    const canonicalized = canonicalizeIssuer(item.value, options);
    onChange(canonicalized);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      setHighlightedIndex(0);
    }
  };

  const handleInputBlur = () => {
    // Delay slightly to allow item mousedown/click to fire first
    setTimeout(() => {
      if (!wrapperRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        if (value) {
          const canonicalized = canonicalizeIssuer(value, options);
          if (canonicalized !== value) {
            onChange(canonicalized);
          }
        }
      }
    }, 150);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else if (items.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % items.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(items.length > 0 ? items.length - 1 : 0);
      } else if (items.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    } else if (e.key === "Enter") {
      if (isOpen && items.length > 0) {
        e.preventDefault();
        selectItem(items[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      if (isOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
      }
    } else if (e.key === "Tab") {
      setIsOpen(false);
      if (value) {
        const canonicalized = canonicalizeIssuer(value, options);
        if (canonicalized !== value) {
          onChange(canonicalized);
        }
      }
    }
  };

  const activeDescendantId =
    isOpen && items.length > 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined;

  return (
    <div className="cf-issuer-picker" ref={wrapperRef}>
      <input
        ref={inputRef}
        id={inputId}
        className="cf-input cf-issuer-input"
        type="text"
        name="issuer"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onClick={() => {
          if (!disabled && !isOpen) {
            setIsOpen(true);
            setHighlightedIndex(0);
          }
        }}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendantId}
      />

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          className="cf-issuer-menu"
          role="listbox"
          aria-label="Certification issuers"
          tabIndex={-1}
        >
          {items.length === 0 ? (
            <li className="cf-issuer-empty" role="none">
              no issuers found
            </li>
          ) : (
            items.map((item, index) => {
              const isSelected =
                item.type === "option" && issuerMatches(item.value, value);
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={`${item.type}-${item.value}`}
                  id={`${listboxId}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`cf-issuer-option ${
                    item.type === "add" ? "cf-issuer-option--add" : ""
                  } ${isSelected ? "cf-issuer-option--selected" : ""} ${
                    isHighlighted ? "cf-issuer-option--highlighted" : ""
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectItem(item);
                  }}
                >
                  <span className="cf-issuer-option-text" title={item.label}>
                    {item.label}
                  </span>
                  {item.type === "option" && !item.isDefault && (
                    <span className="cf-issuer-badge">existing</span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

export default IssuerPicker;
