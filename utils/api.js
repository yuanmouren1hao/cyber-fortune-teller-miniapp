
const app = getApp();
const dataSecurity = require('./data_security.js');

// 优化后的API调用函数
const getFortune = (userInput) => {
  const apiKey = app.globalData.deepSeekApiKey;
  if (!apiKey || apiKey === 'YOUR_DEEPSEEK_API_KEY') {
    console.error("请在 app.js 中设置你的 DeepSeek API Key");
    return Promise.reject({ errMsg: "API Key not set" });
  }

  // 对用户输入进行脱敏处理，仅用于日志记录
  dataSecurity.desensitizeInput(userInput);

  const prompt = `你是一名资深命理师，请根据用户输入的信息生成一份命理报告。请严格按照以下格式和要求输出，不要添加任何无关内容：
[五行分析]：(30字内)
[事业运势]：(包含1个建议)
[健康预警]：(1项)
[今日幸运色]：(1种颜色名称和对应的HEX色值，格式如：幸运红,#FF0000)
[行业建议]：(解锁内容，适合从事的行业)
[化解方法]：(解锁内容，风水或行为化解建议)
---
用户输入：${userInput}
---
要求：避免负面词汇，强调积极引导。运势关键词从“吉”、“中平”、“小吉”中选择一个。`;

  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://api.deepseek.com/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      data: {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一名资深命理师' },
          { role: 'user', content: prompt }
        ],
        "stream": false,
        temperature: 0.7,
        max_tokens: 800
      },
      timeout: 30000, // 设置15秒超时
      success: (res) => {
        if (res.statusCode === 200 && res.data.choices && res.data.choices.length > 0) {
          resolve(res.data.choices[0].message.content);
        } else {
          console.error("API返回数据格式错误", res);
          reject({ errMsg: 'AI服务返回异常', data: res });
        }
      },
      fail: (err) => {
        console.error("API请求失败 - 详情:", {
          error: err,
          timestamp: new Date().toISOString(),
          apiEndpoint: 'https://api.deepseek.com/chat/completions'
        });
        
        // 根据错误类型提供更具体的错误信息
        let errorMsg = '网络请求失败，请检查网络连接';
        if (err.errMsg && err.errMsg.includes('timeout')) {
          errorMsg = '请求超时，请稍后重试';
        } else if (err.errno && err.errno === -1009) {
          errorMsg = '网络连接不可用，请检查网络设置';
        } else if (err.statusCode === 401) {
          errorMsg = 'API密钥无效，请检查配置';
        }
        
        reject({ 
          errMsg: errorMsg,
          error: err,
          suggestion: '1. 检查网络连接\n2. 验证API密钥\n3. 稍后重试'
        });
      }
    });
  });
};

// 解析AI返回的文本
const parseFortuneResult = (text) => {
  if (!text || typeof text !== 'string') {
    console.error('无效的输入文本');
    return null;
  }

  // 强校验输入格式
  const requiredSections = [
    '五行分析', '事业运势', '健康预警', 
    '今日幸运色', '行业建议', '化解方法'
  ];
  
  const missingSections = requiredSections.filter(section => 
    !text.includes(`[${section}]：`)
  );
  
  if (missingSections.length > 0) {
    console.error(`缺少必要段落: ${missingSections.join(', ')}`);
    return null;
  }

  const result = {
    wuxing: '',
    career: '',
    health: '',
    lucky_color: '',
    color_value: '',
    industry_suggestion: '',
    solution: '',
    keyword: '中平'
  };

  // 改进后的正则表达式，更宽松地匹配空白和换行
  const patterns = {
    wuxing: /\[五行分析\]：([^\n]*)(?:\n|$)/,
    career: /\[事业运势\]：([^\n]*)(?:\n|$)/,
    health: /\[健康预警\]：([^\n]*)(?:\n|$)/,
    lucky_color: /\[今日幸运色\]：([^,#\n]*),/,
    color_value: /\[今日幸运色\]：[^,#\n]*,([^)\n]*)(?:\n|$)/,
    industry_suggestion: /\[行业建议\]：([^\n]*)(?:\n|$)/,
    solution: /\[化解方法\]：([\s\S]*)$/
  };

  // 提取各字段内容
  try {
    result.wuxing = (text.match(patterns.wuxing)?.[1] || '').trim();
    result.career = (text.match(patterns.career)?.[1] || '').trim();
    result.health = (text.match(patterns.health)?.[1] || '').trim();
    result.lucky_color = (text.match(patterns.lucky_color)?.[1] || '').trim();
    result.color_value = (text.match(patterns.color_value)?.[1] || '').trim();
    result.industry_suggestion = (text.match(patterns.industry_suggestion)?.[1] || '').trim();
    result.solution = (text.match(patterns.solution)?.[1] || '').trim();

    // 提取运势关键词
    const fortuneKeywords = ['吉', '中平', '小吉'];
    const keywordMatch = result.career.match(new RegExp(fortuneKeywords.join('|')));
    result.keyword = keywordMatch ? keywordMatch[0] : '中平';
    
    return result;
  } catch (e) {
    console.error('解析过程中发生错误:', e);
    return null;
  }
}

module.exports = {
  getFortune,
  parseFortuneResult
};