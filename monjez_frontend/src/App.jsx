import { useState, useEffect } from 'react'
import { Calendar, Plus, Search, Settings, User, Moon, Sun, Brain, Mosque } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
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
      title: 'اجتماع الفريق الأسبوعي',
      description: 'مراجعة التقدم في المشاريع الحالية',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(2025, 8, 10, 10, 0),
      project: 'سبق',
      color: '#1E88E5'
    },
    {
      id: 2,
      title: 'إنهاء تقرير الربع الثالث',
      description: 'تجميع البيانات وكتابة التقرير النهائي',
      status: 'in_progress',
      priority: 'urgent',
      dueDate: new Date(2025, 8, 12, 17, 0),
      project: 'تطوير',
      color: '#8E24AA'
    },
    {
      id: 3,
      title: 'مراجعة الكود الجديد',
      description: 'مراجعة التحديثات الأخيرة على النظام',
      status: 'todo',
      priority: 'med',
      dueDate: new Date(2025, 8, 15, 14, 0),
      project: 'تطوير',
      color: '#8E24AA'
    },
    {
      id: 4,
      title: 'صلاة الظهر',
      description: 'تذكير بموعد صلاة الظهر',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(2025, 8, 25, 12, 5),
      project: 'عبادة',
      color: '#22c55e',
      isPrayer: true
    }
  ])

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

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* الشريط العلوي */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                          className={`task-card p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${
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
                      <div key={task.id} className="task-card p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
          <div className="lg:col-span-3">
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
                {/* عرض التقويم الشهري المبسط */}
                <div className="calendar-grid">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                      <div key={day} className="p-2 text-center font-medium text-gray-600 dark:text-gray-300 text-sm">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6)
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                      const isToday = date.toDateString() === new Date().toDateString()
                      const dayTasks = tasks.filter(task => 
                        new Date(task.dueDate).toDateString() === date.toDateString()
                      )
                      
                      return (
                        <div
                          key={i}
                          className={`
                            calendar-day min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all interactive-element
                            ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                            ${isToday ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' : ''}
                            hover:bg-gray-100 dark:hover:bg-gray-600
                          `}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                          }`}>
                            {date.getDate()}
                          </div>
                          {calendarType === 'hijri' && (
                            <div className="hijri-date">
                              {/* يمكن إضافة التاريخ الهجري هنا */}
                            </div>
                          )}
                          <div className="space-y-1">
                            {dayTasks.slice(0, 2).map(task => (
                              <div
                                key={task.id}
                                className={`text-xs p-1 rounded text-white truncate ${
                                  task.isPrayer ? 'bg-green-500' : ''
                                }`}
                                style={{ backgroundColor: task.isPrayer ? '#22c55e' : task.color }}
                              >
                                {task.isPrayer && <Mosque className="h-3 w-3 inline ml-1" />}
                                {task.title}
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayTasks.length - 2} أخرى
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

