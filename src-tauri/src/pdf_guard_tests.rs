//! Tests for pdf_guard: extension, header, size and missing-file rules.
use std::fs;
use std::path::PathBuf;

use crate::pdf_guard::{read_pdf_bytes, read_pdf_limited, GuardError};

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
    assert_eq!(read_pdf_bytes(&p).unwrap(), b"%PDF-1.7\n1 0 obj\n");
}

#[test]
fn rejects_wrong_extension() {
    let p = temp("secret.txt", b"%PDF-1.7");
    assert_eq!(read_pdf_bytes(&p), Err(GuardError::NotPdf));
}

#[test]
fn rejects_missing_magic() {
    let p = temp("fake.pdf", b"just text, not a pdf");
    assert_eq!(read_pdf_bytes(&p), Err(GuardError::NotPdf));
}

#[test]
fn reports_missing_file() {
    let p = std::env::temp_dir().join("folio_no_such_file.pdf");
    assert_eq!(read_pdf_bytes(&p), Err(GuardError::NotFound));
}

#[test]
fn rejects_oversized_file() {
    let p = temp("big.pdf", b"%PDF-1.7 0123456789");
    assert_eq!(read_pdf_limited(&p, 8), Err(GuardError::TooLarge));
}

#[test]
fn error_codes_are_stable() {
    assert_eq!(GuardError::NotFound.to_string(), "not_found");
    assert_eq!(GuardError::NotPdf.to_string(), "not_pdf");
    assert_eq!(GuardError::TooLarge.to_string(), "too_large");
}
