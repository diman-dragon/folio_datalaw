//! Tests for pdf_scan: recursion, filtering, limits and existence checks.
use std::fs;
use std::path::{Path, PathBuf};

use crate::pdf_scan::{existing, expand, MAX_DEPTH};

fn sandbox(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("folio_scan_{}_{}", std::process::id(), name));
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(&dir).unwrap();
    dir
}

fn touch(p: &Path) {
    fs::create_dir_all(p.parent().unwrap()).unwrap();
    fs::write(p, b"%PDF-1.7").unwrap();
}

fn s(p: &Path) -> String {
    p.to_string_lossy().into_owned()
}

#[test]
fn folder_is_searched_recursively_and_only_pdfs_are_kept() {
    let d = sandbox("rec");
    touch(&d.join("a.pdf"));
    touch(&d.join("sub/b.PDF"));
    touch(&d.join("sub/deeper/c.pdf"));
    fs::write(d.join("notes.txt"), b"x").unwrap();
    fs::write(d.join("sub/img.png"), b"x").unwrap();
    let got = expand(&[s(&d)]);
    assert_eq!(got.len(), 3);
    assert!(got.iter().all(|p| p.to_lowercase().ends_with(".pdf")));
}

#[test]
fn single_files_pass_through_and_non_pdfs_are_dropped() {
    let d = sandbox("files");
    touch(&d.join("one.pdf"));
    fs::write(d.join("two.txt"), b"x").unwrap();
    let got = expand(&[s(&d.join("one.pdf")), s(&d.join("two.txt")), s(&d.join("missing.pdf"))]);
    assert_eq!(got, vec![s(&d.join("one.pdf"))]);
}

#[test]
fn duplicates_are_removed() {
    let d = sandbox("dup");
    touch(&d.join("a.pdf"));
    let got = expand(&[s(&d), s(&d.join("a.pdf"))]);
    assert_eq!(got.len(), 1);
}

#[test]
fn results_are_sorted_within_a_folder() {
    let d = sandbox("sort");
    for n in ["c.pdf", "a.pdf", "b.pdf"] {
        touch(&d.join(n));
    }
    let names: Vec<String> = expand(&[s(&d)])
        .iter()
        .map(|p| Path::new(p).file_name().unwrap().to_string_lossy().into_owned())
        .collect();
    assert_eq!(names, vec!["a.pdf", "b.pdf", "c.pdf"]);
}

#[test]
fn depth_is_limited() {
    let d = sandbox("deep");
    let mut p = d.clone();
    for i in 0..=MAX_DEPTH + 2 {
        p = p.join(format!("d{i}"));
    }
    touch(&p.join("too_deep.pdf"));
    touch(&d.join("d0/near.pdf"));
    let got = expand(&[s(&d)]);
    assert_eq!(got.len(), 1);
    assert!(got[0].ends_with("near.pdf"));
}

#[test]
fn existing_reports_per_path() {
    let d = sandbox("exist");
    touch(&d.join("a.pdf"));
    fs::write(d.join("b.txt"), b"x").unwrap();
    let flags = existing(&[s(&d.join("a.pdf")), s(&d.join("gone.pdf")), s(&d.join("b.txt")), s(&d)]);
    assert_eq!(flags, vec![true, false, false, false]);
}

#[test]
fn unreadable_or_missing_folder_gives_nothing() {
    assert!(expand(&["/definitely/not/here".to_string()]).is_empty());
}
