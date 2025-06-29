
/**
 * @file data_security.js
 * @description 用户数据安全和脱敏处理工具
 */

const app = getApp();

/**
 * 对用户输入进行脱敏处理
 * @param {string} userInput - 原始用户输入
 * @returns {string} - 返回脱敏后的信息，用于日志记录或非敏感场景
 */
const desensitizeInput = (userInput) => {
  if (!userInput) {
    return "输入为空";
  }
  // 对生辰八字进行脱敏，只保留类型，不记录具体时间
  if (userInput.startsWith('生辰八字：')) {
    console.log("接收到生辰八字输入（内容已脱敏，不记录）");
    return '类型：生辰八字';
  }
  // 对问题描述进行脱敏，可以进行关键词过滤或截断
  if (userInput.startsWith('问题：')) {
    const question = userInput.substring(3);
    // 示例：只记录问题的长度和前几个字符
    const sanitizedQuestion = question.length > 10 ? question.substring(0, 10) + '...' : question;
    console.log(`接收到问题输入（内容已部分脱敏）: ${sanitizedQuestion}`);
    return `类型：问题描述`;
  }
  return '类型：未知输入';
};

/**
 * 清理全局存储的敏感数据
 * 在用户完成一次完整的算命流程或退出相关页面后调用
 */
const clearSensitiveData = () => {
  console.log("清理全局敏感数据...");
  const globalData = app.globalData;
  if (globalData) {
    // 清除用户输入和完整的算命结果
    globalData.userInput = null;
    globalData.fullResult = null;
    globalData.hasUnlockedDetail = false; // 重置解锁状态
    console.log("全局敏感数据已清除。");
  }
};

/**
 * 检查并提醒用户关于隐私保护
 * 可以在输入页面加载时调用
 */
const showPrivacyReminder = () => {
  wx.showModal({
    title: '隐私提示',
    content: '我们非常重视您的隐私。您输入的个人信息（如生辰八字）将仅用于本次测算，不会被存储或用于其他目的。',
    showCancel: false,
    confirmText: '我已知晓'
  });
};

module.exports = {
  desensitizeInput,
  clearSensitiveData,
  showPrivacyReminder
};
