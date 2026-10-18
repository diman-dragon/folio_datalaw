//! Expands files and folders into a flat list of PDF paths, and checks which PDF paths still exist.
use std::fs;
use std::path::{Path, PathBuf};

pub const MAX_DEPTH: usize = 8;
pub const MAX_FILES: usize = 5000;

fn is_pdf(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .is_some_and(|e| e.eq_ignore_ascii_case("pdf"))
}

fn walk(dir: &Path, depth: usize, out: &mut Vec<PathBuf>) {
    if depth > MAX_DEPTH || out.len() >= MAX_FILES {
        return;
    }
    let Ok(read) = fs::read_dir(dir) else { return };
    let mut entries: Vec<PathBuf> = read.filter_map(|e| e.ok().map(|e| e.path())).collect();
    entries.sort();
    for p in entries {
        if out.len() >= MAX_FILES {
            return;
        }
        let Ok(meta) = fs::symlink_metadata(&p) else { continue };
        if meta.is_dir() {
            walk(&p, depth + 1, out); // symlinked folders are skipped: no cycles
        } else if (meta.is_file() || meta.file_type().is_symlink()) && is_pdf(&p) && p.is_file() {
            out.push(p);
        }
    }
}

/// Files stay as they are (when they are PDFs); folders are searched recursively.
pub fn expand(paths: &[String]) -> Vec<String> {
    let mut out = Vec::new();
    for raw in paths {
        let p = Path::new(raw);
        if p.is_dir() {
            walk(p, 0, &mut out);
        } else if is_pdf(p) && p.is_file() && out.len() < MAX_FILES {
            out.push(p.to_path_buf());
        }
    }
    let mut seen = std::collections::HashSet::new();
    out.into_iter()
        .map(|p| p.to_string_lossy().into_owned())
        .filter(|s| seen.insert(s.clone()))
        .collect()
}

/// One flag per path: does a PDF file exist there right now.
pub fn existing(paths: &[String]) -> Vec<bool> {
    paths
        .iter()
        .map(|s| {
            let p = Path::new(s);
            is_pdf(p) && p.is_file()
        })
        .collect()
}
