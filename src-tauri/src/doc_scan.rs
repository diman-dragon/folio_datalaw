//! Expands files and folders into a flat list of document paths (PDF, FB2, FB2.ZIP), and checks which still exist.
use std::fs;
use std::path::{Path, PathBuf};

use crate::doc_guard::doc_kind;

pub const MAX_DEPTH: usize = 8;
pub const MAX_FILES: usize = 5000;

fn is_doc(path: &Path) -> bool {
    doc_kind(path).is_some()
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
        } else if (meta.is_file() || meta.file_type().is_symlink()) && is_doc(&p) && p.is_file() {
            out.push(p);
        }
    }
}

/// Files stay as they are (when they are documents); folders are searched recursively.
pub fn expand(paths: &[String]) -> Vec<String> {
    let mut out = Vec::new();
    for raw in paths {
        let p = Path::new(raw);
        if p.is_dir() {
            walk(p, 0, &mut out);
        } else if is_doc(p) && p.is_file() && out.len() < MAX_FILES {
            out.push(p.to_path_buf());
        }
    }
    let mut seen = std::collections::HashSet::new();
    out.into_iter()
        .map(|p| p.to_string_lossy().into_owned())
        .filter(|s| seen.insert(s.clone()))
        .collect()
}

/// One flag per path: does a document file exist there right now.
pub fn existing(paths: &[String]) -> Vec<bool> {
    paths
        .iter()
        .map(|s| {
            let p = Path::new(s);
            is_doc(p) && p.is_file()
        })
        .collect()
}
