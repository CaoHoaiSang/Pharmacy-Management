import React, { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");
  const [position, setPosition] = useState({ y: 200 });
  const [isHidden, setIsHidden] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
    }
  }, [darkMode]);

  const handleMouseDown = (event) => {
    if (event.target.closest(".toggle-main") || event.target.closest(".arrow-btn")) {
      if (event.target.classList.contains("floating-toggle-container")) {
        setIsDragging(true);
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isDragging) {
        return;
      }

      const newY = Math.max(0, Math.min(event.clientY - 25, window.innerHeight - 60));
      setPosition({ y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className={`floating-toggle-container ${isHidden ? "hidden" : ""} ${isDragging ? "dragging" : ""}`}
      style={{ top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
    >
      <button className="arrow-btn" onClick={() => setIsHidden(!isHidden)}>
        {isHidden ? "❮" : "❯"}
      </button>

      <div className="toggle-main" onClick={() => setDarkMode(!darkMode)} title="Đổi giao diện">
        <span className="icon">{darkMode ? "☀️" : "🌙"}</span>
      </div>
    </div>
  );
};

export default DarkModeToggle;
