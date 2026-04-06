use std::fs;
use std::path::Path;
use serde::Serialize;

#[derive(Serialize)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileItem>>,
}

pub fn list_directory(path: &str, recursive: bool) -> Result<Vec<FileItem>, String> {
    let mut items = Vec::new();
    let path = Path::new(path);

    if !path.exists() {
        return Err("路径不存在".to_string());
    }

    for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        let full_path = entry.path().to_string_lossy().to_string();

        // 跳过隐藏文件
        if name.starts_with('.') {
            continue;
        }

        let is_directory = metadata.is_dir();

        let mut item = FileItem {
            name,
            path: full_path,
            is_directory,
            children: None,
        };

        if recursive && is_directory {
            // 限制递归深度避免性能问题
            if let Ok(children) = list_directory(&item.path, false) {
                item.children = Some(children);
            }
        }

        items.push(item);
    }

    // 排序：目录在前，文件在后，按名称排序
    items.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(items)
}

pub fn read_file(path: &str) -> Result<String, String> {
    let path = Path::new(path);

    if !path.exists() {
        return Err("文件不存在".to_string());
    }

    if !path.is_file() {
        return Err("路径不是文件".to_string());
    }

    // 限制文件大小 (10MB)
    let metadata = fs::metadata(path).map_err(|e| e.to_string())?;
    if metadata.len() > 10 * 1024 * 1024 {
        return Err("文件太大，无法打开".to_string());
    }

    fs::read_to_string(path).map_err(|e| e.to_string())
}

pub fn write_file(path: &str, content: &str) -> Result<(), String> {
    let path = Path::new(path);

    // 确保父目录存在
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    fs::write(path, content).map_err(|e| e.to_string())
}
