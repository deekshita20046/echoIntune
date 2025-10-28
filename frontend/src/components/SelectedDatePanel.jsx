import { motion } from 'framer-motion'
import { format, isToday } from 'date-fns'
import { Plus, Check, Star, Bell, Edit2, Trash2, Sparkles, Target } from 'lucide-react'

// Task Card Component with Delete/Edit buttons and Important styling
const TaskCard = ({ task, onToggle, onClick, onDelete, onEdit, hasAI, isGoal, showTime }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer group relative
        ${task.is_important 
          ? 'border-2 border-rose-500 bg-gradient-to-br from-rose-50/80 to-pink-50/80 shadow-md' 
          : 'border border-ocean-200 bg-white/70'
        } hover:shadow-md`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className={`mt-0.5 w-5 h-5 rounded-${isGoal ? 'full' : 'md'} border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          task.completed
            ? 'bg-ocean-500 border-ocean-500'
            : 'border-ocean-300 hover:border-ocean-500'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 text-white" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-medium text-sm ${task.completed ? 'line-through text-muted-500' : 'text-ocean-800'}`}>
            {task.title}
          </p>
          {task.is_important && <Star className="w-3 h-3 text-rose-500 fill-rose-500 flex-shrink-0" />}
          {hasAI && (
            <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" title="AI suggestions available" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.task_type === 'goal' && (
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
              <Target className="w-2.5 h-2.5" />
              Goal
            </span>
          )}
          {showTime && task.reminder_time && (
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs px-2.5 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full flex items-center gap-1.5 border border-amber-300 font-semibold shadow-sm"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>🔔 {task.reminder_time}</span>
            </motion.span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            task.priority === 'high' ? 'bg-red-100 text-red-700' :
            task.priority === 'low' ? 'bg-green-100 text-green-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Delete and Edit buttons - show on hover */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
            title="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Empty State Component
const EmptyState = ({ icon, message }) => (
  <div className="text-center py-8">
    <div className="text-4xl mb-2">{icon}</div>
    <p className="text-sm text-muted-500">{message}</p>
  </div>
)

// Main Selected Date Panel Component
const SelectedDatePanel = ({ 
  selectedDate, 
  tasks, 
  onToggleTask, 
  onDeleteTask, 
  onTaskClick, 
  onEditTask, 
  onAddTask, 
  aiSuggestions 
}) => {
  const formattedDate = format(selectedDate, 'EEEE, MMMM do, yyyy')
  const dayIsToday = isToday(selectedDate)
  
  // Categorize tasks
  const calendarTasks = tasks.filter(t => t.notes?.includes('calendar_task'))
  const todayTasks = calendarTasks.filter(t => t.task_type === 'todo' || !t.task_type)
  const weekTasks = calendarTasks.filter(t => t.task_type === 'goal')
  const reminders = calendarTasks.filter(t => t.task_type === 'reminder')
  
  const totalTasks = calendarTasks.length
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-ocean-200 shadow-lg h-full flex flex-col"
    >
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-ocean-200">
        <h3 className="text-lg font-bold text-ocean-800 mb-1">{formattedDate}</h3>
        <div className="flex items-center gap-2">
          {dayIsToday && (
            <span className="inline-block px-2 py-0.5 bg-ocean-500 text-white text-xs rounded-full">
              Today
            </span>
          )}
          <span className="text-xs text-muted-500">{totalTasks} scheduled task{totalTasks !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Tasks List - Categorized */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-4">
        {totalTasks > 0 ? (
          <>
            {/* Today's Tasks */}
            {todayTasks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Today's Tasks ({todayTasks.length})
                </h4>
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTask(task.id, task.due_date)}
                      onClick={() => onTaskClick(task)}
                      onDelete={() => onDeleteTask(task.id, task.due_date)}
                      onEdit={() => onEditTask(task)}
                      hasAI={!!aiSuggestions[task.id]}
                      isGoal={false}
                      showTime={false}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Week Tasks (Goals) */}
            {weekTasks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Week Tasks ({weekTasks.length})
                </h4>
                <div className="space-y-2">
                  {weekTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTask(task.id, task.due_date)}
                      onClick={() => onTaskClick(task)}
                      onDelete={() => onDeleteTask(task.id, task.due_date)}
                      onEdit={() => onEditTask(task)}
                      hasAI={!!aiSuggestions[task.id]}
                      isGoal={true}
                      showTime={false}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Reminders */}
            {reminders.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  Reminders ({reminders.length})
                </h4>
                <div className="space-y-2">
                  {reminders.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTask(task.id, task.due_date)}
                      onClick={() => onTaskClick(task)}
                      onDelete={() => onDeleteTask(task.id, task.due_date)}
                      onEdit={() => onEditTask(task)}
                      hasAI={!!aiSuggestions[task.id]}
                      isGoal={false}
                      showTime={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon="📅" message="No scheduled tasks for this date" />
        )}

        {/* AI Suggestions Section - Only for calendar tasks */}
        {calendarTasks.length > 0 && Object.keys(aiSuggestions).some(id => calendarTasks.find(t => t.id === parseInt(id))) && (
          <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Suggestions
            </h4>
            <div className="space-y-2 text-sm text-purple-800">
              {calendarTasks.map(task => {
                const suggestion = aiSuggestions[task.id]
                if (!suggestion) return null
                
                return (
                  <div key={task.id} className="pb-2 border-b border-purple-200 last:border-0">
                    <p className="font-medium text-xs text-purple-900 mb-1">For: {task.title}</p>
                    {suggestion.tips && suggestion.tips.slice(0, 2).map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <span className="text-purple-500 mt-0.5">•</span>
                        <p>{tip}</p>
                      </div>
                    ))}
                    {suggestion.timeEstimate && (
                      <p className="text-xs text-purple-600 mt-1">
                        ⏱️ Est. time: {suggestion.timeEstimate}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <button
        onClick={onAddTask}
        className="w-full btn-gradient flex items-center justify-center gap-2 py-3"
      >
        <Plus className="w-4 h-4" />
        Add Task for This Day
      </button>

      {/* Quick Stats - Only for calendar tasks */}
      {calendarTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-ocean-200 flex items-center justify-between text-xs text-muted-500">
          <span>{calendarTasks.filter(t => t.completed).length} completed</span>
          <span>{calendarTasks.filter(t => t.is_important).length} important</span>
          <span>{calendarTasks.filter(t => !t.completed).length} pending</span>
        </div>
      )}
    </motion.div>
  )
}

export default SelectedDatePanel

