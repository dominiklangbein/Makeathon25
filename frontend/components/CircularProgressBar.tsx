
import * as React from 'react';
import './CircularProgressBar.css';

const CircularProgressBar = ({ progress }: { progress: number }) => {
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  
  const offset = circumference - (progress / 100) * circumference;

  // Get the color gradient depending on the progress (Red -> Yellow -> Green)
  const getProgressColor = () => {
    const red = Math.max(255 - (progress * 2.5), 0); // decreasing red
    const green = Math.min(progress * 2.5, 255); // increasing green
    const yellow = Math.min(progress * 2.5, 255); // increasing yellowish tint
    return `rgb(${red}, ${yellow}, ${green})`;
  };

  return (
    <div className="progress-container">
      <svg className="circular-progress" width={radius * 2} height={radius * 2}>
        <circle
          className="circular-progress-background"
          cx={radius}
          cy={radius}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="circular-progress-bar"
          cx={radius}
          cy={radius}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: getProgressColor() }}
        />
      </svg>
      <div className="progress-text">{`${progress}%`}</div>
    </div>
  );
};
export default CircularProgressBar;
