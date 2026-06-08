import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AIInsightPanel from '../components/AIInsightPanel';
import '@testing-library/jest-dom';

describe('AIInsightPanel', () => {
  it('renders correctly with given props', () => {
    render(<AIInsightPanel score={75} alertCount={5} />);
    
    expect(screen.getByText(/Cognitive Intelligence Suite/i)).toBeInTheDocument();
    expect(screen.getByText(/ANALYSIS_REPORT:/i)).toBeInTheDocument();
    expect(screen.getByText(/70\/100/i)).toBeInTheDocument(); // breachWeight: 30 + 5*8 = 70
    expect(screen.getByText(/87\/100/i)).toBeInTheDocument(); // platformExposure: 75 + 12 = 87
    expect(screen.getByText(/69\/100/i)).toBeInTheDocument(); // anomalies: 75 - 6 = 69
  });

  it('displays strategic recommendations', () => {
    render(<AIInsightPanel score={75} alertCount={5} />);
    
    expect(screen.getByText(/Strategic Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/CRITICAL/i)).toBeInTheDocument();
    expect(screen.getByText(/RECOMMENDED/i)).toBeInTheDocument();
    expect(screen.getByText(/MODERATE/i)).toBeInTheDocument();
  });
});
