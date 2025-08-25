import { useState, useEffect } from 'react'
import { Clock, Landmark as Mosque, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'

const PrayerTimesWidget = () => {
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)

  // بيانات أوقات الصلاة الثابتة (يمكن استبدالها بـ API)
  const mockPrayerTimes = {
    date: new Date().toISOString().split('T')[0],
    city: 'الرياض',
    prayer_times: {
      fajr: { time: '04:15', name: 'الفجر' },
      dhuhr: { time: '12:05', name: 'الظهر' },
      asr: { time: '15:30', name: 'العصر' },
      maghrib: { time: '18:45', name: 'المغرب' },
      isha: { time: '20:15', name: 'العشاء' }
    },
    next_prayer: {
      name: 'الظهر',
      key: 'dhuhr',
      time: '12:05',
      time_remaining: '2:30:00'
    },
    hijri_date: '1447/03/05'
  }

  useEffect(() => {
    // محاكاة تحميل أوقات الصلاة
    const loadPrayerTimes = async () => {
      setLoading(true)
      // يمكن استبدال هذا بـ API call حقيقي
      setTimeout(() => {
        setPrayerTimes(mockPrayerTimes)
        setLoading(false)
      }, 1000)
    }

    loadPrayerTimes()

    // تحديث الوقت الحالي كل ثانية
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (timeString) => {
    return timeString
  }

  const getTimeUntilPrayer = (prayerTime) => {
    const now = new Date()
    const [hours, minutes] = prayerTime.split(':').map(Number)
    const prayerDate = new Date()
    prayerDate.setHours(hours, minutes, 0, 0)
    
    if (prayerDate < now) {
      prayerDate.setDate(prayerDate.getDate() + 1)
    }
    
    const diff = prayerDate - now
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60))
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hoursLeft > 0) {
      return `${hoursLeft}س ${minutesLeft}د`
    } else {
      return `${minutesLeft}د`
    }
  }

  const getCurrentPrayerStatus = () => {
    if (!prayerTimes) return null
    
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute
    
    const prayers = Object.entries(prayerTimes.prayer_times)
    
    for (let i = 0; i < prayers.length; i++) {
      const [key, prayer] = prayers[i]
      const [hours, minutes] = prayer.time.split(':').map(Number)
      const prayerTimeInMinutes = hours * 60 + minutes
      
      if (currentTimeInMinutes < prayerTimeInMinutes) {
        return {
          next: prayer,
          timeRemaining: getTimeUntilPrayer(prayer.time)
        }
      }
    }
    
    // إذا انتهت جميع صلوات اليوم، الصلاة القادمة هي فجر الغد
    return {
      next: prayerTimes.prayer_times.fajr,
      timeRemaining: getTimeUntilPrayer(prayerTimes.prayer_times.fajr.time)
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!prayerTimes) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">لا يمكن تحميل أوقات الصلاة</p>
        </CardContent>
      </Card>
    )
  }

  const currentStatus = getCurrentPrayerStatus()

  return (
    <Card className="prayer-times-widget">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Mosque className="h-5 w-5 ml-2 text-green-600" />
          أوقات الصلاة
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>{prayerTimes.city}</span>
          <span>{prayerTimes.hijri_date} هـ</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* الصلاة القادمة */}
        {currentStatus && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  الصلاة القادمة: {currentStatus.next.name}
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  الوقت: {currentStatus.next.time}
                </p>
              </div>
              <div className="text-left">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                  <Clock className="h-3 w-3 ml-1" />
                  {currentStatus.timeRemaining}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* جميع أوقات الصلاة */}
        <div className="space-y-2">
          {Object.entries(prayerTimes.prayer_times).map(([key, prayer]) => {
            const isNext = currentStatus?.next.name === prayer.name
            
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  isNext 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ml-3 ${
                    isNext ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                  <span className={`font-medium ${
                    isNext ? 'text-blue-800 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {prayer.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className={`text-sm ${
                    isNext ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {formatTime(prayer.time)}
                  </span>
                  {isNext && (
                    <Bell className="h-3 w-3 text-blue-500" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* أزرار التحكم */}
        <div className="flex space-x-2 space-x-reverse pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Bell className="h-3 w-3 ml-1" />
            تفعيل التذكيرات
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Clock className="h-3 w-3 ml-1" />
            إعدادات الأوقات
          </Button>
        </div>

        {/* معلومات إضافية */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t">
          آخر تحديث: {currentTime.toLocaleTimeString('ar-SA')}
        </div>
      </CardContent>
    </Card>
  )
}

export default PrayerTimesWidget

