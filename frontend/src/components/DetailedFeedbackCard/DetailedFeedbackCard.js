import React, { useState } from 'react';
import './DetailedFeedbackCard.css';
import {
  ExpandMore,
  ExpandLess,
  TrendingUp,
  TrendingDown,
  Check,
  Warning,
  Info
} from '@mui/icons-material';

const DetailedFeedbackCard = ({ questionData, questionIndex }) => {
  const [expanded, setExpanded] = useState(false);

  if (!questionData) return null;

  const {
    question = 'N/A',
    userAnswer = 'N/A',
    expectedAnswer = 'N/A',
    score = 0,
    maxScore = 5,
    fluencyScore = 0,
    textConfidence = 0,
    audioConfidence = 0,
    technicalRelevance = 0,
    similarity = 0
  } = questionData;

  const safeScore = score ?? 0;
  const safeAudioConfidence = audioConfidence ?? 0;
  const safeTextConfidence = textConfidence ?? 0;
  const safeMaxScore = maxScore ?? 5;
  const safeFluencyScore = fluencyScore ?? 0;
  const safeTechnicalRelevance = technicalRelevance ?? 0;
  const safeSimilarity = similarity ?? 0;
  const avgConfidence = (safeAudioConfidence + safeTextConfidence) / 2;
  const percentageScore = (safeScore / safeMaxScore) * 100;

  // Determine performance level and color
  const getPerformanceLevel = (value) => {
    if (value >= 0.8) return { level: 'Excellent', color: '#22c55e', icon: '✓' };
    if (value >= 0.6) return { level: 'Good', color: '#3b82f6', icon: '→' };
    if (value >= 0.4) return { level: 'Moderate', color: '#f59e0b', icon: '⚠' };
    return { level: 'Needs Improvement', color: '#ef4444', icon: '✗' };
  };

  const getScoreColor = (score) => {
    if (score >= 4) return '#22c55e';
    if (score >= 3) return '#3b82f6';
    if (score >= 2) return '#f59e0b';
    return '#ef4444';
  };

  // Generate recommendations based on weak areas
  const generateRecommendations = () => {
    const recommendations = [];

    if (safeFluencyScore < 0.6) {
      recommendations.push({
        type: 'Fluency',
        icon: '🎤',
        text: 'Slow down and practice speaking more smoothly. Record yourself answering similar questions and identify filler words (um, uh) that you use. Try pausing briefly between thoughts instead.',
        severity: 'high'
      });
    }

    if (avgConfidence < 0.5) {
      recommendations.push({
        type: 'Confidence',
        icon: '💪',
        text: 'Practice this topic more thoroughly. Your hesitations suggest uncertainty about the answer. Review key concepts and practice explaining them without looking at notes.',
        severity: 'high'
      });
    }

    if (safeTechnicalRelevance < 0.6) {
      recommendations.push({
        type: 'Technical Depth',
        icon: '🔧',
        text: 'Your answer lacks technical terminology. Study industry-standard concepts and practice incorporating them naturally into your explanations.',
        severity: 'medium'
      });
    }

    if (safeSimilarity < 0.6) {
      recommendations.push({
        type: 'Answer Relevance',
        icon: '🎯',
        text: 'Your answer strays from the core question. Focus on directly addressing what is being asked. Structure: (1) Direct answer, (2) Brief explanation, (3) Example if relevant.',
        severity: 'high'
      });
    }

    if (safeSimilarity >= 0.8 && avgConfidence >= 0.8 && safeFluencyScore >= 0.8) {
      recommendations.push({
        type: 'Strengths',
        icon: '⭐',
        text: 'Excellent response! You demonstrated clear understanding, confidence, and fluency. Keep practicing to maintain this level.',
        severity: 'positive'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();
  const scorePerformance = getPerformanceLevel(safeScore / safeMaxScore);

  // Metric rendering component
  const MetricRow = ({ label, icon, value, hasSubmetrics = false, submetrics = null, recommendation = null }) => {
    const performance = getPerformanceLevel(value);
    const percentage = Math.round(value * 100);

    return (
      <div className="metric-row">
        <div className="metric-left">
          <span className="metric-icon">{icon}</span>
          <span className="metric-label">{label}</span>
        </div>
        <div className="metric-center">
          <div className="metric-bar-container">
            <div
              className="metric-bar-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: performance.color
              }}
            />
          </div>
          {hasSubmetrics && submetrics && (
            <div className="submetrics">
              {submetrics.map((sub, idx) => (
                <span key={idx} className="submetric">
                  {sub.label}: {sub.value}%
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="metric-right">
          <span className="metric-percentage">{percentage}%</span>
          <span 
            className="metric-level" 
            style={{ color: performance.color }}
          >
            {performance.level}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="detailed-feedback-card">
      {/* Card Header */}
      <div className="feedback-header" onClick={() => setExpanded(!expanded)}>
        <div className="header-left">
          <h3 className="question-number">Question {questionIndex + 1}</h3>
          <p className="question-preview">{question.substring(0, 60)}...</p>
        </div>
        <div className="header-middle">
          <div
            className="score-badge"
            style={{ backgroundColor: getScoreColor(score ?? 0) }}
          >
            <span className="score-value">{(score ?? 0).toFixed(1)}</span>
            <span className="score-max">/ {maxScore}</span>
          </div>
        </div>
        <div className="header-right">
          <button
            className="expand-btn"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ExpandLess style={{ fontSize: '24px' }} />
            ) : (
              <ExpandMore style={{ fontSize: '24px' }} />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="feedback-content">
          {/* Question and Answer Section */}
          <div className="qa-section">
            <div className="qa-block">
              <h4 className="qa-title">📝 Question</h4>
              <p className="qa-text">{question}</p>
            </div>

            <div className="qa-block">
              <h4 className="qa-title">💬 Your Answer</h4>
              <p className="qa-text user-answer">{userAnswer}</p>
            </div>

            {expectedAnswer && expectedAnswer !== 'N/A' && (
              <div className="qa-block expected">
                <h4 className="qa-title">✅ Expected Answer</h4>
                <p className="qa-text expected-answer">{expectedAnswer}</p>
              </div>
            )}
          </div>

          {/* Detailed Metrics Section */}
          <div className="metrics-section">
            <h4 className="section-title">📊 Performance Metrics</h4>
            <div className="metrics-list">
              <MetricRow
                label="Overall Score"
                icon="🎯"
                value={safeScore / safeMaxScore}
              />
              <MetricRow
                label="Fluency"
                icon="🎤"
                value={safeFluencyScore}
              />
              <MetricRow
                label="Confidence"
                icon="💪"
                value={avgConfidence}
                hasSubmetrics={true}
                submetrics={[
                  { label: 'Audio', value: Math.round(audioConfidence * 100) },
                  { label: 'Text', value: Math.round(textConfidence * 100) }
                ]}
              />
              <MetricRow
                label="Technical Relevance"
                icon="🔧"
                value={safeTechnicalRelevance}
              />
              <MetricRow
                label="Answer Relevance"
                icon="🎯"
                value={safeSimilarity}
              />
            </div>
          </div>

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="recommendations-section">
              <h4 className="section-title">💡 Personalized Recommendations</h4>
              <div className="recommendations-list">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className={`recommendation-item severity-${rec.severity}`}>
                    <div className="rec-header">
                      <span className="rec-icon">{rec.icon}</span>
                      <span className="rec-type">{rec.type}</span>
                      {rec.severity === 'high' && <span className="severity-badge high">High Priority</span>}
                      {rec.severity === 'medium' && <span className="severity-badge medium">Medium</span>}
                      {rec.severity === 'positive' && <span className="severity-badge positive">Great Job!</span>}
                    </div>
                    <p className="rec-text">{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Summary */}
          <div className="feedback-summary">
            <div className="summary-item">
              <div className="summary-icon">
                {scorePerformance.icon}
              </div>
              <div className="summary-content">
                <h5>Overall Performance</h5>
                <p>
                  {scorePerformance.level === 'Excellent' && 'Outstanding! Keep maintaining this level of performance.'}
                  {scorePerformance.level === 'Good' && 'Good performance. Focus on the areas highlighted for improvement.'}
                  {scorePerformance.level === 'Moderate' && 'Moderate performance. Review the recommendations and practice more.'}
                  {scorePerformance.level === 'Needs Improvement' && 'This question needs more preparation. Study the topic and practice.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedFeedbackCard;
