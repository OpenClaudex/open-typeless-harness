//! Small persisted provider health snapshot for UI status.

use std::collections::HashMap;
use std::path::PathBuf;

use chrono::Utc;
use serde::{Deserialize, Serialize};

use crate::types::{ProviderHealth, ProviderHealthState};

const HEALTH_FILE: &str = "opentypeless-provider-health.json";
const DOWN_AFTER_FAILURES: u32 = 3;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct ProviderHealthEntry {
    checked_at: Option<String>,
    last_ok_at: Option<String>,
    last_error: Option<String>,
    consecutive_failures: u32,
}

pub fn snapshot(kind: &str, configured: bool) -> ProviderHealth {
    if !configured {
        return ProviderHealth {
            state: ProviderHealthState::NotConfigured,
            ..Default::default()
        };
    }

    let Some(entry) = read_all().remove(kind) else {
        return ProviderHealth {
            state: ProviderHealthState::Unknown,
            ..Default::default()
        };
    };

    let state = if entry.consecutive_failures == 0 && entry.last_ok_at.is_some() {
        ProviderHealthState::Ok
    } else if entry.consecutive_failures >= DOWN_AFTER_FAILURES {
        ProviderHealthState::Down
    } else {
        ProviderHealthState::Unstable
    };

    ProviderHealth {
        state,
        checked_at: entry.checked_at,
        message: entry.last_error,
        consecutive_failures: entry.consecutive_failures,
    }
}

pub fn record_success(kind: &str) {
    update(kind, |entry, now| {
        entry.checked_at = Some(now.clone());
        entry.last_ok_at = Some(now);
        entry.last_error = None;
        entry.consecutive_failures = 0;
    });
}

pub fn record_failure(kind: &str, message: impl Into<String>) {
    update(kind, |entry, now| {
        entry.checked_at = Some(now);
        entry.last_error = Some(message.into());
        entry.consecutive_failures = entry.consecutive_failures.saturating_add(1);
    });
}

fn update(kind: &str, f: impl FnOnce(&mut ProviderHealthEntry, String)) {
    let mut entries = read_all();
    let entry = entries.entry(kind.to_string()).or_default();
    f(entry, Utc::now().to_rfc3339());
    write_all(&entries);
}

fn read_all() -> HashMap<String, ProviderHealthEntry> {
    let Some(path) = health_path() else {
        return HashMap::new();
    };
    let Ok(bytes) = std::fs::read(path) else {
        return HashMap::new();
    };
    serde_json::from_slice(&bytes).unwrap_or_default()
}

fn write_all(entries: &HashMap<String, ProviderHealthEntry>) {
    let Some(path) = health_path() else {
        return;
    };
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let tmp = path.with_extension("tmp");
    if let Ok(json) = serde_json::to_vec_pretty(entries) {
        if std::fs::write(&tmp, json).is_ok() {
            let _ = std::fs::rename(tmp, path);
        }
    }
}

fn health_path() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .map(|home| home.join(".openless").join(HEALTH_FILE))
}
