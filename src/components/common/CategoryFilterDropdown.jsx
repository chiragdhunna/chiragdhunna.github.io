import React, { useEffect, useMemo, useRef, useState } from "react";
import "./CategoryFilterDropdown.css";

function CategoryFilterDropdown({
  categories,
  selected,
  onSelect,
  getCount,
  label = "Filter",
  isActive = false,
  toggleClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRefs = useRef([]);
  const matchesCategory = (left, right) =>
    left?.trim().toLowerCase() === right?.trim().toLowerCase();

  const options = useMemo(
    () => [
      "All",
      ...(categories || []).filter(
        (category) => category.trim().toLowerCase() !== "all",
      ),
    ],
    [categories],
  );

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[focusedIndex]?.focus();
  }, [open, focusedIndex]);

  useEffect(() => {
    if (!open) return;
    const currentIndex = options.findIndex((option) =>
      matchesCategory(option, selected),
    );
    setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [open, options, selected]);

  const handleButtonKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((prev) => !prev);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleMenuKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setFocusedIndex(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(options[focusedIndex]);
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  const buttonLabel = isActive ? `${label}: ${selected}` : label;

  return (
    <div className="filter-dropdown" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`filter-pill filter-dropdown__toggle ${isActive ? "filter-pill--active active" : ""} ${toggleClassName}`.trim()}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="filter-pill__label filter-dropdown__label">{buttonLabel}</span>
      </button>

      {open && (
        <div
          className="filter-dropdown__menu"
          role="menu"
          aria-label={`${label} categories`}
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((category, index) => {
            const active = matchesCategory(selected, category);
            const count = getCount ? getCount(category) : null;

            return (
              <button
                key={category}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                role="menuitem"
                className={`filter-dropdown__item ${active ? "filter-dropdown__item--active" : ""}`}
                onClick={() => {
                  onSelect(category);
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
              >
                <span className="filter-dropdown__item-text" title={category}>
                  {category}
                </span>
                {count !== null && (
                  <span className="filter-dropdown__count">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoryFilterDropdown;
