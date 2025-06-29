
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
        temperature: 0.7,
        max_tokens: 800
      },
      timeout: 15000, // 设置15秒超时
      success: (res) => {
        if (res.statusCode === 200 && res.data.choices && res.data.choices.length > 0) {
          resolve(res.data.choices[0].message.content);
        } else {
          console.error("API返回数据格式错误", res);
          reject({ errMsg: 'AI服务返回异常', data: res });
        }
      },
      fail: (err) => {
        console.error("API请求失败", err);
        reject({ errMsg: '网络请求失败，请检查网络连接', error: err });
      }
    });
  });
};

// 解析AI返回的文本
const parseFortuneResult = (text) => {
    const result = {};
    try {
        result.wuxing = text.match(/\\[五行分析\\]：(.*?)\n/)[1].trim();
        result.career = text.match(/\\[事业运势\\]：(.*?)\n/)[1].trim();
        result.health = text.match(/\\[健康预警\\]：(.*?)\n/)[1].trim();
        const colorMatch = text.match(/\\[今日幸运色\\]：(.*?),(#.*?)\n/);
        result.lucky_color = colorMatch[1].trim();
        result.color_value = colorMatch[2].trim();
        result.industry_suggestion = text.match(/\\[行业建议\\]：(.*?)\n/)[1].trim();
        result.solution = text.match(/\\[化解方法\\]：(.*?)$/s)[1].trim();
        const keywords = ['吉', '中平', '小吉'];
        result.keyword = keywords[Math.floor(Math.random() * keywords.length)];
    } catch (e) {
        console.error("解析AI结果失败", e);
        return null; // 返回null，让调用方处理错误
    }
    return result;
}

module.exports = {
  getFortune,
  parseFortuneResult
};
