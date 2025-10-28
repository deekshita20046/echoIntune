const LoadingSpinner = ({ size = 'medium', text = '' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`spinner ${sizeClasses[size]}`}></div>
      {text && <p className="text-slate-600 text-sm">{text}</p>}
    </div>
  )
}

export default LoadingSpinner

