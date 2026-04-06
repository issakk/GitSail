use std::process::Command;
use std::path::Path;

/// 检查 Claude Code 是否已安装
pub fn is_claude_installed() -> Result<bool, Box<dyn std::error::Error>> {
    // 检查 claude 命令是否在 PATH 中
    match Command::new("claude").arg("--version").output() {
        Ok(output) => Ok(output.status.success()),
        Err(_) => Ok(false),
    }
}

/// 启动 Claude Code
/// 在 Windows 上启动新的终端窗口
/// 在 macOS/Linux 上启动终端
pub fn launch_claude(
    project_path: &str,
    claude_path: Option<&str>,
) -> Result<(), String> {
    let claude = claude_path.unwrap_or("claude");
    let path = Path::new(project_path);

    if !path.exists() {
        return Err("项目路径不存在".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        // Windows: 使用 start 命令启动新的终端窗口
        let status = Command::new("cmd")
            .args(&[
                "/C",
                "start",
                "wt",  // Windows Terminal (如果安装了)
                "-d",
                project_path,
                claude,
            ])
            .spawn();

        if status.is_err() {
            // 如果 Windows Terminal 不可用，尝试使用 cmd
            let _ = Command::new("cmd")
                .args(&[
                    "/C",
                    "start",
                    "cmd",
                    "/K",
                    &format!("cd /d {} && {}", project_path, claude),
                ])
                .spawn()
                .map_err(|e| format!("无法启动终端: {}", e))?;
        }
    }

    #[cfg(target_os = "macos")]
    {
        // macOS: 使用 osascript 启动 Terminal.app
        let script = format!(
            r#"tell application "Terminal"
                do script "cd '{}' && {}"
                activate
            end tell"#,
            project_path, claude
        );

        Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .spawn()
            .map_err(|e| format!("无法启动终端: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        // Linux: 尝试各种终端模拟器
        let terminals = [
            ("gnome-terminal", vec!["--working-directory", project_path, "--", claude]),
            ("konsole", vec!["--workdir", project_path, "-e", claude]),
            ("xterm", vec!["-e", "sh", "-c", &format!("cd {} && {}", project_path, claude)]),
        ];

        let mut launched = false;
        for (term, args) in &terminals {
            if Command::new(term).args(args).spawn().is_ok() {
                launched = true;
                break;
            }
        }

        if !launched {
            return Err("无法找到可用的终端模拟器".to_string());
        }
    }

    Ok(())
}

/// 发送命令到已运行的 Claude Code 实例
/// 这需要更复杂的进程间通信，暂时作为占位符
pub fn send_to_claude(_command: &str) -> Result<String, String> {
    // TODO: 实现与 Claude Code 的通信
    // 可能通过套接字或文件来实现
    Ok("命令已发送".to_string())
}
