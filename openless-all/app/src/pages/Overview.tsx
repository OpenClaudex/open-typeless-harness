// Overview.tsx — 真实指标，从 listHistory + getCredentials 派生。

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { getHotkeyTriggerLabel } from '../lib/hotkey';
import { confirmLearningCandidate, getCredentials, getLearningDashboard, ignoreLearningCandidate, listHistory } from '../lib/ipc';
import type { CredentialsStatus, DictationSession, LearningDashboard, LearningDashboardCandidate, LearningHealthSignal, PolishMode, ProviderHealth } from '../lib/types';
import { useHotkeySettings } from '../state/HotkeySettingsContext';
import { Btn, Card, PageHeader, Pill } from './_atoms';

function useModeLabels(): Record<PolishMode, string> {
  const { t } = useTranslation();
  return {
    raw: t('style.modes.raw.name'),
    light: t('style.modes.light.name'),
    structured: t('style.modes.structured.name'),
    formal: t('style.modes.formal.name'),
  };
}

interface OverviewProps {
  onOpenHistory?: () => void;
}

export function Overview({ onOpenHistory }: OverviewProps) {
  const { t } = useTranslation();
  const modeLabel = useModeLabels();
  const [history, setHistory] = useState<DictationSession[]>([]);
  const [creds, setCreds] = useState<CredentialsStatus>({
    volcengineConfigured: false,
    arkConfigured: false,
    asrHealth: { state: 'unknown', checkedAt: null, message: null, consecutiveFailures: 0 },
    llmHealth: { state: 'unknown', checkedAt: null, message: null, consecutiveFailures: 0 },
  });
  const [learning, setLearning] = useState<LearningDashboard | null>(null);
  const [learningAction, setLearningAction] = useState<number | null>(null);
  const { hotkey } = useHotkeySettings();

  const reloadLearning = () => {
    getLearningDashboard().then(setLearning);
  };

  const reloadCredentials = () => {
    getCredentials().then(setCreds);
  };

  useEffect(() => {
    listHistory().then(setHistory);
    reloadCredentials();
    reloadLearning();
    const id = window.setInterval(reloadCredentials, 10_000);
    return () => window.clearInterval(id);
  }, []);

  const confirmCandidate = async (timestampMs: number) => {
    setLearningAction(timestampMs);
    try {
      await confirmLearningCandidate(timestampMs);
      reloadLearning();
    } finally {
      setLearningAction(null);
    }
  };

  const ignoreCandidate = async (timestampMs: number) => {
    setLearningAction(timestampMs);
    try {
      await ignoreLearningCandidate(timestampMs);
      reloadLearning();
    } finally {
      setLearningAction(null);
    }
  };

  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todays = history.filter(s => new Date(s.createdAt) >= today);
    const charsToday = todays.reduce((acc, s) => acc + s.finalText.length, 0);
    const segmentsToday = todays.length;
    const totalDurationMs = todays.reduce((acc, s) => acc + (s.durationMs ?? 0), 0);
    const avgLatencyMs = segmentsToday > 0 ? totalDurationMs / segmentsToday : 0;
    return { charsToday, segmentsToday, totalDurationMs, avgLatencyMs };
  }, [history]);

  // 周历:过去 7 天每天的条数
  const weekly = useMemo(() => {
    const buckets = Array(7).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    history.forEach(s => {
      const d = new Date(s.createdAt);
      const diff = Math.floor((today.getTime() - d.setHours(0, 0, 0, 0)) / 86400000);
      if (diff >= 0 && diff < 7) {
        buckets[6 - diff] += 1;
      }
    });
    return buckets;
  }, [history]);

  return (
    <>
      <PageHeader
        kicker={t('overview.kicker')}
        title={t('overview.title')}
        desc={t('overview.desc')}
      />

      <HarnessLoopCard />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <ProviderCard
          kind={t('overview.asrKind')}
          name={t('overview.asrName')}
          subname={providerHealthSubname(creds.asrHealth, t, t('overview.asrSubname'))}
          health={creds.asrHealth}
        />
        <ProviderCard
          kind={t('overview.llmKind')}
          name={t('overview.llmName')}
          subname={providerHealthSubname(creds.llmHealth, t, creds.arkConfigured ? t('overview.llmConfigured') : t('overview.llmNotConfigured'))}
          health={creds.llmHealth}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        <Metric icon="hash" label={t('overview.metricChars')} value={metrics.charsToday.toLocaleString()} trend={t('overview.metricSegments', { count: metrics.segmentsToday })} />
        <Metric icon="mic" label={t('overview.metricDuration')} value={formatDuration(metrics.totalDurationMs, t)} trend="" />
        <Metric icon="clock" label={t('overview.metricAvg')} value={formatDuration(metrics.avgLatencyMs, t)} trend={metrics.segmentsToday > 0 ? t('overview.metricAvgTrend') : t('overview.metricNoData')} />
        <Metric icon="bolt" label={t('overview.metricTotal')} value={String(history.length)} trend={t('overview.metricTotalTrend')} accent />
      </div>

      <LearningDashboardCard
        dashboard={learning}
        busyCandidate={learningAction}
        onConfirmCandidate={confirmCandidate}
        onIgnoreCandidate={ignoreCandidate}
      />

      {/* 底部一行 = flex:1 撑满剩余高度（父 wrapper 是 display:flex/column）。
          只有「最近识别」内部允许滚动；其他卡片按内容自然高度，不破裂底部圆角。
          issue #243 follow-up：去掉外层 overflow 后底部圆角被裁的视觉问题。 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12, flex: 1, minHeight: 0 }}>
        <Card padding={18} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ol-ink-2)' }}>{t('overview.weekTitle')}</span>
            <span style={{ fontSize: 11, color: 'var(--ol-ink-4)' }}>{t('overview.weekUnit')}</span>
          </div>
          <WeekChart data={weekly} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ol-ink-4)', marginTop: 8 }}>
            {weekDayLabels(t('overview.weekDays', { returnObjects: true }) as string[]).map((d, i) => <span key={i}>{d}</span>)}
          </div>
        </Card>

        <Card padding={0} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '0.5px solid var(--ol-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ol-ink-2)' }}>{t('overview.recentTitle')}</span>
            <Btn size="sm" variant="ghost" onClick={onOpenHistory}>{t('overview.recentAll')}</Btn>
          </div>
          <div className="ol-thinscroll" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {history.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: 'var(--ol-ink-4)' }}>
                {t('overview.recentEmpty', { trigger: getHotkeyTriggerLabel(hotkey?.trigger) })}
              </div>
            )}
            {history.slice(0, 5).map(s => (
              <RecentRow key={s.id} session={s} modeLabel={modeLabel} />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function LearningDashboardCard({
  dashboard,
  busyCandidate,
  onConfirmCandidate,
  onIgnoreCandidate,
}: {
  dashboard: LearningDashboard | null;
  busyCandidate: number | null;
  onConfirmCandidate: (timestampMs: number) => void;
  onIgnoreCandidate: (timestampMs: number) => void;
}) {
  const { t } = useTranslation();
  const healthCount = dashboard
    ? dashboard.initialQueryFailuresToday + dashboard.fallbackEventsToday + dashboard.unrelatedStopsToday
    : 0;
  const latest = dashboard?.latestCandidates ?? [];
  const signals = dashboard?.latestSignals ?? [];
  const lowConfidenceCount = dashboard?.lowConfidenceCandidatesToday ?? 0;
  const latestHotwords = dashboard?.latestHotwords ?? [];
  const summary = dashboard
    ? t('overview.learningSummary', {
      edits: dashboard.editEventsToday,
      accepted: dashboard.acceptedTrajectoriesToday,
      candidates: dashboard.learningCandidatesToday,
      skills: dashboard.totalSpeechSkills,
    })
    : t('overview.learningLoading');
  return (
    <Card
      padding={16}
      style={{
        marginBottom: 18,
        background: 'linear-gradient(135deg, rgba(10,10,11,0.035), rgba(255,255,255,0.94) 42%, rgba(15,118,110,0.08))',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, marginBottom: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon name="sparkle" size={14} />
            <span style={{ fontSize: 13, fontWeight: 650, color: 'var(--ol-ink)' }}>{t('overview.learningTitle')}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ol-ink-3)', lineHeight: 1.5 }}>{t('overview.learningDesc')}</div>
        </div>
        <Pill tone={healthCount > 0 ? 'blue' : 'ok'} size="sm">
          {healthCount > 0 ? t('overview.learningGuarded', { count: healthCount }) : t('overview.learningClean')}
        </Pill>
      </div>

      {latest[0] && <LearningFeedback candidate={latest[0]} />}

      <div
        style={{
          border: '0.5px solid var(--ol-line-soft)',
          borderRadius: 12,
          padding: 12,
          background: 'rgba(255,255,255,0.58)',
          marginBottom: 12,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 12, color: 'var(--ol-ink-2)', lineHeight: 1.5 }}>{summary}</div>
        <Pill tone={lowConfidenceCount > 0 ? 'outline' : 'ok'} size="sm">
          {lowConfidenceCount > 0
            ? t('overview.learningQueue', { count: lowConfidenceCount })
            : t('overview.learningQueueClean')}
        </Pill>
      </div>

      {latestHotwords.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 650, color: 'var(--ol-ink-3)' }}>{t('overview.learningWeakHotwords')}</span>
          {latestHotwords.map(term => (
            <Pill key={term} tone="default" size="sm">{term}</Pill>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 14 }}>
        <LearningMetric label={t('overview.learningMetricMonitors')} value={dashboard?.monitorStartsToday ?? 0} />
        <LearningMetric label={t('overview.learningMetricEdits')} value={dashboard?.editEventsToday ?? 0} />
        <LearningMetric label={t('overview.learningMetricAccepted')} value={dashboard?.acceptedTrajectoriesToday ?? 0} />
        <LearningMetric label={t('overview.learningMetricCandidates')} value={dashboard?.learningCandidatesToday ?? 0} />
        <LearningMetric label={t('overview.learningMetricSkills')} value={dashboard?.totalSpeechSkills ?? 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(220px, 0.65fr)', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 650, color: 'var(--ol-ink-3)', marginBottom: 8 }}>{t('overview.learningCandidatesTitle')}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {latest.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--ol-ink-4)', padding: '10px 0' }}>
                {t('overview.learningEmpty')}
              </div>
            ) : latest.map((candidate, index) => (
              <LearningCandidateCard
                key={`${candidate.timestampMs}-${index}`}
                candidate={candidate}
                busy={busyCandidate === candidate.timestampMs}
                onConfirm={onConfirmCandidate}
                onIgnore={onIgnoreCandidate}
              />
            ))}
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 650, color: 'var(--ol-ink-3)', marginBottom: 8 }}>{t('overview.learningSignalsTitle')}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {signals.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--ol-ink-4)', padding: '10px 0' }}>
                {t('overview.learningSignalsEmpty')}
              </div>
            ) : signals.map((signal, index) => (
              <LearningSignalRow key={`${signal.timestampMs}-${index}`} signal={signal} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function LearningFeedback({ candidate }: { candidate: LearningDashboardCandidate }) {
  const { t } = useTranslation();
  const needsReview = candidate.status === 'needs_review';
  const message = needsReview
    ? t('overview.learningFeedbackReview')
    : t('overview.learningFeedbackAuto', {
      from: candidate.from || '∅',
      to: candidate.to || '∅',
    });
  return (
    <div
      style={{
        borderRadius: 12,
        padding: '10px 12px',
        marginBottom: 12,
        background: needsReview ? 'rgba(0,0,0,0.035)' : 'rgba(15,118,110,0.10)',
        color: needsReview ? 'var(--ol-ink-3)' : 'var(--ol-blue)',
        fontSize: 12,
        fontWeight: 650,
      }}
    >
      {message}
    </div>
  );
}

function LearningCandidateCard({
  candidate,
  busy,
  onConfirm,
  onIgnore,
}: {
  candidate: LearningDashboardCandidate;
  busy: boolean;
  onConfirm: (timestampMs: number) => void;
  onIgnore: (timestampMs: number) => void;
}) {
  const { t } = useTranslation();
  const needsReview = candidate.status === 'needs_review';
  const tone = needsReview ? 'outline' : 'ok';
  return (
    <div
      style={{
        border: '0.5px solid var(--ol-line-soft)',
        borderRadius: 12,
        padding: 12,
        background: 'rgba(255,255,255,0.62)',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <Pill tone={tone} size="sm">
          {learningCandidateStatusLabel(candidate, t)}
        </Pill>
        <span style={{ fontSize: 10.5, color: 'var(--ol-ink-4)', fontFamily: 'var(--ol-font-mono)' }}>
          {formatTimestamp(candidate.timestampMs)}
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ol-ink-2)', lineHeight: 1.45 }}>
        <span style={{ color: 'var(--ol-ink-4)' }}>{candidate.from || '∅'}</span>
        <span style={{ padding: '0 6px', color: 'var(--ol-blue)' }}>→</span>
        <b>{candidate.to || '∅'}</b>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ol-ink-4)', lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {candidate.finalTextPreview}
      </div>
      {needsReview && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <Btn size="sm" variant="blue" disabled={busy} onClick={() => onConfirm(candidate.timestampMs)}>
            {t('overview.learningActionConfirm')}
          </Btn>
          <Btn size="sm" variant="ghost" disabled={busy} onClick={() => onIgnore(candidate.timestampMs)}>
            {t('overview.learningActionIgnore')}
          </Btn>
        </div>
      )}
    </div>
  );
}

function LearningSignalRow({ signal }: { signal: LearningHealthSignal }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        border: '0.5px solid var(--ol-line-soft)',
        borderRadius: 12,
        padding: 10,
        background: 'rgba(255,255,255,0.46)',
      }}
    >
      <div style={{ fontSize: 11.5, color: 'var(--ol-ink-2)', lineHeight: 1.35 }}>
        {learningSignalLabel(signal, t)}
      </div>
      <div style={{ marginTop: 5, fontSize: 10.5, color: 'var(--ol-ink-4)', fontFamily: 'var(--ol-font-mono)' }}>
        {formatTimestamp(signal.timestampMs)}
      </div>
    </div>
  );
}

function LearningMetric({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: '0.5px solid var(--ol-line-soft)', borderRadius: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.52)' }}>
      <div style={{ fontSize: 10.5, color: 'var(--ol-ink-4)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 650, color: 'var(--ol-ink)', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

function HarnessLoopCard() {
  const { t } = useTranslation();
  return (
    <Card
      padding={16}
      style={{
        marginBottom: 18,
        background: 'linear-gradient(135deg, rgba(15,118,110,0.10), rgba(255,255,255,0.92) 48%, rgba(10,10,11,0.035))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 18,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--ol-ink)', marginBottom: 4 }}>{t('overview.loopTitle')}</div>
        <div style={{ fontSize: 12, color: 'var(--ol-ink-3)', lineHeight: 1.5 }}>{t('overview.loopDesc')}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Pill tone="blue" size="sm">{t('overview.loopAsr')}</Pill>
        <Pill tone="default" size="sm">{t('overview.loopPolish')}</Pill>
        <Pill tone="dark" size="sm">{t('overview.loopMonitor')}</Pill>
        <Pill tone="ok" size="sm">{t('overview.loopSkill')}</Pill>
      </div>
    </Card>
  );
}

interface ProviderCardProps {
  kind: string;
  name: string;
  subname: string;
  health: ProviderHealth;
}

function ProviderCard({ kind, name, subname, health }: ProviderCardProps) {
  const { t } = useTranslation();
  // ASR 卡用 mic 图标，其他用 sparkle —— 通过比较译文判断会随语言改变，故改用本地化无关的字面量比较。
  const isAsr = kind === t('overview.asrKind');
  const healthTone = providerHealthTone(health);
  return (
    <Card padding={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'var(--ol-blue-soft)',
          color: 'var(--ol-blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name={isAsr ? 'mic' : 'sparkle'} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 11, color: 'var(--ol-ink-4)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>{kind}</span>
          <Pill tone={healthTone} size="sm">
            <span style={{ width: 5, height: 5, borderRadius: 999, background: providerHealthDot(health), flexShrink: 0 }} />
            {providerHealthLabel(health, t)}
          </Pill>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ol-ink)' }}>{name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ol-ink-3)', marginTop: 1, fontFamily: 'var(--ol-font-mono)' }}>{subname}</div>
      </div>
    </Card>
  );
}

interface MetricProps {
  icon: string;
  label: string;
  value: string;
  trend: string;
  accent?: boolean;
}

function Metric({ icon, label, value, trend, accent }: MetricProps) {
  return (
    <Card padding={16}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--ol-ink-3)' }}>
        <Icon name={icon} size={13} />
        <span style={{ fontSize: 11.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: accent ? 'var(--ol-blue)' : 'var(--ol-ink)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ol-ink-4)', marginTop: 6 }}>{trend || ' '}</div>
    </Card>
  );
}

function WeekChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
      {data.map((v, i) => {
        const isToday = i === 6;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 9.5, color: isToday ? 'var(--ol-blue)' : 'var(--ol-ink-4)', fontWeight: isToday ? 600 : 400 }}>{v}</div>
            <div
              style={{
                width: '100%',
                height: `${(v / max) * 80}px`,
                minHeight: 2,
                borderRadius: 4,
                background: isToday ? 'var(--ol-blue)' : 'var(--ol-ink)',
                opacity: v === 0 ? 0.15 : isToday ? 1 : 0.85,
                transition: 'height 0.18s var(--ol-motion-soft), opacity 0.18s var(--ol-motion-soft)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function RecentRow({ session, modeLabel }: { session: DictationSession; modeLabel: Record<PolishMode, string> }) {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--ol-line-soft)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, minWidth: 60 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--ol-font-mono)', color: 'var(--ol-ink-3)' }}>
          {formatTime(session.createdAt)}
        </span>
        <Pill size="sm" tone="default">{modeLabel[session.mode]}</Pill>
      </div>
      <div style={{ flex: 1, fontSize: 12.5, color: 'var(--ol-ink-2)', whiteSpace: 'pre-line', lineHeight: 1.55, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {session.finalText.split('\n')[0]}
      </div>
      <span style={{ fontSize: 10.5, color: 'var(--ol-ink-4)', fontFamily: 'var(--ol-font-mono)' }}>
        {formatDuration(session.durationMs ?? 0, t)}
      </span>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const pad = (n: number) => String(n).padStart(2, '0');
  if (sameDay) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTimestamp(timestampMs: number): string {
  if (!timestampMs) return '—';
  return formatTime(new Date(timestampMs).toISOString());
}

function providerHealthLabel(health: ProviderHealth, t: ReturnType<typeof useTranslation>['t']): string {
  switch (health.state) {
    case 'notConfigured':
      return t('overview.statusNotConfigured');
    case 'ok':
      return t('overview.providerHealthOk');
    case 'unstable':
      return t('overview.providerHealthUnstable');
    case 'down':
      return t('overview.providerHealthDown');
    default:
      return t('overview.providerHealthUnknown');
  }
}

function providerHealthSubname(health: ProviderHealth, t: ReturnType<typeof useTranslation>['t'], fallback: string): string {
  if (health.state === 'ok' && health.checkedAt) {
    return t('overview.providerHealthCheckedAt', { time: formatTime(health.checkedAt) });
  }
  if ((health.state === 'unstable' || health.state === 'down') && health.checkedAt) {
    return t('overview.providerHealthLastCheckedAt', { time: formatTime(health.checkedAt) });
  }
  return fallback;
}

function providerHealthTone(health: ProviderHealth): 'default' | 'blue' | 'ok' | 'outline' | 'dark' {
  if (health.state === 'ok') return 'ok';
  if (health.state === 'unstable') return 'blue';
  if (health.state === 'down' || health.state === 'notConfigured') return 'outline';
  return 'default';
}

function providerHealthDot(health: ProviderHealth): string {
  if (health.state === 'ok') return 'var(--ol-ok)';
  if (health.state === 'unstable') return 'var(--ol-blue)';
  if (health.state === 'down') return 'var(--ol-warn)';
  return 'var(--ol-ink-4)';
}

function learningCandidateStatusLabel(candidate: LearningDashboardCandidate, t: ReturnType<typeof useTranslation>['t']): string {
  if (candidate.status === 'needs_review') return t('overview.learningStatusNeedsReview');
  if (candidate.status === 'confirmed') return t('overview.learningStatusConfirmed');
  if (candidate.status === 'auto_learned') return t('overview.learningStatusAutoLearned');
  if (candidate.confidence === 'high') return t('overview.learningConfidenceHigh');
  if (candidate.confidence === 'medium') return t('overview.learningConfidenceMedium');
  return candidate.confidence;
}

function learningSignalLabel(signal: LearningHealthSignal, t: ReturnType<typeof useTranslation>['t']): string {
  switch (signal.event) {
    case 'initial_query_failed':
      return t('overview.learningSignalInitialQueryFailed');
    case 'keyboard_fallback_start':
      return t('overview.learningSignalKeyboardFallbackStart');
    case 'keyboard_fallback_timeout':
      return t('overview.learningSignalKeyboardFallbackTimeout');
    case 'target_field_unrelated':
      return t('overview.learningSignalTargetFieldUnrelated');
    case 'keyboard_fallback_unavailable':
      return t('overview.learningSignalKeyboardFallbackUnavailable');
    default:
      return signal.label || signal.event;
  }
}

function formatDuration(ms: number, t: ReturnType<typeof useTranslation>['t']): string {
  if (ms <= 0) return '—';
  const sec = ms / 1000;
  if (sec < 60) return t('common.durationSeconds', { value: sec.toFixed(1) });
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
}

function weekDayLabels(names: string[]): string[] {
  const today = new Date().getDay();
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    out.push(names[(today - i + 7) % 7]);
  }
  return out;
}
