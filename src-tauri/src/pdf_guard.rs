//! Guard for the only file-reading entry point: only real, reasonably sized PDFs are read.
use std::fmt;
use std::fs;
use std::io::ErrorKind;
use std::path::Path;

pub const MAX_BYTES: u64 = 512 * 1024 * 1024;
const MAGIC: &[u8] = b"%PDF-";
const HEADER_WINDOW: usize = 1024;

#[derive(Debug, PartialEq, Eq)]
pub enum GuardError {
    NotFound,
    NotPdf,
    TooLarge,
    Io(String),
}

impl fmt::Display for GuardError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound => write!(f, "not_found"),
            Self::NotPdf => write!(f, "not_pdf"),
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

fn has_pdf_extension(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .is_some_and(|e| e.eq_ignore_ascii_case("pdf"))
}

fn has_pdf_header(bytes: &[u8]) -> bool {
    let head = &bytes[..bytes.len().min(HEADER_WINDOW)];
    head.windows(MAGIC.len()).any(|w| w == MAGIC)
}

pub fn read_pdf_limited(path: &Path, max: u64) -> Result<Vec<u8>, GuardError> {
    if !has_pdf_extension(path) {
        return Err(GuardError::NotPdf);
    }
    let meta = fs::metadata(path).map_err(io_err)?;
    if !meta.is_file() {
        return Err(GuardError::NotFound);
    }
    if meta.len() > max {
        return Err(GuardError::TooLarge);
    }
    let bytes = fs::read(path).map_err(io_err)?;
    if has_pdf_header(&bytes) {
        Ok(bytes)
    } else {
        Err(GuardError::NotPdf)
    }
}

pub fn read_pdf_bytes(path: &Path) -> Result<Vec<u8>, GuardError> {
    read_pdf_limited(path, MAX_BYTES)
}
