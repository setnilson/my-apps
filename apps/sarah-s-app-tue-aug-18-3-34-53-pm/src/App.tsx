import { useMemo, useState } from 'react';

import './App.css';

type Operator = 'add' | 'subtract' | 'multiply' | 'divide';

type CalculatorState = {
    display: string;
    storedValue: number | null;
    pendingOperator: Operator | null;
    shouldResetDisplay: boolean;
};

type CalculatorKey =
    | { kind: 'clear'; label: string }
    | { kind: 'sign'; label: string }
    | { kind: 'percent'; label: string }
    | { kind: 'backspace'; label: string; ariaLabel: string }
    | { kind: 'digit'; label: string; value: string }
    | { kind: 'decimal'; label: string }
    | { kind: 'operator'; label: string; value: Operator }
    | { kind: 'equals'; label: string };

const initialState: CalculatorState = {
    display: '0',
    storedValue: null,
    pendingOperator: null,
    shouldResetDisplay: false,
};

const keys: CalculatorKey[] = [
    { kind: 'clear', label: 'C' },
    { kind: 'sign', label: '+/-' },
    { kind: 'percent', label: '%' },
    { kind: 'operator', label: '/', value: 'divide' },
    { kind: 'digit', label: '7', value: '7' },
    { kind: 'digit', label: '8', value: '8' },
    { kind: 'digit', label: '9', value: '9' },
    { kind: 'operator', label: 'x', value: 'multiply' },
    { kind: 'digit', label: '4', value: '4' },
    { kind: 'digit', label: '5', value: '5' },
    { kind: 'digit', label: '6', value: '6' },
    { kind: 'operator', label: '-', value: 'subtract' },
    { kind: 'digit', label: '1', value: '1' },
    { kind: 'digit', label: '2', value: '2' },
    { kind: 'digit', label: '3', value: '3' },
    { kind: 'operator', label: '+', value: 'add' },
    { kind: 'backspace', label: 'Del', ariaLabel: 'Delete last digit' },
    { kind: 'digit', label: '0', value: '0' },
    { kind: 'decimal', label: '.' },
    { kind: 'equals', label: '=' },
];

function calculate(left: number, right: number, operator: Operator): number | null {
    switch (operator) {
        case 'add':
            return left + right;
        case 'subtract':
            return left - right;
        case 'multiply':
            return left * right;
        case 'divide':
            return right === 0 ? null : left / right;
    }
}

function formatDisplay(value: number): string {
    if (!Number.isFinite(value)) {
        return 'Error';
    }

    const rounded = Number(value.toPrecision(12));
    return String(rounded);
}

function inputDigit(state: CalculatorState, digit: string): CalculatorState {
    if (state.display === 'Error' || state.shouldResetDisplay) {
        return {
            ...state,
            display: digit,
            shouldResetDisplay: false,
        };
    }

    return {
        ...state,
        display: state.display === '0' ? digit : `${state.display}${digit}`,
    };
}

function inputDecimal(state: CalculatorState): CalculatorState {
    if (state.display === 'Error' || state.shouldResetDisplay) {
        return {
            ...state,
            display: '0.',
            shouldResetDisplay: false,
        };
    }

    if (state.display.includes('.')) {
        return state;
    }

    return {
        ...state,
        display: `${state.display}.`,
    };
}

function setOperator(state: CalculatorState, operator: Operator): CalculatorState {
    if (state.display === 'Error') {
        return initialState;
    }

    const currentValue = Number(state.display);

    if (state.storedValue === null || state.pendingOperator === null) {
        return {
            display: state.display,
            storedValue: currentValue,
            pendingOperator: operator,
            shouldResetDisplay: true,
        };
    }

    if (state.shouldResetDisplay) {
        return {
            ...state,
            pendingOperator: operator,
        };
    }

    const result = calculate(state.storedValue, currentValue, state.pendingOperator);
    if (result === null) {
        return {
            ...initialState,
            display: 'Error',
            shouldResetDisplay: true,
        };
    }

    return {
        display: formatDisplay(result),
        storedValue: result,
        pendingOperator: operator,
        shouldResetDisplay: true,
    };
}

function finishCalculation(state: CalculatorState): CalculatorState {
    if (
        state.display === 'Error' ||
        state.storedValue === null ||
        state.pendingOperator === null
    ) {
        return state;
    }

    const result = calculate(
        state.storedValue,
        Number(state.display),
        state.pendingOperator,
    );

    if (result === null) {
        return {
            ...initialState,
            display: 'Error',
            shouldResetDisplay: true,
        };
    }

    return {
        display: formatDisplay(result),
        storedValue: null,
        pendingOperator: null,
        shouldResetDisplay: true,
    };
}

function applyKey(state: CalculatorState, key: CalculatorKey): CalculatorState {
    switch (key.kind) {
        case 'clear':
            return initialState;
        case 'sign':
            if (state.display === '0' || state.display === 'Error') {
                return state;
            }
            return {
                ...state,
                display: state.display.startsWith('-')
                    ? state.display.slice(1)
                    : `-${state.display}`,
            };
        case 'percent':
            if (state.display === 'Error') {
                return state;
            }
            return {
                ...state,
                display: formatDisplay(Number(state.display) / 100),
            };
        case 'backspace':
            if (state.display === 'Error' || state.shouldResetDisplay) {
                return {
                    ...state,
                    display: '0',
                    shouldResetDisplay: false,
                };
            }
            return {
                ...state,
                display:
                    state.display.length > 1
                        ? state.display.slice(0, -1)
                        : '0',
            };
        case 'digit':
            return inputDigit(state, key.value);
        case 'decimal':
            return inputDecimal(state);
        case 'operator':
            return setOperator(state, key.value);
        case 'equals':
            return finishCalculation(state);
    }
}

function App() {
    const [state, setState] = useState<CalculatorState>(initialState);
    const activeOperator = state.pendingOperator;

    const displayValue = useMemo(() => {
        if (state.display === 'Error' || state.display.endsWith('.')) {
            return state.display;
        }

        return state.display.includes('.')
            ? state.display
            : new Intl.NumberFormat('en-US', {
                  maximumFractionDigits: 10,
                  useGrouping: true,
              }).format(Number(state.display));
    }, [state.display]);

    return (
        <main className="app-shell">
            <section className="calculator" aria-label="Calculator">
                <div className="calculator-header">
                    <p className="eyebrow">Datadog App</p>
                    <h1>Calculator</h1>
                </div>
                <output className="display" aria-live="polite">
                    {displayValue}
                </output>
                <div className="keypad">
                    {keys.map((key) => {
                        const isOperator =
                            key.kind === 'operator' || key.kind === 'equals';
                        const isActiveOperator =
                            key.kind === 'operator' &&
                            key.value === activeOperator &&
                            state.shouldResetDisplay;

                        return (
                            <button
                                className={[
                                    'key',
                                    isOperator ? 'key-operator' : '',
                                    key.kind === 'clear' ? 'key-danger' : '',
                                    isActiveOperator ? 'key-active' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                key={key.label}
                                onClick={() =>
                                    setState((current) => applyKey(current, key))
                                }
                                aria-label={
                                    key.kind === 'backspace'
                                        ? key.ariaLabel
                                        : undefined
                                }
                                type="button"
                            >
                                {key.label}
                            </button>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}

export default App;
