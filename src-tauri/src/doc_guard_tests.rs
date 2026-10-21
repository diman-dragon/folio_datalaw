//! Tests for doc_guard: type by name, content signature, size and missing-file rules.
use std::fs;
use std::path::{Path, PathBuf};

use crate::doc_guard::{doc_kind, read_doc_bytes, read_doc_limited, DocKind, GuardError};

fn temp(name: &str, bytes: &[u8]) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("folio_guard_{}", std::process::id()));
    fs::create_dir_all(&dir).unwrap();
    let p = dir.join(name);
    fs::write(&p, bytes).unwrap();
    p
}

#[test]
fn reads_a_real_pdf() {
    let p = temp("ok.PDF", b"%PDF-1.7\n1 0 obj\n");
    assert_eq!(read_doc_bytes(&p).unwrap(), b"%PDF-1.7\n1 0 obj\n");
}

#[test]
fn reads_fb2_in_any_ascii_compatible_encoding() {
    let utf8 = temp("a.fb2", b"<?xml version=\"1.0\" encoding=\"utf-8\"?><FictionBook xmlns=\"x\">");
    assert!(read_doc_bytes(&utf8).is_ok());
    let cp1251 = temp("b.FB2", b"<?xml version=\"1.0\" encoding=\"windows-1251\"?>\n<FictionBook>");
    assert!(read_doc_bytes(&cp1251).is_ok());
}

#[test]
fn reads_fb2_zip_by_its_zip_signature() {
    let p = temp("book.fb2.zip", b"PK\x03\x04rest-of-archive");
    assert!(read_doc_bytes(&p).is_ok());
}

#[test]
fn a_plain_zip_or_text_file_is_not_a_document() {
    assert_eq!(read_doc_bytes(&temp("archive.zip", b"PK\x03\x04")), Err(GuardError::NotDoc));
    assert_eq!(read_doc_bytes(&temp("secret.txt", b"%PDF-1.7")), Err(GuardError::NotDoc));
}

#[test]
fn content_must_match_the_extension() {
    assert_eq!(read_doc_bytes(&temp("fake.pdf", b"just text")), Err(GuardError::NotDoc));
    assert_eq!(read_doc_bytes(&temp("fake.fb2", b"<html></html>")), Err(GuardError::NotDoc));
    assert_eq!(read_doc_bytes(&temp("fake.fb2.zip", b"not a zip")), Err(GuardError::NotDoc));
}

#[test]
fn kinds_are_recognised_case_insensitively() {
    assert_eq!(doc_kind(Path::new("/x/A.PDF")), Some(DocKind::Pdf));
    assert_eq!(doc_kind(Path::new("/x/A.Fb2")), Some(DocKind::Fb2));
    assert_eq!(doc_kind(Path::new("/x/A.FB2.ZIP")), Some(DocKind::Fb2Zip));
    assert_eq!(doc_kind(Path::new("/x/A.zip")), None);
    assert_eq!(doc_kind(Path::new("/x/noext")), None);
}

#[test]
fn reports_missing_file() {
    let p = std::env::temp_dir().join("folio_no_such_file.pdf");
    assert_eq!(read_doc_bytes(&p), Err(GuardError::NotFound));
}

#[test]
fn rejects_oversized_file() {
    let p = temp("big.pdf", b"%PDF-1.7 0123456789");
    assert_eq!(read_doc_limited(&p, 8), Err(GuardError::TooLarge));
}

#[test]
fn error_codes_are_stable() {
    assert_eq!(GuardError::NotFound.to_string(), "not_found");
    assert_eq!(GuardError::NotDoc.to_string(), "not_doc");
    assert_eq!(GuardError::TooLarge.to_string(), "too_large");
}
