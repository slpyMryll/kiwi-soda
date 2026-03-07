interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  let progressColor = "var(--color-progress-low)";
  
  if (progress >= 85) {
    progressColor = "var(--color-progress-high)";
  } else if (progress >= 40) {
    progressColor = "var(--color-progress-mid)";
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs font-bold mb-2">
        <span className="text-gray-700">Progress</span>
        <span style={{ color: progressColor }}>
          {progress}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-500" 
          style={{ 
            width: `${progress}%`, 
            backgroundColor: progressColor 
          }} 
        />
      </div>
    </div>
  );
}