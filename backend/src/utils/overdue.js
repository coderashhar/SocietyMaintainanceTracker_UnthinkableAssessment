/**
 * Overdue threshold helper.
 *
 * OVERDUE_THRESHOLD_DAYS env var controls how many days before an
 * unresolved complaint is considered overdue.
 *
 * Default: 7 days. Change via OVERDUE_THRESHOLD_DAYS in your .env.
 */
export function getOverdueThresholdDays() {
  const raw = process.env.OVERDUE_THRESHOLD_DAYS;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed) || parsed < 1) {
    return 7; // safe default
  }
  return parsed;
}

/**
 * Returns a Postgres INTERVAL string for use in $queryRaw.
 * e.g. "7 days"
 */
export function getOverdueInterval() {
  return `${getOverdueThresholdDays()} days`;
}
