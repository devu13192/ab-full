import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ProfessionalNavbar from '../../components/Navbar/ProfessionalNavbar'
import axios from "axios"
import "./Home.css"
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'
import Footer from '../../components/Footer/Footer'
import { 
    Assessment, 
    Schedule, 
    Star,
    PlayArrow,
    School,
    Work,
    Business,
    Search,
    Refresh
} from '@mui/icons-material'
const Home = () => {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [interviewList,setInterviewList] = useState([])
  const [loading,setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fav-interviews')||'[]') } catch { return [] }
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [sortBy, setSortBy] = useState('difficulty')
  const [sortDir, setSortDir] = useState('asc')
  const [ads, setAds] = useState([])

  // Only keeping interviews listing on the Home page

  useEffect(() => {
    document.title = 'Dashboard'
    axios.get('/interview')
      .then(response => {
        setInterviewList(response.data)
        setInterviews(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.log(error);
      });
    // fetch active ads
    axios.get('/ads')
      .then(res => setAds(res.data || []))
      .catch(()=>{})
  }, [])

  const companies = useMemo(() => {
    const seen = new Map()
    for (const item of (interviewList || [])) {
      const key = (item?.company ?? '').toString().toLowerCase().trim()
      if (key && !seen.has(key)) seen.set(key, item.company)
    }
    return Array.from(seen.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  }, [interviewList])
  const roles = useMemo(() => {
    const seen = new Map()
    for (const item of (interviewList || [])) {
      const key = (item?.role ?? '').toString().toLowerCase().trim()
      if (key && !seen.has(key)) seen.set(key, item.role)
    }
    return Array.from(seen.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  }, [interviewList])
  const topics = useMemo(() => {
    return Array.from(new Set((interviewList || []).map(i => i.type).filter(Boolean))).sort()
  }, [interviewList])

  // Derive companies and roles for counts in the header
  useEffect(() => {
    const normalized = (s) => (s ?? '').toString().toLowerCase().trim()
    const term = normalized(searchTerm)

    const filtered = (interviewList || []).filter((it) => {
      const company = normalized(it.company)
      const role = normalized(it.role)
      const topic = normalized(it.type)

      const matchesSearch =
        !term || company.includes(term) || role.includes(term) || topic.includes(term)

      const matchesCompany = !selectedCompany || company === normalized(selectedCompany)
      const matchesRole = !selectedRole || role === normalized(selectedRole)
      const matchesTopic = !selectedTopic || it.type === selectedTopic

      return matchesSearch && matchesCompany && matchesRole && matchesTopic
    })
    const sorted = [...filtered].sort((a,b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      
      // Special handling for difficulty sorting
      if (sortBy === 'difficulty') {
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 }
        const aDifficulty = difficultyOrder[a?.difficulty] || 0
        const bDifficulty = difficultyOrder[b?.difficulty] || 0
        return (aDifficulty - bDifficulty) * dir
      }
      
      const av = (a?.[sortBy] || '').toString().toLowerCase()
      const bv = (b?.[sortBy] || '').toString().toLowerCase()
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
    setPage(1)
    setInterviews(sorted)
  }, [searchTerm, selectedCompany, selectedRole, selectedTopic, interviewList, sortBy, sortDir])

  useEffect(() => {
    try { localStorage.setItem('fav-interviews', JSON.stringify(favorites)) } catch {}
  }, [favorites])

  const toggleFavorite = (id) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const favoriteInterviews = useMemo(() => {
    const set = new Set(favorites)
    return (interviewList || []).filter(i => set.has(i._id))
  }, [interviewList, favorites])

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCompany('')
    setSelectedRole('')
    setSelectedTopic('')
    setSortBy('difficulty')
    setSortDir('asc')
    setInterviews(interviewList)
  }
  
  return (
    <>
      <ProfessionalNavbar />
      <div className='dashboard-container' id="home">

          {/* Opportunities moved to Notice page */}

          {/* Chat moved to Chat page */}

          {/* Available Interviews */}
          <div className="interviews-section">
            <div className="interviews-header">
              <div className="header-content">
                <div className="header-text">
                  <h2><School /> Available Interviews</h2>
                  <p>Choose from our curated collection of interview questions</p>
                </div>
                <div className="header-stats">
                  <div className="stat-item">
                    <span className="stat-number">{interviews.length}</span>
                    <span className="stat-label">Available</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{companies.length}</span>
                    <span className="stat-label">Companies</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{roles.length}</span>
                    <span className="stat-label">Roles</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="interviews-content">
              {favoriteInterviews.length > 0 && (
                <div className="favorites-section">
                  <div className="interviews-header" style={{marginBottom: '0.5rem'}}>
                    <div className="header-content">
                      <div className="header-text">
                        <h2><Star /> Your Favorites</h2>
                        <p>Quick access to interviews you starred</p>
                      </div>
                      <div className="header-stats">
                        <div className="stat-item">
                          <span className="stat-number">{favoriteInterviews.length}</span>
                          <span className="stat-label">Saved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="interviews-grid">
                    {favoriteInterviews.map((element) => (
                      <div key={element._id} className="professional-interview-card">
                        <div className="card-header">
                          <div className="company-info">
                            <div className="company-logo">
                              <Business />
                            </div>
                            <div className="company-details">
                              <h3>{element.company}</h3>
                              <p>{element.role}</p>
                            </div>
                          </div>
                          <div className={`difficulty-badge ${element.difficulty?.toLowerCase() || 'unknown'}`}>
                            <span>{element.difficulty || 'Medium'}</span>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="interview-stats">
                            <div className="stat">
                              <Assessment />
                              <span>{element.questions?.length || 0} Questions</span>
                            </div>
                            <div className="stat">
                              <Schedule />
                              <span>15-20 min</span>
                            </div>
                            <div className="stat">
                              <Star />
                              <span>Saved</span>
                            </div>
                          </div>
                          <div className="interview-description">
                            <p>Practice with real interview questions from {element.company} for the {element.role} position.</p>
                          </div>
                        </div>
                        <div className="card-footer">
                          <button className="btn-start-interview" onClick={() => navigate(`/interview/${element._id}`)}>
                            <PlayArrow />
                            Start Interview
                          </button>
                          <button 
                            className={`btn-secondary ${favorites.includes(element._id) ? 'active' : ''}`}
                            onClick={() => toggleFavorite(element._id)}
                            title={favorites.includes(element._id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {favorites.includes(element._id) ? '★ Favorited' : '☆ Favorite'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="filters-bar">
                <div className="filters-left">
                  <div className="input-with-icon">
                    <Search />
                    <input
                      type="text"
                      placeholder="Search by company or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="filters-right">
                  <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                    <option value="">All Companies</option>
                    {companies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                    <option value="">All Roles</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
                    <option value="">All Topics</option>
                    {topics.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="difficulty">Sort: Difficulty</option>
                    <option value="company">Sort: Company</option>
                    <option value="role">Sort: Role</option>
                    <option value="type">Sort: Topic</option>
                  </select>
                  <select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>
                  <button className="btn-secondary" onClick={resetFilters}>
                    <Refresh />
                    Reset
                  </button>
                </div>
              </div>
              {loading ? (
                <div className="loading-container">
                  <LoadingComponent />
                  <p>Loading available interviews...</p>
                </div>
              ) : interviews.length !== 0 ? (
                <div className="interviews-grid">
                  {interviews
                    .slice((page-1)*pageSize, (page-1)*pageSize + pageSize)
                    .map((element) => (
                    <div key={element._id} className="professional-interview-card">
                      <div className="card-header">
                        <div className="company-info">
                          <div className="company-logo">
                            <Business />
                          </div>
                          <div className="company-details">
                            <h3>{element.company}</h3>
                            <p>{element.role}</p>
                          </div>
                        </div>
                        <div className={`difficulty-badge ${element.difficulty?.toLowerCase() || 'unknown'}`}>
                          <span>{element.difficulty || 'Medium'}</span>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="interview-stats">
                          <div className="stat">
                            <Assessment />
                            <span>{element.questions?.length || 0} Questions</span>
                          </div>
                          <div className="stat">
                            <Schedule />
                            <span>15-20 min</span>
                          </div>
                          <div className="stat">
                            <Star />
                            <span>4.8 Rating</span>
                          </div>
                        </div>
                        
                        <div className="interview-description">
                          <p>Practice with real interview questions from {element.company} for the {element.role} position.</p>
                        </div>
                      </div>
                      
                      <div className="card-footer">
                        <button className="btn-start-interview" onClick={() => navigate(`/interview/${element._id}`)}>
                          <PlayArrow />
                          Start Interview
                        </button>
                        <button 
                          className={`btn-secondary ${favorites.includes(element._id) ? 'active' : ''}`}
                          onClick={() => toggleFavorite(element._id)}
                          title={favorites.includes(element._id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {favorites.includes(element._id) ? '★ Favorited' : '☆ Favorite'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Work />
                  </div>
                  <h3>No interviews found</h3>
                  <p>Try adjusting your search criteria or browse all available interviews</p>
                  <button className="btn-primary" onClick={() => {
                    setInterviews(interviewList);
                  }}>
                    <Refresh />
                    Reset Filters
                  </button>
                </div>
              )}
              {interviews.length > pageSize && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    <span className="pagination-text">
                      Showing <strong>{(page-1)*pageSize + 1}</strong> to <strong>{Math.min(page*pageSize, interviews.length)}</strong> of <strong>{interviews.length}</strong> interviews
                    </span>
                  </div>
                  
                  <div className="pagination-controls">
                    <div className="page-size-selector">
                      <label className="page-size-label">Interviews per page</label>
                      <select 
                        className="page-size-select" 
                        value={pageSize} 
                        onChange={(e) => { setPageSize(parseInt(e.target.value)||8); setPage(1) }}
                      >
                        <option value={6}>6</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                        <option value={16}>16</option>
                      <option value={20}>20</option>
                    </select>
                    </div>
                    
                    <div className="page-navigation">
                      <button 
                        className={`pagination-btn prev-btn ${page <= 1 ? 'disabled' : ''}`}
                        onClick={() => setPage(p => Math.max(1, p-1))} 
                        disabled={page <= 1}
                        title="Previous page"
                      >
                        <span className="btn-icon">‹</span>
                        Previous
                      </button>
                      
                      <div className="page-numbers">
                        {(() => {
                          const totalPages = Math.ceil(interviews.length / pageSize);
                          const pages = [];
                          const maxVisiblePages = 5;
                          
                          if (totalPages <= maxVisiblePages) {
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(
                                <button
                                  key={i}
                                  className={`page-number ${page === i ? 'active' : ''}`}
                                  onClick={() => setPage(i)}
                                >
                                  {i}
                                </button>
                              );
                            }
                          } else {
                            // Show first page
                            pages.push(
                              <button
                                key={1}
                                className={`page-number ${page === 1 ? 'active' : ''}`}
                                onClick={() => setPage(1)}
                              >
                                1
                              </button>
                            );
                            
                            // Show ellipsis if needed
                            if (page > 3) {
                              pages.push(<span key="ellipsis1" className="page-ellipsis">...</span>);
                            }
                            
                            // Show pages around current page
                            const start = Math.max(2, page - 1);
                            const end = Math.min(totalPages - 1, page + 1);
                            
                            for (let i = start; i <= end; i++) {
                              if (i !== 1 && i !== totalPages) {
                                pages.push(
                                  <button
                                    key={i}
                                    className={`page-number ${page === i ? 'active' : ''}`}
                                    onClick={() => setPage(i)}
                                  >
                                    {i}
                                  </button>
                                );
                              }
                            }
                            
                            // Show ellipsis if needed
                            if (page < totalPages - 2) {
                              pages.push(<span key="ellipsis2" className="page-ellipsis">...</span>);
                            }
                            
                            // Show last page
                            if (totalPages > 1) {
                              pages.push(
                                <button
                                  key={totalPages}
                                  className={`page-number ${page === totalPages ? 'active' : ''}`}
                                  onClick={() => setPage(totalPages)}
                                >
                                  {totalPages}
                                </button>
                              );
                            }
                          }
                          
                          return pages;
                        })()}
                      </div>
                      
                      <button 
                        className={`pagination-btn next-btn ${page >= Math.ceil(interviews.length / pageSize) ? 'disabled' : ''}`}
                        onClick={() => setPage(p => Math.min(Math.ceil(interviews.length / pageSize), p+1))} 
                        disabled={page >= Math.ceil(interviews.length / pageSize)}
                        title="Next page"
                      >
                        Next
                        <span className="btn-icon">›</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>
      <Footer />
    </>
  )
}

export default Home
