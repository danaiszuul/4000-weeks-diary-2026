import { useState } from 'react';
import { getDateKey, parseDateKey, isSameDay } from '../utils/lifeWeeks';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Index (0 = Monday) of the first day of the month, so the grid starts on Monday.
function leadingBlanks(year, month) {
  const jsDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  return (jsDay + 6) % 7;
}

export default function Calendar({ selectedKey, onSelect, markedKeys }) {
  const selectedDate = parseDateKey(selectedKey);
  const today = new Date();

  // Which month the calendar is currently showing.
  const [view, setView] = useState({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth(),
  });

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const blanks = leadingBlanks(view.year, view.month);

  const goMonth = (delta) => {
    const d = new Date(view.year, view.month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
  };

  const cells = [];
  for (let i = 0; i < blanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-5 shadow-2xl">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => goMonth(-1)}
          aria-label="Previous month"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-cyber-cyan hover:bg-white/5 transition-all"
        >
          ‹
        </button>
        <div className="font-mono text-sm text-cyber-cyan tracking-wide">
          {MONTHS[view.month]} {view.year}
        </div>
        <button
          onClick={() => goMonth(1)}
          aria-label="Next month"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-cyber-cyan hover:bg-white/5 transition-all"
        >
          ›
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-mono text-gray-500">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`b-${i}`} />;

          const date = new Date(view.year, view.month, day);
          const key = getDateKey(date);
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const isFuture = date > today && !isToday;
          const hasEntry = markedKeys.has(key);

          return (
            <button
              key={key}
              onClick={() => !isFuture && onSelect(key)}
              disabled={isFuture}
              className={`relative aspect-square rounded-lg text-sm font-mono flex items-center justify-center transition-all
                ${isSelected
                  ? 'bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan'
                  : isToday
                    ? 'border border-cyber-magenta/50 text-cyber-magenta'
                    : 'border border-transparent text-gray-300 hover:bg-white/5'}
                ${isFuture ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {day}
              {hasEntry && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyber-violet" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
