import { useState, useEffect } from 'react'
import { Calendar, Plus, Search, Settings, User, Moon, Sun, Brain, Landmark as Mosque, Clock, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx'
import PrayerTimesWidget from './components/PrayerTimesWidget.jsx'
import AIAssistant from './components/AIAssistant.jsx'
import './App.css'

function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarType, setCalendarType] = useState('gregorian') // gregorian, hijri
  const [viewType, setViewType] = useState('month') // month, week, day
  const [darkMode, setDarkMode] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showPrayer, setShowPrayer] = useState(true)
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'اجتماع المنتج',
      description: 'مراجعة خارطة الطريق',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5, 11, 0),
      project: 'المنتج',
      color: '#DBEAFE' // أزرق فاتح
    },
    {
      id: 2,
      title: 'موعد مع عميل',
      description: 'عرض مميزات الإصدار التالي',
      status: 'in_progress',
      priority: 'med',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 8, 16, 30),
      project: 'مبيعات',
      color: '#FEF9C3' // أصفر فاتح
    },
    {
      id: 3,
      title: 'مراجعة تصميم',
      description: 'مراجعة لوحات الواجهة',
      status: 'todo',
      priority: 'low',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10, 14, 0),
      project: 'تصميم',
      color: '#FCE7F3' // وردي فاتح
    },
    {
      id: 4,
      title: 'كتابة تقرير',
      description: 'تقرير الأداء الشهري',
      status: 'todo',
      priority: 'med',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 9, 0),
      project: 'تقارير',
      color: '#EDE9FE' // بنفسجي فاتح
    },
    {
      id: 5,
      title: 'تدريب الفريق',
      description: 'جلسة تدريب أدوات',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 13, 0),
      project: 'موارد بشرية',
      color: '#FFEDD5' // برتقالي فاتح
    },
    {
      id: 6,
      title: 'مكالمة مبيعات',
      description: 'متابعة العملاء المحتملين',
      status: 'todo',
      priority: 'med',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 18, 17, 0),
      project: 'مبيعات',
      color: '#CFFAFE' // سماوي فاتح
    },
    {
      id: 7,
      title: 'تحديث بنية',
      description: 'ترقية خدمات البنية',
      status: 'todo',
      priority: 'med',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 10, 30),
      project: 'DevOps',
      color: '#E2E8F0' // رمادي فاتح
    },
    {
      id: 8,
      title: 'صلاة الظهر',
      description: 'تذكير بموعد الصلاة',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 22, 12, 5),
      project: 'عبادة',
      isPrayer: true
    },
    {
      id: 9,
      title: 'موعد طبي',
      description: 'فحص دوري',
      status: 'todo',
      priority: 'low',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 24, 8, 30),
      project: 'شخصي',
      color: '#DCFCE7' // أخضر فاتح
    },
    {
      id: 10,
      title: 'تقديم عرض',
      description: 'عرض نتائج الربع',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 27, 15, 30),
      project: 'إدارة',
      color: '#E0E7FF' // نيلي فاتح
    },
  ])

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const openTaskModal = (task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const markTaskDone = () => {
    if (!selectedTask) return
    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'done' } : t))
    setSelectedTask(prev => prev ? { ...prev, status: 'done' } : prev)
  }

  const formatDate = (date) => {
    if (calendarType === 'hijri') {
      // هنا يمكن إضافة منطق التحويل للهجري
      return date.toLocaleDateString('ar-SA-u-ca-islamic')
    }
    return date.toLocaleDateString('ar-SA')
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'med': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'todo': return 'قيد الانتظار'
      case 'in_progress': return 'قيد التنفيذ'
      case 'done': return 'مكتملة'
      case 'archived': return 'مؤرشفة'
      default: return status
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent': return 'عاجل'
      case 'high': return 'عالية'
      case 'med': return 'متوسطة'
      case 'low': return 'منخفضة'
      default: return priority
    }
  }

  const isSameDayDate = (a, b) => a.toDateString() === b.toDateString()
  const getStartOfWeek = (date) => {
    const d = new Date(date)
    const day = d.getDay() // 0 الأحد
    const diff = d.getDate() - day
    return new Date(d.getFullYear(), d.getMonth(), diff)
  }

  const todayTasks = tasks.filter(task => {
    const today = new Date()
    const taskDate = new Date(task.dueDate)
    return taskDate.toDateString() === today.toDateString()
  })

  const upcomingTasks = tasks.filter(task => {
    const today = new Date()
    const taskDate = new Date(task.dueDate)
    return taskDate > today
  }).slice(0, 5)

  return (<>
    <div className={`min-h-screen antialiased ${darkMode ? 'dark bg-gray-900' : 'bg-[#f8f8f7]'}`}>
      {/* الشريط العلوي */}
      <header className="bg-white dark:bg-[#141413] border-b border-[#f0f0ef] dark:border-[#272726]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* الشعار */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600 ml-2" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مُنجز</h1>
                <Badge variant="secondary" className="mr-2 text-xs">
                  الذكي
                </Badge>
              </div>
            </div>

            {/* شريط البحث */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text" 
                  placeholder="البحث في المهام..." 
                  className="pr-10 text-right"
                />
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrayer(!showPrayer)}
                className={showPrayer ? 'bg-green-50 border-green-200' : ''}
              >
                <Mosque className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAI(!showAI)}
                className={showAI ? 'bg-purple-50 border-purple-200' : ''}
              >
                <Brain className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCalendarType(calendarType === 'gregorian' ? 'hijri' : 'gregorian')}
              >
                {calendarType === 'gregorian' ? 'هجري' : 'ميلادي'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button size="sm" className="btn-primary">
                <Plus className="h-4 w-4 ml-1" />
                مهمة جديدة
              </Button>

              <Button variant="outline" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* الشريط الجانبي */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* أوقات الصلاة */}
              {showPrayer && (
                <div className="fade-in">
                  <PrayerTimesWidget />
                </div>
              )}

              {/* المساعد الذكي */}
              {showAI && (
                <div className="fade-in">
                  <AIAssistant />
                </div>
              )}

              {/* مهام اليوم */}
              <Card className="slide-in-right">
                <CardHeader>
                  <CardTitle className="text-lg">مهام اليوم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todayTasks.length > 0 ? (
                      todayTasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`task-card p-3 bg-white dark:bg-[#141413] border border-[#f0f0ef] dark:border-[#272726] rounded-none ${
                            task.isPrayer ? 'border-r-4 border-green-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {task.project}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatTime(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">لا توجد مهام لليوم</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* المهام القادمة */}
              <Card className="slide-in-right">
                <CardHeader>
                  <CardTitle className="text-lg">المهام القادمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingTasks.map(task => (
                      <div key={task.id} className="task-card p-3 bg-white dark:bg-[#141413] border border-[#f0f0ef] dark:border-[#272726] rounded-none">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {getStatusText(task.status)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* الإحصائيات السريعة */}
              <Card className="slide-in-right">
                <CardHeader>
                  <CardTitle className="text-lg">الإحصائيات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">المهام المكتملة</span>
                      <span className="font-bold text-green-600">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">قيد التنفيذ</span>
                      <span className="font-bold text-blue-600">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">في الانتظار</span>
                      <span className="font-bold text-orange-600">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* منطقة التقويم الرئيسية */}
          <div className="lg:col-span-4">
            <Card className="fade-in">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    {formatDate(currentDate)} - التقويم {calendarType === 'gregorian' ? 'الميلادي' : 'الهجري'}
                  </CardTitle>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button
                      variant={viewType === 'day' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewType('day')}
                    >
                      يوم
                    </Button>
                    <Button
                      variant={viewType === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewType('week')}
                    >
                      أسبوع
                    </Button>
                    <Button
                      variant={viewType === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewType('month')}
                    >
                      شهر
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="calendar-grid">
                  {viewType === 'month' && (
                    <>
                      <div className="calendar-week-header grid grid-cols-7 gap-2 md:gap-3 mb-4 sticky top-0 z-10 bg-white dark:bg-[#141413]">
                        {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                          <div key={day} className="p-2 text-center font-medium text-gray-600 dark:text-gray-300 text-sm">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2 md:gap-3">
                        {Array.from({ length: 35 }, (_, i) => {
                          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6)
                          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                          const dayTasks = tasks.filter(task => isSameDayDate(new Date(task.dueDate), date))
                          return (
                            <div
                              key={i}
                              className={`
                                calendar-day min-h-[150px] p-2 border rounded-none cursor-pointer
                                ${isCurrentMonth ? 'bg-white dark:bg-[#141413]' : 'bg-[#f8f8f7] dark:bg-[#0f0f0e]'}
                                border-[#f0f0ef] dark:border-[#272726]
                              `}
                            >
                              <div className={`text-base md:text-lg font-semibold mb-1 ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                {date.getDate()}
                              </div>
                              <div className="space-y-1">
                                {dayTasks.length > 0 && (() => {
                                  const task = dayTasks[0]
                                  const bg = task.isPrayer ? '#22c55e' : (task.color || '#E5E7EB')
                                  const borderColor = task.isPrayer ? '#16a34a' : bg
                                  return (
                                    <div
                                      key={task.id}
                                      onClick={() => openTaskModal(task)}
                                      className={`text-[11px] md:text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-90 transition ${task.isPrayer ? 'text-white' : 'text-gray-900'}`}
                                      style={{ backgroundColor: bg, borderRight: `4px solid ${borderColor}` }}
                                    >
                                      {task.isPrayer && <Mosque className="h-3 w-3 inline ml-1" />}
                                      {task.title}
                                    </div>
                                  )
                                })()}
                                {dayTasks.length > 1 && (
                                  <div className="text-[11px] md:text-xs text-gray-500">+{dayTasks.length - 1} أخرى</div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {viewType === 'week' && (() => {
                    const start = getStartOfWeek(currentDate)
                    const days = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
                    return (
                      <>
                        <div className="grid grid-cols-7 gap-2 mb-2">
                          {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, idx) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                              {day} {days[idx].getDate()}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2 md:gap-3">
                          {days.map((date, i) => {
                            const dayTasks = tasks.filter(task => isSameDayDate(new Date(task.dueDate), date))
                            return (
                              <div
                                key={i}
                                className="min-h-[180px] p-2 border rounded-none bg-white dark:bg-[#141413] border-[#f0f0ef] dark:border-[#272726]"
                              >
                                <div className="space-y-1">
                                  {dayTasks.length ? (() => {
                                    const task = dayTasks[0]
                                    const bg = task.isPrayer ? '#22c55e' : (task.color || '#E5E7EB')
                                    const borderColor = task.isPrayer ? '#16a34a' : bg
                                    return (
                                      <>
                                        <div
                                          key={task.id}
                                          onClick={() => openTaskModal(task)}
                                          className={`text-[11px] md:text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-90 transition ${task.isPrayer ? 'text-white' : 'text-gray-900'}`}
                                          style={{ backgroundColor: bg, borderRight: `4px solid ${borderColor}` }}
                                        >
                                          {task.isPrayer && <Mosque className="h-3 w-3 inline ml-1" />}
                                          {task.title}
                                        </div>
                                        {dayTasks.length > 1 && (
                                          <div className="text-[11px] md:text-xs text-gray-500">+{dayTasks.length - 1} أخرى</div>
                                        )}
                                      </>
                                    )
                                  })() : (
                                    <div className="text-xs text-gray-400 text-center pt-4">لا مهام</div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )
                  })()}

                  {viewType === 'day' && (() => {
                    const dayTasks = tasks.filter(task => isSameDayDate(new Date(task.dueDate), currentDate))
                    return (
                      <div className="space-y-2">
                        {dayTasks.length ? dayTasks.map(task => (
                          <div
                            key={task.id}
                            onClick={() => openTaskModal(task)}
                            className="p-3 border rounded-none bg-white dark:bg-[#141413] border-[#f0f0ef] dark:border-[#272726] cursor-pointer hover:bg-[#f8f8f7] dark:hover:bg-[#0f0f0e] transition"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              <span className="text-xs text-gray-500">{formatTime(new Date(task.dueDate))}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">{task.project}</Badge>
                              <span className="text-xs">{getPriorityText(task.priority)}</span>
                            </div>
                          </div>
                        )) : (
                          <div className="text-sm text-gray-500 text-center py-8">لا توجد مهام هذا اليوم</div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
      <DialogContent className="rounded-none border border-[#f0f0ef] dark:border-[#272726] bg-white dark:bg-[#141413]">
        {selectedTask && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="text-xl">{selectedTask.title}</span>
                <Badge variant="outline" className="text-xs">
                  {getStatusText(selectedTask.status)}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-right">
                {selectedTask.description || 'لا يوجد وصف'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center"><Calendar className="h-4 w-4 ml-2" />{formatDate(new Date(selectedTask.dueDate))}</span>
                <span className="flex items-center"><Clock className="h-4 w-4 ml-2" />{formatTime(new Date(selectedTask.dueDate))}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center"><Flag className="h-4 w-4 ml-2" />{getPriorityText(selectedTask.priority)}</span>
                <Badge variant="outline" className="text-xs">{selectedTask.project}</Badge>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={markTaskDone} variant="default" className="btn-primary">إكمال المهمة</Button>
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>إغلاق</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  </>)
}

export default App

