import React,{useEffect,useState} from 'react'
import ProfessionalNavbar from '../../components/Navbar/ProfessionalNavbar'
import "./Profile.css"
import { UserAuth} from '../../context/AuthContext';
import {  useNavigate } from 'react-router-dom'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent';
import Footer from '../../components/Footer/Footer';
import axios from 'axios';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { Edit, Check, Close } from '@mui/icons-material';
import { 
    TrendingUp, 
    Assessment, 
    Schedule, 
    Star,
    PlayArrow,
    History,
    Settings,
    Logout,
    Email,
    CalendarToday,
    Timeline,
    CheckCircle
} from '@mui/icons-material';

const Profile = () => {
  const navigate = useNavigate()
  const {logout,user}  = UserAuth()
  const [loading,setLoading] = useState(true)
  const [userData,setUserData] = useState({})
  const [interviewCount,setInterviewCount] = useState(0)
  const [recentInterviews,setRecentInterviews] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [averageScore,setAverageScore] = useState(0)
  const [totalQuestions,setTotalQuestions] = useState(0)
  const [showOnlyPassing, setShowOnlyPassing] = useState(false)
  const [monthlyScoreChange, setMonthlyScoreChange] = useState(0)
  const [weeklyInterviewChange, setWeeklyInterviewChange] = useState(0)
  const [dailyQuestionChange, setDailyQuestionChange] = useState(0)
  const [technicalSkillsScore, setTechnicalSkillsScore] = useState(0)
  const [communicationScore, setCommunicationScore] = useState(0)
  const [userSkills, setUserSkills] = useState([])
  const [skillCategories, setSkillCategories] = useState({})
  const [performanceInsights, setPerformanceInsights] = useState({})
  const [achievementBadges, setAchievementBadges] = useState([])
  const [weakAreas, setWeakAreas] = useState([])
  const [strengths, setStrengths] = useState([])
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [imageError, setImageError] = useState(false)

  const handleLogout = async ()=>{
      try {
        await logout();
    } catch (error) {
        console.log(error);
    }
  }

  useEffect(()=>{
    if(user == null){
        navigate('/')
    }
},[user,navigate])

useEffect(()=>{
  if(user?.uid) {
    // Fetch user data
  axios.get(`/user/${user.uid}`).then((response)=>{
    setUserData(response.data)
    setLoading(false)
  }).catch((err)=>{
    console.log(err);
      setLoading(false)
  })

    // Fetch user interviews
  axios.get(`/userInterview/${user.uid}`).then((response)=>{
      const interviews = response.data
      console.log('Fetched interviews:', interviews) // Debug log
      setInterviewCount(interviews.length)
      // Sort by newest first using createdAt (added via timestamps)
      const sorted = [...interviews].sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime()
        const db = new Date(b.createdAt || 0).getTime()
        return db - da
      })
      setRecentInterviews(sorted)
      
      // Calculate real statistics from interview data
      if(interviews.length > 0) {
        console.log('Processing interviews for calculations...') // Debug log
        
        // Handle different possible score field names
        const totalScore = interviews.reduce((sum, interview) => {
          const score = interview.score || interview.totalScore || interview.finalScore || 0
          console.log('Interview score:', score, 'from interview:', interview) // Debug log
          return sum + score
        }, 0)
        const avgScore = Math.round(totalScore / interviews.length)
        console.log('Calculated average score:', avgScore) // Debug log
        setAverageScore(avgScore)
        
        // Calculate total questions answered - handle different field names
        const totalQ = interviews.reduce((sum, interview) => {
          const questions = interview.questionsAnswered || interview.totalQuestions || interview.questionsCount || 0
          return sum + questions
        }, 0)
        console.log('Calculated total questions:', totalQ) // Debug log
        setTotalQuestions(totalQ)
        
        // Calculate monthly score change
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        const recentInterviews = interviews.filter(iv => new Date(iv.createdAt || 0) >= oneMonthAgo)
        const oldInterviews = interviews.filter(iv => new Date(iv.createdAt || 0) < oneMonthAgo)
        
        if (recentInterviews.length > 0 && oldInterviews.length > 0) {
          const recentAvg = recentInterviews.reduce((sum, iv) => sum + (iv.score || 0), 0) / recentInterviews.length
          const oldAvg = oldInterviews.reduce((sum, iv) => sum + (iv.score || 0), 0) / oldInterviews.length
          setMonthlyScoreChange(Math.round(recentAvg - oldAvg))
        } else {
          setMonthlyScoreChange(0)
        }
        
        // Calculate weekly interview change
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const weeklyInterviews = interviews.filter(iv => new Date(iv.createdAt || 0) >= oneWeekAgo)
        setWeeklyInterviewChange(weeklyInterviews.length)
        
        // Calculate daily question change
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayInterviews = interviews.filter(iv => {
          const interviewDate = new Date(iv.createdAt || 0)
          interviewDate.setHours(0, 0, 0, 0)
          return interviewDate.getTime() === today.getTime()
        })
        const todayQuestions = todayInterviews.reduce((sum, iv) => sum + (iv.questionsAnswered || 0), 0)
        setDailyQuestionChange(todayQuestions)
        
        // Calculate skill-based scores (simplified calculation)
        const technicalInterviews = interviews.filter(iv => 
          iv.role && (iv.role.toLowerCase().includes('developer') || 
                     iv.role.toLowerCase().includes('engineer') || 
                     iv.role.toLowerCase().includes('technical'))
        )
        const communicationInterviews = interviews.filter(iv => 
          iv.role && (iv.role.toLowerCase().includes('manager') || 
                     iv.role.toLowerCase().includes('lead') || 
                     iv.role.toLowerCase().includes('director'))
        )
        
        // Calculate skill-based scores with better fallbacks
        if (technicalInterviews.length > 0) {
          const techAvg = technicalInterviews.reduce((sum, iv) => {
            const score = iv.score || iv.totalScore || iv.finalScore || 0
            return sum + score
          }, 0) / technicalInterviews.length
          setTechnicalSkillsScore(Math.round(techAvg))
        } else if (avgScore > 0) {
          setTechnicalSkillsScore(Math.round(avgScore * 0.8)) // Default to 80% of overall score
        } else {
          setTechnicalSkillsScore(0) // No data available
        }
        
        if (communicationInterviews.length > 0) {
          const commAvg = communicationInterviews.reduce((sum, iv) => {
            const score = iv.score || iv.totalScore || iv.finalScore || 0
            return sum + score
          }, 0) / communicationInterviews.length
          setCommunicationScore(Math.round(commAvg))
        } else if (avgScore > 0) {
          setCommunicationScore(Math.round(avgScore * 0.7)) // Default to 70% of overall score
        } else {
          setCommunicationScore(0) // No data available
        }
        
        // Calculate skills and insights from real data
        calculateSkillsAndInsights(interviews, avgScore)
        
        console.log('Final calculated values:', {
          averageScore: avgScore,
          totalQuestions: totalQ,
          technicalSkills: technicalInterviews.length > 0 ? Math.round(technicalInterviews.reduce((sum, iv) => sum + (iv.score || 0), 0) / technicalInterviews.length) : Math.round(avgScore * 0.8),
          communication: communicationInterviews.length > 0 ? Math.round(communicationInterviews.reduce((sum, iv) => sum + (iv.score || 0), 0) / communicationInterviews.length) : Math.round(avgScore * 0.7)
        }) // Debug log
      } else {
        // Reset all values if no interviews
        setAverageScore(0)
        setTotalQuestions(0)
        setMonthlyScoreChange(0)
        setWeeklyInterviewChange(0)
        setDailyQuestionChange(0)
        setTechnicalSkillsScore(0)
        setCommunicationScore(0)
      }

    }).catch((err)=>{
      console.log(err);
    })
  }
  document.title = 'Dashboard'
},[user?.uid])

  const getScoreColor = (score) => {
    if(score >= 80) return '#10B981' // Green
    if(score >= 60) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  const getScoreLabel = (score) => {
    if(score >= 80) return 'Excellent'
    if(score >= 60) return 'Good'
    if(score >= 40) return 'Fair'
    return 'Needs Work'
  }

  const formatTrendText = (value, suffix = '') => {
    if (value > 0) return `+${value}${suffix}`
    if (value < 0) return `${value}${suffix}`
    return `0${suffix}`
  }

  // Calculate skills and insights from real interview data
  const calculateSkillsAndInsights = (interviews, avgScore) => {
    if (interviews.length === 0) return

    // Extract skills from interview roles and topics
    const skillMap = new Map()
    const categoryMap = new Map()
    const performanceData = []

    interviews.forEach(interview => {
      const score = interview.score || interview.totalScore || interview.finalScore || 0
      const role = interview.role || ''
      const company = interview.company || ''
      const topics = interview.topics || []
      
      // Categorize by role type
      const roleCategory = categorizeRole(role)
      if (roleCategory) {
        categoryMap.set(roleCategory, (categoryMap.get(roleCategory) || 0) + 1)
      }

      // Extract technical skills from role
      const technicalSkills = extractTechnicalSkills(role, topics)
      technicalSkills.forEach(skill => {
        const current = skillMap.get(skill) || { count: 0, totalScore: 0, avgScore: 0 }
        current.count += 1
        current.totalScore += score
        current.avgScore = Math.round(current.totalScore / current.count)
        skillMap.set(skill, current)
      })

      performanceData.push({
        score,
        role,
        company,
        date: new Date(interview.createdAt || Date.now()),
        category: roleCategory
      })
    })

    // Convert to arrays and sort
    const skills = Array.from(skillMap.entries())
      .map(([skill, data]) => ({ skill, ...data }))
      .sort((a, b) => b.avgScore - a.avgScore)

    const categories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    // Calculate insights
    const insights = calculatePerformanceInsights(performanceData, avgScore)
    
    // Generate achievement badges
    const badges = generateAchievementBadges(interviews, avgScore, skills)

    setUserSkills(skills)
    setSkillCategories(categories)
    setPerformanceInsights(insights)
    setAchievementBadges(badges)
    setWeakAreas(insights.weakAreas || [])
    setStrengths(insights.strengths || [])
  }

  const categorizeRole = (role) => {
    const roleLower = role.toLowerCase()
    if (roleLower.includes('developer') || roleLower.includes('engineer') || roleLower.includes('programmer')) {
      return 'Technical'
    } else if (roleLower.includes('manager') || roleLower.includes('lead') || roleLower.includes('director')) {
      return 'Management'
    } else if (roleLower.includes('designer') || roleLower.includes('ui') || roleLower.includes('ux')) {
      return 'Design'
    } else if (roleLower.includes('analyst') || roleLower.includes('data') || roleLower.includes('scientist')) {
      return 'Analytics'
    } else if (roleLower.includes('sales') || roleLower.includes('marketing') || roleLower.includes('business')) {
      return 'Business'
    }
    return 'Other'
  }

  const extractTechnicalSkills = (role, topics) => {
    const skills = []
    const roleLower = role.toLowerCase()
    const topicsLower = (topics || []).map(t => t.toLowerCase())

    // Programming languages
    const languages = ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'typescript']
    languages.forEach(lang => {
      if (roleLower.includes(lang) || topicsLower.some(t => t.includes(lang))) {
        skills.push(lang.charAt(0).toUpperCase() + lang.slice(1))
      }
    })

    // Frameworks and technologies
    const frameworks = ['react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net']
    frameworks.forEach(fw => {
      if (roleLower.includes(fw) || topicsLower.some(t => t.includes(fw))) {
        skills.push(fw.charAt(0).toUpperCase() + fw.slice(1))
      }
    })

    // Databases
    const databases = ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite']
    databases.forEach(db => {
      if (roleLower.includes(db) || topicsLower.some(t => t.includes(db))) {
        skills.push(db.charAt(0).toUpperCase() + db.slice(1))
      }
    })

    // Cloud and DevOps
    const cloud = ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform']
    cloud.forEach(tech => {
      if (roleLower.includes(tech) || topicsLower.some(t => t.includes(tech))) {
        skills.push(tech.toUpperCase())
      }
    })

    return [...new Set(skills)] // Remove duplicates
  }

  const calculatePerformanceInsights = (performanceData, avgScore) => {
    if (performanceData.length === 0) return { weakAreas: [], strengths: [] }

    // Group by category
    const categoryPerformance = {}
    performanceData.forEach(data => {
      const category = data.category || 'Other'
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = []
      }
      categoryPerformance[category].push(data.score)
    })

    // Calculate averages and identify patterns
    const categoryAverages = Object.entries(categoryPerformance).map(([category, scores]) => ({
      category,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length
    }))

    const weakAreas = categoryAverages
      .filter(cat => cat.average < avgScore * 0.8)
      .sort((a, b) => a.average - b.average)
      .slice(0, 3)

    const strengths = categoryAverages
      .filter(cat => cat.average > avgScore * 1.1)
      .sort((a, b) => b.average - a.average)
      .slice(0, 3)

    return { weakAreas, strengths }
  }

  const generateAchievementBadges = (interviews, avgScore, skills) => {
    const badges = []

    // Interview count badges
    if (interviews.length >= 1) badges.push({ name: 'First Interview', icon: '🎯', description: 'Completed your first interview' })
    if (interviews.length >= 5) badges.push({ name: 'Getting Started', icon: '🚀', description: 'Completed 5 interviews' })
    if (interviews.length >= 10) badges.push({ name: 'Interview Veteran', icon: '⭐', description: 'Completed 10 interviews' })
    if (interviews.length >= 25) badges.push({ name: 'Interview Master', icon: '🏆', description: 'Completed 25 interviews' })

    // Score badges
    if (avgScore >= 80) badges.push({ name: 'High Performer', icon: '💎', description: 'Average score above 80%' })
    if (avgScore >= 90) badges.push({ name: 'Interview Expert', icon: '👑', description: 'Average score above 90%' })

    // Skill badges
    if (skills.length >= 5) badges.push({ name: 'Multi-Skilled', icon: '🔧', description: 'Demonstrated 5+ technical skills' })
    if (skills.length >= 10) badges.push({ name: 'Tech Savvy', icon: '💻', description: 'Demonstrated 10+ technical skills' })

    // Consistency badges
    const recentScores = interviews.slice(0, 5).map(iv => iv.score || 0)
    if (recentScores.length >= 3) {
      const variance = Math.max(...recentScores) - Math.min(...recentScores)
      if (variance <= 10) badges.push({ name: 'Consistent Performer', icon: '📈', description: 'Consistent performance across interviews' })
    }

    return badges
  }

  const startEditName = () => {
    setNameInput(user?.displayName || user?.email?.split('@')[0] || '')
    setEditingName(true)
    setNameError('')
  }

  const cancelEditName = () => {
    setEditingName(false)
    setNameInput('')
    setNameError('')
  }

  const saveName = async () => {
    const trimmed = (nameInput || '').trim()
    if (!trimmed) { setNameError('Name cannot be empty'); return }
    if (trimmed.length < 2) { setNameError('Name must be at least 2 characters'); return }
    if (trimmed.length > 40) { setNameError('Name must be under 40 characters'); return }

    // Normalize to Title Case
    const titleCased = trimmed
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    try {
      setSavingName(true)
      await updateProfile(auth.currentUser, { displayName: titleCased })
      // Reflect immediately in UI by updating input and closing editor
      setEditingName(false)
    } catch (e) {
      console.log('Failed to update display name', e)
      alert('Failed to update name. Please try again.')
    } finally {
      setSavingName(false)
    }
  }

  const onSelectAvatar = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadError('')
    try{
      setUploadingAvatar(true)
      setUploadProgress(0)

      const form = new FormData()
      form.append('avatar', file)
      const resp = await axios.patch(`/user/photo/${user.uid}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => {
          if (p.total) setUploadProgress(Math.round((p.loaded / p.total) * 100))
        }
      })

      const url = resp?.data?.photoURL || resp?.data?.secure_url || resp?.data?.photoUrl || resp?.data?.photo || resp?.data?.url || resp?.data?.photo_url || resp?.data?.photoUrl || resp?.data?.photoURL
      if (url) {
        await updateProfile(auth.currentUser, { photoURL: url })
        setUserData(prev => ({ ...prev, photoURL: url }))
      }
    }catch(e){
      console.log('Avatar upload failed', e)
      setUploadError(e?.message || 'Failed to update profile picture. Please try again.')
    } finally {
      setUploadingAvatar(false)
      // Clear input value so selecting the same file again triggers change
      event.target.value = ''
    }
  }

  return (
    <>
      <ProfessionalNavbar />
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="user-profile">
              <div className={`profile-avatar ${uploadingAvatar ? 'loading' : ''}`}>
                {!imageError ? (
                  <img 
                    src={userData?.photoURL || auth.currentUser?.photoURL || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email?.split('@')[0] || 'User')}&size=120&background=6366f1&color=ffffff&bold=true`} 
                    alt={user?.displayName || 'User'} 
                    onError={(e) => {
                      console.log('Image failed to load, using fallback');
                      setImageError(true);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully');
                      setImageError(false);
                    }}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                      backgroundColor: '#f3f4f6'
                    }}
                  />
                ) : (
                  <div className="fallback-avatar">
                    {(user?.displayName || user?.email?.split('@')[0] || 'U').charAt(0)}
                  </div>
                )}
                <div className="status-indicator" title="Online">
                  <div className="status-dot"></div>
                </div>
                <label className="avatar-edit-btn" title="Change photo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {uploadingAvatar ? `${uploadProgress}%` : 'Edit'}
                  <input type="file" accept="image/*" onChange={onSelectAvatar} hidden />
                </label>
              </div>
              {uploadError && <div className="avatar-error">{uploadError}</div>}
              <div className="profile-info">
                {editingName ? (
                  <div className="name-edit-row">
                    <input 
                      type="text" 
                      value={nameInput}
                      onChange={(e)=> { setNameInput(e.target.value); setNameError('') }}
                      placeholder="Enter your full name"
                      className="name-edit-input"
                      maxLength={40}
                    />
                    <div className="name-edit-actions">
                      <button className="btn-icon success" title="Save" onClick={saveName} disabled={savingName}>
                        <Check />
                      </button>
                      <button className="btn-icon" title="Cancel" onClick={cancelEditName} disabled={savingName}>
                        <Close />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="name-display-row">
                    <h1>Welcome back, {auth.currentUser?.displayName || user?.displayName || user?.email?.split('@')[0]}!</h1>
                    <button className="btn-ghost" onClick={startEditName}>
                      <Edit /> Edit Name
                    </button>
                  </div>
                )}
                {nameError && <div className="name-error">{nameError}</div>}
                <p>Ready to ace your next interview?</p>
                <div className="profile-meta">
                  <span><Email /> {user?.email}</span>
                  <span><CalendarToday /> Member since {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={() => navigate('/home')}>
                <PlayArrow /> Start New Interview
              </button>
              <button className="btn-secondary" onClick={() => navigate('/evaluation')}>
                <History /> View History
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card primary">
            <div className="stat-icon">
              <Assessment />
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : averageScore}%</h3>
              <p>Average Score</p>
              <div className="stat-trend">
                <TrendingUp />
                <span>{formatTrendText(monthlyScoreChange, '% this month')}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Schedule />
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : interviewCount}</h3>
              <p>Interviews Completed</p>
              <div className="stat-trend">
                <TrendingUp />
                <span>{formatTrendText(weeklyInterviewChange, ' this week')}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle />
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : totalQuestions}</h3>
              <p>Questions Answered</p>
              <div className="stat-trend">
                <TrendingUp />
                <span>{formatTrendText(dailyQuestionChange, ' today')}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Star />
            </div>
            <div className="stat-content">
              <h3>{loading ? '...' : getScoreLabel(averageScore)}</h3>
              <p>Performance Level</p>
              <div className="performance-badge" style={{backgroundColor: getScoreColor(averageScore)}}>
                {getScoreLabel(averageScore)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Progress Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2><Timeline /> Your Progress</h2>
            </div>
            <div className="progress-container">
              {interviewCount === 0 ? (
                <div className="no-data-message">
                  <p>Complete your first interview to see your progress here!</p>
                  <button className="btn-primary" onClick={() => navigate('/home')}>
                    <PlayArrow />
                    Start Your First Interview
                  </button>
                </div>
              ) : (
                <>
              <div className="progress-item">
                <div className="progress-header">
                  <span>Overall Performance</span>
                  <span>{averageScore}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${averageScore}%`,
                      backgroundColor: getScoreColor(averageScore)
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="progress-item">
                <div className="progress-header">
                  <span>Technical Skills</span>
                  <span>{loading ? '...' : technicalSkillsScore}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${loading ? 0 : technicalSkillsScore}%`, 
                      backgroundColor: getScoreColor(technicalSkillsScore)
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="progress-item">
                <div className="progress-header">
                  <span>Communication</span>
                  <span>{loading ? '...' : communicationScore}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${loading ? 0 : communicationScore}%`, 
                      backgroundColor: getScoreColor(communicationScore)
                    }}
                  ></div>
                </div>
              </div>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2><History /> Recent Activity</h2>
              <div className="pagination-controls">
                <span style={{color: '#6b7280', fontWeight: 600}}>
                  Page {page} of {Math.max(1, Math.ceil((recentInterviews.length || 0) / pageSize))}
                </span>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button
                    className="btn-secondary"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => setPage(p => Math.min(Math.ceil((recentInterviews.length || 0)/pageSize), p + 1))}
                    disabled={page >= Math.ceil((recentInterviews.length || 0)/pageSize)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            <div className="activity-list">
              {loading ? (
                <div className="loading-placeholder">Loading recent activity...</div>
              ) : recentInterviews.length > 0 ? (
                recentInterviews
                  .filter(iv => !showOnlyPassing || (iv.score || 0) >= 60)
                  .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
                  .map((interview, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <Assessment />
                    </div>
                    <div className="activity-content">
                      <h4>{interview.company} - {interview.role}</h4>
                      <p>Score: {interview.score || 0}% • {interview.questionsAnswered || 0} questions</p>
                      <span className="activity-time">
                        {new Date(interview.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="activity-score" style={{color: getScoreColor(interview.score || 0)}}>
                      {interview.score || 0}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Assessment />
                  <h3>No interviews yet</h3>
                  <p>Start your first interview to see your activity here</p>
                  <button className="btn-primary" onClick={() => navigate('/home')}>
                    Start Interview
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Skills & Achievements Combined */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2><Star /> Skills & Achievements</h2>
            </div>
            <div className="skills-achievements-container">
              {userSkills.length > 0 ? (
                <div className="skills-grid">
                  {userSkills.slice(0, 6).map((skill, index) => (
                    <div key={index} className="skill-item">
                      <div className="skill-name">{skill.skill}</div>
                      <div className="skill-score">{skill.avgScore}%</div>
                      <div className="skill-count">{skill.count} interview{skill.count !== 1 ? 's' : ''}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-skills-message">
                  <p>Complete interviews to discover your technical skills!</p>
                </div>
              )}
              
              {achievementBadges.length > 0 && (
                <div className="achievements-section">
                  <h3>Achievements</h3>
                  <div className="badges-grid">
                    {achievementBadges.slice(0, 3).map((badge, index) => (
                      <div key={index} className="badge-item">
                        <div className="badge-icon">{badge.icon}</div>
                        <div className="badge-info">
                          <div className="badge-name">{badge.name}</div>
                          <div className="badge-description">{badge.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2><TrendingUp /> Performance Insights</h2>
            </div>
            <div className="insights-container">
              <div className="insights-grid">
                <div className="insight-card strengths">
                  <h3>Your Strengths</h3>
                  {strengths.length > 0 ? (
                    <ul>
                      {strengths.map((strength, index) => (
                        <li key={index}>
                          <span className="category">{strength.category}</span>
                          <span className="score">{strength.average}% avg</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Complete more interviews to identify your strengths</p>
                  )}
                </div>
                <div className="insight-card improvements">
                  <h3>Areas for Improvement</h3>
                  {weakAreas.length > 0 ? (
                    <ul>
                      {weakAreas.map((area, index) => (
                        <li key={index}>
                          <span className="category">{area.category}</span>
                          <span className="score">{area.average}% avg</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Great job! No specific areas need improvement</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Profile
