import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { sstApi } from '@/services/api';
import { CheckCircle, MessageCircle } from 'lucide-react';

export function UserFeedback() {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    feedback_type: '',
    feedback_text: '',
    priority: '中'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await sstApi.submitFeedback(formData);
      if (result.success) {
        setSubmitted(true);
        // Reset form
        setFormData({
          user_name: '',
          user_email: '',
          feedback_type: '',
          feedback_text: '',
          priority: '中'
        });
      }
    } catch (err: any) {
      setError(err.error || '提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold">感谢您的反馈！</h2>
            <p className="text-gray-600">
              我们已经收到您的建议，将会认真评估并尽快处理。您的意见对我们非常重要！
            </p>
            <Button onClick={() => setSubmitted(false)}>
              提交新的反馈
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            用户需求建议
          </CardTitle>
          <CardDescription>
            您的意见和建议对我们非常重要，请告诉我们您的想法
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user_name">姓名 *</Label>
                <Input
                  id="user_name"
                  value={formData.user_name}
                  onChange={(e) => handleInputChange('user_name', e.target.value)}
                  placeholder="请输入您的姓名"
                  required
                />
              </div>
              <div>
                <Label htmlFor="user_email">邮箱</Label>
                <Input
                  id="user_email"
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => handleInputChange('user_email', e.target.value)}
                  placeholder="选填，方便我们回复您"
                />
              </div>
            </div>

            {/* 反馈类型 */}
            <div>
              <Label>反馈类型 *</Label>
              <Select
                value={formData.feedback_type}
                onValueChange={(value) => handleInputChange('feedback_type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择反馈类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="功能建议">功能建议</SelectItem>
                  <SelectItem value="问题反馈">问题反馈</SelectItem>
                  <SelectItem value="数据需求">数据需求</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 优先级 */}
            <div>
              <Label>优先级</Label>
              <RadioGroup
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="低" id="low" />
                  <Label htmlFor="low">低</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="中" id="medium" />
                  <Label htmlFor="medium">中</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="高" id="high" />
                  <Label htmlFor="high">高</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 反馈内容 */}
            <div>
              <Label htmlFor="feedback_text">反馈内容 *</Label>
              <Textarea
                id="feedback_text"
                value={formData.feedback_text}
                onChange={(e) => handleInputChange('feedback_text', e.target.value)}
                placeholder="请详细描述您的建议或问题..."
                rows={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.feedback_text.length}/500 字符
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading || !formData.user_name || !formData.feedback_type || !formData.feedback_text}
              className="w-full"
            >
              {loading ? '提交中...' : '提交反馈'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>常见反馈类型</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">功能建议</Badge>
            <span className="text-sm text-gray-600">
              新的数据分析功能、图表类型、导出格式等
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">问题反馈</Badge>
            <span className="text-sm text-gray-600">
              系统bug、性能问题、界面错误等
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">数据需求</Badge>
            <span className="text-sm text-gray-600">
              需要更多时间范围的数据、更高分辨率的数据等
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">其他</Badge>
            <span className="text-sm text-gray-600">
              任何其他建议或意见
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}