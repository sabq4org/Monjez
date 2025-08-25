import { useState, useEffect } from 'react'
import { Bot, Lightbulb, Clock, Target, Sparkles, Send, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'

const AIAssistant = () => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [chatHistory, setChatHistory] = useState([])

  // اقتراحات ذكية مبدئية
  const initialSuggestions = [
    {
      type: 'productivity',
      title: 'تحسين الإنتاجية',
      description: 'استخدم تقنية البومودورو: 25 دقيقة عمل، 5 دقائق راحة',
      icon: Target,
      color: 'bg-blue-500'
    },
    {
      type: 'timing',
      title: 'أفضل وقت للمهام',
      description: 'الصباح الباكر (6-9 ص) مثالي للمهام التي تتطلب تركيز عالي',
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      type: 'organization',
      title: 'تنظيم المهام',
      description: 'رتب مهامك حسب مصفوفة أيزنهاور: عاجل/مهم',
      icon: Lightbulb,
      color: 'bg-yellow-500'
    }
  ]

  useEffect(() => {
    setSuggestions(initialSuggestions)
  }, [])

  const handleAIRequest = async (type = 'general', context = '') => {
    setLoading(true)
    
    try {
      // محاكاة استدعاء API للذكاء الاصطناعي
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockResponse = {
        suggestions: [
          'قم بتقسيم المهام الكبيرة إلى مهام أصغر',
          'حدد أولوياتك باستخدام قاعدة 80/20',
          'خصص وقتاً محدداً للرد على الرسائل'
        ],
        tips: [
          'ابدأ بأصعب مهمة في اليوم',
          'استخدم التذكيرات الذكية',
          'راجع إنجازاتك في نهاية كل يوم'
        ],
        next_actions: [
          'إنشاء قائمة مهام لغد',
          'مراجعة الأهداف الأسبوعية',
          'تحديث التقويم الشخصي'
        ]
      }

      // إضافة الاستجابة لتاريخ المحادثة
      const newMessage = {
        id: Date.now(),
        type: 'ai',
        content: mockResponse,
        timestamp: new Date()
      }

      setChatHistory(prev => [...prev, newMessage])
      
    } catch (error) {
      console.error('خطأ في الحصول على اقتراحات الذكاء الاصطناعي:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserMessage = async () => {
    if (!userInput.trim()) return

    // إضافة رسالة المستخدم
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, userMessage])
    setUserInput('')

    // الحصول على رد من الذكاء الاصطناعي
    await handleAIRequest('general', userInput)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleUserMessage()
    }
  }

  return (
    <Card className="ai-assistant h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Bot className="h-5 w-5 ml-2 text-purple-600" />
          مساعد مُنجز الذكي
          <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* الاقتراحات السريعة */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            اقتراحات ذكية
          </h4>
          
          {suggestions.map((suggestion, index) => {
            const IconComponent = suggestion.icon
            return (
              <div
                key={index}
                className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleAIRequest(suggestion.type, suggestion.title)}
              >
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className={`p-2 rounded-lg ${suggestion.color} text-white`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                      {suggestion.title}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* تاريخ المحادثة */}
        {chatHistory.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
              المحادثة
            </h4>
            
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mr-4'
                    : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 ml-4'
                }`}
              >
                {message.type === 'user' ? (
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {message.content}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {message.content.suggestions && (
                      <div>
                        <h6 className="font-medium text-xs text-purple-800 dark:text-purple-200 mb-1">
                          اقتراحات:
                        </h6>
                        <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                          {message.content.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-purple-500 ml-1">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {message.content.tips && (
                      <div>
                        <h6 className="font-medium text-xs text-purple-800 dark:text-purple-200 mb-1">
                          نصائح:
                        </h6>
                        <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                          {message.content.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-purple-500 ml-1">💡</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString('ar-SA')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* مربع الإدخال */}
        <div className="space-y-2">
          <div className="flex space-x-2 space-x-reverse">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اسأل المساعد الذكي..."
              className="flex-1 text-right"
              disabled={loading}
            />
            <Button
              onClick={handleUserMessage}
              disabled={loading || !userInput.trim()}
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* أزرار الاقتراحات السريعة */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAIRequest('productivity')}
              disabled={loading}
              className="text-xs"
            >
              تحليل الإنتاجية
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAIRequest('timing')}
              disabled={loading}
              className="text-xs"
            >
              اقتراح أوقات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAIRequest('subtasks')}
              disabled={loading}
              className="text-xs"
            >
              تقسيم المهام
            </Button>
          </div>
        </div>

        {/* حالة التحميل */}
        {loading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">
              المساعد الذكي يفكر...
            </span>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t">
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 ml-1" />
            مدعوم بالذكاء الاصطناعي
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default AIAssistant

