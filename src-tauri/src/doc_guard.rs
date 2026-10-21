//! Guard for the only file-reading entry point: only real, reasonably sized documents (PDF, FB2, FB2.ZIP) are read.
use std::fmt;
use std::fs;
use std::io::ErrorKind;
use std::path::Path;

pub const MAX_BYTES: u64 = 512 * 1024 * 1024;

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum DocKind {
    Pdf,
    Fb2,
    Fb2Zip,
}

#[derive(Debug, PartialEq, Eq)]
pub enum GuardError {
    NotFound,
    NotDoc,
    TooLarge,
    Io(String),
}

impl fmt::Display for GuardError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound => write!(f, "not_found"),
            Self::NotDoc => write!(f, "not_doc"),
            Self::TooLarge => write!(f, "too_large"),
            Self::Io(m) => write!(f, "io: {m}"),
        }
    }
}

fn io_err(e: std::io::Error) -> GuardError {
    if e.kind() == ErrorKind::NotFound {
        GuardError::NotFound
    } else {
        GuardError::Io(e.to_string())
    }
}

/// The document type is decided by the file name only (the content is checked separately).
pub fn doc_kind(path: &Path) -> Option<DocKind> {
    let name = path.file_name()?.to_string_lossy().to_lowercase();
    if name.ends_with(".fb2.zip") {
        Some(DocKind::Fb2Zip)
    } else if name.ends_with(".pdf") {
        Some(DocKind::Pdf)
    } else if name.ends_with(".fb2") {
        Some(DocKind::Fb2)
    } else {
        None
    }
}

fn contains_in_head(bytes: &[u8], needle: &[u8], window: usize) -> bool {
    let head = &bytes[..bytes.len().min(window)];
    head.windows(needle.len()).any(|w| w == needle)
}

fn has_signature(kind: DocKind, bytes: &[u8]) -> bool {
    match kind {
        DocKind::Pdf => contains_in_head(bytes, b"%PDF-", 1024),
        DocKind::Fb2 => contains_in_head(bytes, b"FictionBook", 4096),
        DocKind::Fb2Zip => bytes.starts_with(b"PK\x03\x04"),
    }
}

pub fn read_doc_limited(path: &Path, max: u64) -> Result<Vec<u8>, GuardError> {
    let kind = doc_kind(path).ok_or(GuardError::NotDoc)?;
    let meta = fs::metadata(path).map_err(io_err)?;
    if !meta.is_file() {
        return Err(GuardError::NotFound);
    }
    if meta.len() > max {
        return Err(GuardError::TooLarge);
    }
    let bytes = fs::read(path).map_err(io_err)?;
    if has_signature(kind, &bytes) {
        Ok(bytes)
    } else {
        Err(GuardError::NotDoc)
    }
}

pub fn read_doc_bytes(path: &Path) -> Result<Vec<u8>, GuardError> {
    read_doc_limited(path, MAX_BYTES)
}
