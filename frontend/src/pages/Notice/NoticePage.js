import React, { useEffect, useState } from 'react';
import ProfessionalNavbar from '../../components/Navbar/ProfessionalNavbar';
import './NoticePage.css';

export default function NoticePage(){
	const [ads, setAds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterType, setFilterType] = useState('all');

	useEffect(() => {
		setLoading(true);
		fetch('/ads').then(r => r.json()).then((data) => {
			setAds(Array.isArray(data) ? data : []);
			setLoading(false);
		}).catch(() => {
			setLoading(false);
		});
	}, []);


	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const getTimeAgo = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
		
		if (diffInHours < 1) return 'Just now';
		if (diffInHours < 24) return `${diffInHours}h ago`;
		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) return `${diffInDays}d ago`;
		return formatDate(dateString);
	};

	const filteredAds = ads.filter(ad => {
		const matchesSearch = ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 ad.description?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesFilter = filterType === 'all' || 
							  (filterType === 'recent' && new Date(ad.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
							  (filterType === 'applications' && ad.link);
		return matchesSearch && matchesFilter;
	});

	const recentAds = ads.filter(ad => new Date(ad.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

	return (
		<>
			<ProfessionalNavbar />
			<div className="notice-page">
				{/* Hero Section */}
				<div className="notice-hero">
					<div className="hero-content">
						<div className="hero-badge">
							<span className="badge-icon">📢</span>
							<span>Career Opportunities</span>
						</div>
						<h1 className="hero-title">Stay Updated</h1>
						<p className="hero-subtitle">
							Discover the latest placement opportunities, interview announcements, and career insights shared by our mentors
						</p>
						<div className="hero-stats">
							<div className="stat-item">
								<span className="stat-number">{ads.length}</span>
								<span className="stat-label">Total Opportunities</span>
							</div>
							<div className="stat-item">
								<span className="stat-number">{recentAds.length}</span>
								<span className="stat-label">This Week</span>
							</div>
							<div className="stat-item">
								<span className="stat-number">{ads.filter(ad => ad.link).length}</span>
								<span className="stat-label">With Applications</span>
							</div>
						</div>
					</div>
					<div className="hero-visual">
						<div className="floating-card">
							<div className="card-icon">💼</div>
							<div className="card-text">Job Openings</div>
						</div>
						<div className="floating-card delay-1">
							<div className="card-icon">🎯</div>
							<div className="card-text">Interviews</div>
						</div>
						<div className="floating-card delay-2">
							<div className="card-icon">🚀</div>
							<div className="card-text">Career Growth</div>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="notice-content">
					{loading ? (
						<div className="loading-container">
							<div className="loading-spinner"></div>
							<p>Loading opportunities...</p>
						</div>
					) : ads.length === 0 ? (
						<div className="empty-state">
							<div className="empty-icon">📭</div>
							<h3>No Opportunities Yet</h3>
							<p>Check back later for new placement opportunities and interview announcements.</p>
						</div>
					) : (
						<>
							{/* Search and Filter Section */}
							<div className="search-filter-section">
								<div className="search-container">
									<div className="search-input-wrapper">
										<span className="search-icon">🔍</span>
										<input 
											type="text" 
											placeholder="Search opportunities..." 
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="search-input"
										/>
									</div>
								</div>
								<div className="filter-tabs">
									<button 
										className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
										onClick={() => setFilterType('all')}
									>
										All ({ads.length})
									</button>
									<button 
										className={`filter-tab ${filterType === 'recent' ? 'active' : ''}`}
										onClick={() => setFilterType('recent')}
									>
										Recent ({recentAds.length})
									</button>
									<button 
										className={`filter-tab ${filterType === 'applications' ? 'active' : ''}`}
										onClick={() => setFilterType('applications')}
									>
										With Applications ({ads.filter(ad => ad.link).length})
									</button>
								</div>
							</div>


							{/* All Opportunities Grid */}
										{filteredAds.length > 0 && (
											<div className="opportunities-section">
												<div className="section-header">
													<h2>All Opportunities</h2>
													<span className="results-count">{filteredAds.length} opportunity{filteredAds.length !== 1 ? 'ies' : ''} found</span>
												</div>
												
												<div className="opportunities-grid">
													{filteredAds.map((ad) => (
														<div key={ad._id} className="opportunity-card">
															{ad.imageUrl && (
																<div className="card-media">
																	<img src={ad.imageUrl} alt={ad.title} />
																	<div className="card-overlay">
																		<div className="overlay-badge">Opportunity</div>
																	</div>
																</div>
															)}
															<div className="card-content">
																<div className="card-header">
																	<h4 className="card-title">{ad.title}</h4>
																	<div className="card-meta">
																		<span className="meta-time">{getTimeAgo(ad.createdAt)}</span>
																	</div>
																</div>
																<p className="card-description">{ad.description}</p>
													<div className="card-footer">
														{ad.link && (
															<a className="card-link" href={ad.link} target="_blank" rel="noreferrer">
																<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
																	<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
																	<polyline points="15,3 21,3 21,9"></polyline>
																	<line x1="10" y1="14" x2="21" y2="3"></line>
																</svg>
																Apply
															</a>
														)}
													</div>
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{/* No Results */}
										{filteredAds.length === 0 && ads.length > 0 && (
											<div className="empty-state">
												<div className="empty-icon">🔍</div>
												<h3>No Results Found</h3>
												<p>Try adjusting your search terms or filters to find more opportunities.</p>
											</div>
										)}
						</>
					)}
				</div>
			</div>
		</>
	)
}


