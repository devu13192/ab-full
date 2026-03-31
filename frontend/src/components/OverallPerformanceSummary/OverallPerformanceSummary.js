import React, { useMemo } from 'react';
import './OverallPerformanceSummary.css';
import { TrendingUp, TrendingDown, Speed, Award } from '@mui/icons-material';

const OverallPerformanceSummary = ({ questionScores }) => {
  const stats = useMemo(() => {
    const total = questionScores.length;
    const totalScore = questionScores.reduce((sum, q) => sum + (q.score || 0), 0);
    const avgScore = totalScore / total;
    const avgScorePercent = (avgScore / 5) * 100;

    const avgFluency = questionScores.reduce((sum, q) => sum + (q.fluencyScore || 0), 0) / total;
    const avgConfidence = questionScores.reduce((sum, q) => {
      const audio = q.audioConfidence || 0;
      const text = q.textConfidence || 0;
      return sum + (audio + text) / 2;
    }, 0) / total;
    const avgTechnical = questionScores.reduce((sum, q) => sum + (q.technicalRelevance || 0), 0) / total;
    const avgRelevance = questionScores.reduce((sum, q) => sum + (q.similarity || 0), 0) / total;

    // Find strongest and weakest areas
    const areas = [
      { name: 'Fluency', score: avgFluency },
      { name: 'Confidence', score: avgConfidence },
      { name: 'Technical Relevance', score: avgTechnical },
      { name: 'Answer Relevance', score: avgRelevance }
    ];

    const strongest = areas.reduce((max, a) => a.score > max.score ? a : max);
    const weakest = areas.reduce((min, a) => a.score < min.score ? a : min);

    // Calculate performance trajectory (are scores improving?)
    const firstHalf = questionScores.slice(0, Math.ceil(total / 2));
    const secondHalf = questionScores.slice(Math.ceil(total / 2));
    const firstHalfAvg = firstHalf.reduce((sum, q) => sum + (q.score || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, q) => sum + (q.score || 0), 0) / secondHalf.length;
    const trajectory = secondHalfAvg >= firstHalfAvg ? 'improving' : 'declining';

    // Count questions by performance level
    const excellent = questionScores.filter(q => (q.score || 0) >= 4).length;
    const good = questionScores.filter(q => (q.score || 0) >= 3 && (q.score || 0) < 4).length;
    const moderate = questionScores.filter(q => (q.score || 0) >= 2 && (q.score || 0) < 3).length;
    const needsWork = questionScores.filter(q => (q.score || 0) < 2).length;

    return {
      total,
      totalScore,
      avgScore,
      avgScorePercent,
      avgFluency,
      avgConfidence,
      avgTechnical,
      avgRelevance,
      strongest,
      weakest,
      trajectory,
      excellent,
      good,
      moderate,
      needsWork,
      firstHalfAvg,
      secondHalfAvg
    };
  }, [questionScores]);

  if (!questionScores || questionScores.length === 0) {
    return null;
  }

  const getMetricColor = (value) => {
    if (value >= 0.8) return '#22c55e';
    if (value >= 0.6) return '#3b82f6';
    if (value >= 0.4) return '#f59e0b';
    return '#ef4444';
  };

  const StatCard = ({ icon, label, value, unit, color }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value" style={{ color }}>
          {value}{unit}
        </span>
      </div>
    </div>
  );

  const PerformanceDistribution = () => (
    <div className="performance-distribution">
      <h4>📈 Performance Distribution</h4>
      <div className="distribution-grid">
        <div className="dist-item excellent">
          <span className="dist-icon">⭐</span>
          <span className="dist-label">Excellent</span>
          <span className="dist-value">{stats.excellent}</span>
          <span className="dist-desc">({Math.round((stats.excellent / stats.total) * 100)}%)</span>
        </div>
        <div className="dist-item good">
          <span className="dist-icon">✓</span>
          <span className="dist-label">Good</span>
          <span className="dist-value">{stats.good}</span>
          <span className="dist-desc">({Math.round((stats.good / stats.total) * 100)}%)</span>
        </div>
        <div className="dist-item moderate">
          <span className="dist-icon">→</span>
          <span className="dist-label">Moderate</span>
          <span className="dist-value">{stats.moderate}</span>
          <span className="dist-desc">({Math.round((stats.moderate / stats.total) * 100)}%)</span>
        </div>
        <div className="dist-item needs-work">
          <span className="dist-icon">⚠</span>
          <span className="dist-label">Needs Work</span>
          <span className="dist-value">{stats.needsWork}</span>
          <span className="dist-desc">({Math.round((stats.needsWork / stats.total) * 100)}%)</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="overall-performance-summary">
      <div className="summary-header">
        <h3>📊 Overall Performance Summary</h3>
        <p>Aggregated metrics across all {stats.total} questions</p>
      </div>

      {/* Key Metrics */}
      <div className="summary-metrics">
        <StatCard
          icon="🎯"
          label="Average Score"
          value={stats.avgScore.toFixed(2)}
          unit="/5.0"
          color={getMetricColor(stats.avgScore / 5)}
        />
        <StatCard
          icon="🎤"
          label="Average Fluency"
          value={Math.round(stats.avgFluency * 100)}
          unit="%"
          color={getMetricColor(stats.avgFluency)}
        />
        <StatCard
          icon="💪"
          label="Average Confidence"
          value={Math.round(stats.avgConfidence * 100)}
          unit="%"
          color={getMetricColor(stats.avgConfidence)}
        />
        <StatCard
          icon="🔧"
          label="Technical Depth"
          value={Math.round(stats.avgTechnical * 100)}
          unit="%"
          color={getMetricColor(stats.avgTechnical)}
        />
      </div>

      {/* Additional Insights */}
      <div className="insights-section">
        <div className="insight-card strength">
          <div className="insight-icon">🏆</div>
          <div className="insight-content">
            <h5>Your Strongest Area</h5>
            <p>{stats.strongest.name}</p>
            <span className="insight-metric" style={{ color: getMetricColor(stats.strongest.score) }}>
              {Math.round(stats.strongest.score * 100)}%
            </span>
            <p className="insight-desc">Keep leveraging this strength in your answers!</p>
          </div>
        </div>

        <div className="insight-card opportunity">
          <div className="insight-icon">🎯</div>
          <div className="insight-content">
            <h5>Area for Improvement</h5>
            <p>{stats.weakest.name}</p>
            <span className="insight-metric" style={{ color: getMetricColor(stats.weakest.score) }}>
              {Math.round(stats.weakest.score * 100)}%
            </span>
            <p className="insight-desc">Focus your practice here for maximum improvement.</p>
          </div>
        </div>

        <div className="insight-card trajectory">
          <div className="insight-icon">
            {stats.trajectory === 'improving' ? '📈' : '📉'}
          </div>
          <div className="insight-content">
            <h5>Performance Trend</h5>
            <p>{stats.trajectory === 'improving' ? 'Improving' : 'Challenging'}</p>
            <span className="insight-metric">
              {stats.trajectory === 'improving' ? '+' : ''}{(stats.secondHalfAvg - stats.firstHalfAvg).toFixed(2)}
            </span>
            <p className="insight-desc">
              {stats.trajectory === 'improving' 
                ? 'Great! You\'re getting better as you progress through questions.'
                : 'You may be experiencing fatigue. Take breaks during practice.'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
      <PerformanceDistribution />

      {/* Detailed Metrics Grid */}
      <div className="detailed-metrics">
        <h4>📋 Detailed Metrics Breakdown</h4>
        <div className="metrics-breakdown">
          <div className="metric-detail">
            <span className="metric-name">Fluency Score</span>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${stats.avgFluency * 100}%`,
                  backgroundColor: getMetricColor(stats.avgFluency)
                }}
              />
            </div>
            <span className="metric-val">{Math.round(stats.avgFluency * 100)}%</span>
          </div>

          <div className="metric-detail">
            <span className="metric-name">Confidence Level</span>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${stats.avgConfidence * 100}%`,
                  backgroundColor: getMetricColor(stats.avgConfidence)
                }}
              />
            </div>
            <span className="metric-val">{Math.round(stats.avgConfidence * 100)}%</span>
          </div>

          <div className="metric-detail">
            <span className="metric-name">Technical Relevance</span>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${stats.avgTechnical * 100}%`,
                  backgroundColor: getMetricColor(stats.avgTechnical)
                }}
              />
            </div>
            <span className="metric-val">{Math.round(stats.avgTechnical * 100)}%</span>
          </div>

          <div className="metric-detail">
            <span className="metric-name">Answer Relevance</span>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${stats.avgRelevance * 100}%`,
                  backgroundColor: getMetricColor(stats.avgRelevance)
                }}
              />
            </div>
            <span className="metric-val">{Math.round(stats.avgRelevance * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Key Takeaways */}
      <div className="key-takeaways">
        <h4>💡 Key Takeaways</h4>
        <ul className="takeaways-list">
          <li>
            <strong>Overall Performance:</strong> You scored an average of{' '}
            <span style={{ color: getMetricColor(stats.avgScore / 5) }}>
              {stats.avgScore.toFixed(2)}/5.0
            </span>{' '}
            ({Math.round(stats.avgScorePercent)}%) across all questions.
          </li>
          <li>
            <strong>Best Performance:</strong> Your {stats.strongest.name.toLowerCase()} is your
            strongest suit at {Math.round(stats.strongest.score * 100)}%.
          </li>
          <li>
            <strong>Focus Area:</strong> Concentrate on improving {stats.weakest.name.toLowerCase()},
            which currently stands at {Math.round(stats.weakest.score * 100)}%.
          </li>
          <li>
            <strong>Consistency:</strong> You{stats.trajectory === 'improving' ? ' are improving your performance' : ' may be experiencing fatigue'} as you
            progress through the interview.
          </li>
          <li>
            <strong>Next Steps:</strong> Review the detailed feedback for each question and focus
            on the recommended improvement areas.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OverallPerformanceSummary;
