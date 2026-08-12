import { type ChangeEvent, type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

import './App.css';

const DEFAULT_DURATION_SECONDS = 25 * 60;
const MAX_DURATION_SECONDS = 99 * 60 + 59;
const TICK_INTERVAL_MS = 250;

const PRESETS = [
    { label: '5 min', seconds: 5 * 60 },
    { label: '15 min', seconds: 15 * 60 },
    { label: '25 min', seconds: 25 * 60 },
    { label: '45 min', seconds: 45 * 60 },
];

const clampDuration = (seconds: number) => {
    if (!Number.isFinite(seconds)) {
        return 1;
    }

    return Math.min(MAX_DURATION_SECONDS, Math.max(1, Math.trunc(seconds)));
};

const padTime = (value: number) => value.toString().padStart(2, '0');

const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${padTime(minutes)}:${padTime(seconds)}`;
    }

    return `${minutes}:${padTime(seconds)}`;
};

function App() {
    const [durationSeconds, setDurationSeconds] = useState(DEFAULT_DURATION_SECONDS);
    const [remainingMs, setRemainingMs] = useState(DEFAULT_DURATION_SECONDS * 1000);
    const [isRunning, setIsRunning] = useState(false);
    const targetTimestampRef = useRef<number | null>(null);

    const durationMs = durationSeconds * 1000;
    const elapsedMs = Math.max(0, durationMs - remainingMs);
    const progressPercent = Math.min(100, Math.max(0, (elapsedMs / durationMs) * 100));
    const minutesPart = Math.floor(durationSeconds / 60);
    const secondsPart = durationSeconds % 60;
    const isComplete = remainingMs === 0;
    const status = isComplete
        ? 'Complete'
        : isRunning
          ? 'Running'
          : remainingMs === durationMs
            ? 'Ready'
            : 'Paused';

    const displayTime = useMemo(() => formatTime(remainingMs), [remainingMs]);
    const totalTime = useMemo(() => formatTime(durationMs), [durationMs]);
    const elapsedTime = useMemo(() => formatTime(elapsedMs), [elapsedMs]);

    useEffect(() => {
        if (!isRunning) {
            return undefined;
        }

        const tick = () => {
            const targetTimestamp = targetTimestampRef.current ?? Date.now();
            const nextRemainingMs = Math.max(0, targetTimestamp - Date.now());

            setRemainingMs(nextRemainingMs);

            if (nextRemainingMs === 0) {
                targetTimestampRef.current = null;
                setIsRunning(false);
            }
        };

        tick();
        const intervalId = window.setInterval(tick, TICK_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [isRunning]);

    const applyDuration = (seconds: number) => {
        const nextDurationSeconds = clampDuration(seconds);

        targetTimestampRef.current = null;
        setIsRunning(false);
        setDurationSeconds(nextDurationSeconds);
        setRemainingMs(nextDurationSeconds * 1000);
    };

    const updateDurationParts = (minutes: number, seconds: number) => {
        const nextMinutes = Math.min(99, Math.max(0, Math.trunc(minutes)));
        const nextSeconds = Math.min(59, Math.max(0, Math.trunc(seconds)));

        applyDuration(nextMinutes * 60 + nextSeconds);
    };

    const handleMinutesChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateDurationParts(Number(event.target.value), secondsPart);
    };

    const handleSecondsChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateDurationParts(minutesPart, Number(event.target.value));
    };

    const handleStartPause = () => {
        if (isRunning) {
            const nextRemainingMs = targetTimestampRef.current
                ? Math.max(0, targetTimestampRef.current - Date.now())
                : remainingMs;

            targetTimestampRef.current = null;
            setRemainingMs(nextRemainingMs);
            setIsRunning(false);
            return;
        }

        const nextRemainingMs = remainingMs === 0 ? durationMs : remainingMs;

        targetTimestampRef.current = Date.now() + nextRemainingMs;
        setRemainingMs(nextRemainingMs);
        setIsRunning(true);
    };

    const handleReset = () => {
        targetTimestampRef.current = null;
        setIsRunning(false);
        setRemainingMs(durationMs);
    };

    const handleAddMinute = () => {
        const nextDurationSeconds = clampDuration(durationSeconds + 60);
        const addedMs = (nextDurationSeconds - durationSeconds) * 1000;

        if (addedMs <= 0) {
            return;
        }

        if (targetTimestampRef.current) {
            targetTimestampRef.current += addedMs;
        }

        setDurationSeconds(nextDurationSeconds);
        setRemainingMs((currentRemainingMs) =>
            Math.min(nextDurationSeconds * 1000, currentRemainingMs + addedMs),
        );
    };

    const progressStyle = {
        '--progress': `${progressPercent}%`,
    } as CSSProperties;

    return (
        <main className="timer-app">
            <section className="timer-shell" aria-labelledby="timer-title">
                <header className="timer-header">
                    <div>
                        <p className="timer-kicker">Sarah&apos;s App</p>
                        <h1 id="timer-title">Timer</h1>
                    </div>
                    <span className={`status-pill status-${status.toLowerCase()}`}>{status}</span>
                </header>

                <div className="timer-panel">
                    <div className="progress-column">
                        <div
                            className="progress-face"
                            role="timer"
                            aria-label={`Time remaining ${displayTime}`}
                            aria-live={isRunning ? 'off' : 'polite'}
                            style={progressStyle}
                        >
                            <div className="time-readout">{displayTime}</div>
                            <div className="time-caption">of {totalTime}</div>
                        </div>
                    </div>

                    <div className="controls-column">
                        <div className="preset-group" aria-label="Timer presets">
                            {PRESETS.map((preset) => (
                                <button
                                    className="preset-button"
                                    type="button"
                                    aria-pressed={durationSeconds === preset.seconds}
                                    key={preset.seconds}
                                    onClick={() => applyDuration(preset.seconds)}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        <div className="duration-grid" aria-label="Custom duration">
                            <label>
                                <span>Minutes</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={minutesPart}
                                    onChange={handleMinutesChange}
                                />
                            </label>
                            <label>
                                <span>Seconds</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={secondsPart}
                                    onChange={handleSecondsChange}
                                />
                            </label>
                        </div>

                        <div className="action-row">
                            <button className="control-button primary" type="button" onClick={handleStartPause}>
                                {isRunning ? 'Pause' : isComplete ? 'Restart' : 'Start'}
                            </button>
                            <button className="control-button" type="button" onClick={handleReset}>
                                Reset
                            </button>
                            <button className="control-button subtle" type="button" onClick={handleAddMinute}>
                                +1 min
                            </button>
                        </div>

                        <dl className="timer-stats">
                            <div>
                                <dt>Elapsed</dt>
                                <dd>{elapsedTime}</dd>
                            </div>
                            <div>
                                <dt>Remaining</dt>
                                <dd>{displayTime}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default App;
