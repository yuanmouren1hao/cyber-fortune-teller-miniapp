
import os
import json

def run_check():
    project_base = "/usr/local/app/workspace/plan_2d38662c6b9535a5676e8bb2aacf7947/stage_5/fortune_teller"
    app_js_path = os.path.join(project_base, "app.js")
    project_config_path = os.path.join(project_base, "project.config.json")

    print("--- 小程序上线前配置检查 ---")
    print("\n")

    # 1. 检查 app.js
    print("1. 正在检查 app.js...")
    try:
        with open(app_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if "YOUR_DEEPSEEK_API_KEY" in content:
                print("  [警告] deepSeekApiKey 尚未配置! 请在 app.js 中设置正确的 API Key。")
            else:
                print("  [通过] deepSeekApiKey 已配置。")

            if "adunit-7e94a5d3d48b5d80" in content:
                print("  [提示] adUnitId 使用的是示例ID。上线前请确认是否需要更换为生产环境的广告单元ID。")
            else:
                print("  [通过] adUnitId 已配置。")
            
            if "https://api.deepseek.com" in content:
                 print("  [提示] 请确保已在微信小程序后台将 'https://api.deepseek.com' 添加到 request 合法域名中。")

    except FileNotFoundError:
        print(f"  [错误] 未找到文件: {app_js_path}")

    print("\n")

    # 2. 检查 project.config.json
    print("2. 正在检查 project.config.json...")
    try:
        with open(project_config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
            if "appid" not in config or not config["appid"] or "testappid" in config["appid"]:
                print(f"  [警告] 小程序 AppID (appid) 未配置或使用的是测试ID: {config.get('appid', '未找到')}")
            else:
                print(f"  [通过] 小程序 AppID 已配置: {config['appid']}")
            
            if "projectname" not in config or config["projectname"] == "fortune_teller":
                 print(f"  [提示] 项目名称为默认值 'fortune_teller'。请确认为最终名称。")
            else:
                print(f"  [通过] 项目名称已配置: {config['projectname']}")

    except FileNotFoundError:
        print(f"  [错误] 未找到文件: {project_config_path}")
    except json.JSONDecodeError:
        print(f"  [错误] 文件格式错误: {project_config_path}")

    print("\n")
    print("--- 检查完成 ---")
    print("请根据以上提示完成上线前的最终配置。")

if __name__ == "__main__":
    run_check()
