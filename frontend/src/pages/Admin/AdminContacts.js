import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AdminContacts.css';
import { 
  Email, 
  Phone, 
  Message, 
  CheckCircle, 
  Circle, 
  Refresh,
  FilterList,
  Search,
  Visibility,
  Reply,
  Delete,
  Download,
  MoreVert
} from '@mui/icons-material';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState(null); // {type:'success'|'error', message}

  // filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all | new | in_progress | contacted
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // sorting
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' }); // name | email | status | date

  // selection and UI helpers
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [confirm, setConfirm] = useState(null); // {type:'resolve'|'delete', ids:[]}
  const [viewing, setViewing] = useState(null); // contact object
  const [replyTo, setReplyTo] = useState(null); // contact object
  const [replySubject, setReplySubject] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  // pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchContacts();
  }, []);

  // Listen for openContact events from header notifications
  useEffect(() => {
    const onOpen = (e) => {
      const id = e?.detail?.id;
      if (!id) return;
      const target = contacts.find(c => c._id === id);
      if (target) {
        setViewing(target);
      }
    };
    window.addEventListener('openContact', onOpen);
    return () => window.removeEventListener('openContact', onOpen);
  }, [contacts]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/contacts');
      if (response.data.success) {
        setContacts(response.data.data || []);
        // store count for potential notification badge usage
        const newCount = (response.data.data || []).filter(x => x.status === 'new').length;
        try { localStorage.setItem('contactsNewCount', String(newCount)); } catch {}
      } else {
        setError('Failed to fetch contacts');
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to fetch contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId, newStatus) => {
    try {
      setUpdating(contactId);
      const response = await axios.patch(`http://localhost:5000/api/contacts/${contactId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        setContacts(prev => prev.map(c => c._id === contactId ? { ...c, status: newStatus } : c));
        setBanner({ type: 'success', message: `Message marked as ${newStatus}.` });
        setTimeout(() => setBanner(null), 2000);
      } else {
        setBanner({ type: 'error', message: 'Failed to update status.' });
      }
    } catch (err) {
      console.error('Error updating contact status:', err);
      setBanner({ type: 'error', message: 'Failed to update status. Please try again.' });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status) => {
    // Map existing backend statuses to design tokens
    const map = {
      new: { cls: 'new', text: 'New' },
      in_progress: { cls: 'progress', text: 'In Progress' },
      contacted: { cls: 'contacted', text: 'Contacted' }
    };
    const t = map[status] || map.new;
    return (
      <span className={`c-status ${t.cls}`} aria-label={`Status ${t.text}`}>
        {t.text}
      </span>
    );
  };

  const deleteContact = async (contactId) => {
    try {
      setUpdating(contactId);
      const response = await axios.delete(`http://localhost:5000/api/contacts/${contactId}`);
      if (response.data.success) {
        setContacts(prev => prev.filter(c => c._id !== contactId));
        setBanner({ type: 'success', message: 'Contact deleted.' });
        setTimeout(() => setBanner(null), 2000);
      } else {
        setBanner({ type: 'error', message: 'Failed to delete contact.' });
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      setBanner({ type: 'error', message: 'Failed to delete contact. Please try again.' });
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const matchesDateRange = (d) => {
    if (!d) return true;
    const ts = new Date(d).getTime();
    if (dateFrom && ts < new Date(dateFrom).getTime()) return false;
    if (dateTo) {
      const till = new Date(dateTo);
      till.setHours(23,59,59,999);
      if (ts > till.getTime()) return false;
    }
    return true;
  };

  const filteredContacts = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    const base = contacts.filter(contact => {
      const matchesSearch =
        (contact.name || '').toLowerCase().includes(needle) ||
        (contact.email || '').toLowerCase().includes(needle) ||
        (contact.inquiryType || '').toLowerCase().includes(needle) ||
        (contact.subject || '').toLowerCase().includes(needle);
      const statusActive = (activeTab !== 'all') ? [activeTab] : ['new','in_progress','contacted'];
      const matchesStatus = statusActive.includes(contact.status);
      return matchesSearch && matchesStatus && matchesDateRange(contact.createdAt);
    });
    const sorted = [...base].sort((a,b) => {
      // unresolved first
      const rank = (s) => s === 'contacted' ? 1 : 0;
      const r = rank(a.status) - rank(b.status);
      if (r !== 0) return r;
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.key === 'name') return ((a.name||'').localeCompare(b.name||'')) * dir;
      if (sort.key === 'email') return ((a.email||'').localeCompare(b.email||'')) * dir;
      if (sort.key === 'status') return ((a.status||'').localeCompare(b.status||'')) * dir;
      // date
      return ((new Date(a.createdAt).getTime() || 0) - (new Date(b.createdAt).getTime() || 0)) * dir;
    });
    return sorted;
  }, [contacts, searchTerm, activeTab, dateFrom, dateTo, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / perPage));
  const pagedContacts = filteredContacts.slice((page - 1) * perPage, page * perPage);

  const newContactsCount = contacts.filter(c => c.status === 'new').length;
  const contactedCount = contacts.filter(c => c.status === 'contacted').length;

  const toggleSelect = (id, checked) => {
    setSelected(prev => { const s = new Set(prev); checked ? s.add(id) : s.delete(id); return s; });
  };

  const toggleAll = (rows, checked) => {
    setSelected(prev => { const s = new Set(prev); rows.forEach(r => checked ? s.add(r._id) : s.delete(r._id)); return s; });
  };

  const exportCSV = () => {
    const headers = ['Name','Email','Subject','Message','Status','Date'];
    const rows = filteredContacts.map(c => [c.name, c.email, c.inquiryType || c.subject || '', (c.message||'').replace(/\n/g,' ').slice(0,500), c.status, formatDate(c.createdAt)]);
    const csv = [headers.join(','), ...rows.map(r => r.map(x => `"${(x||'').toString().replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='contacts.csv'; a.click(); URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="admin-contacts">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-contacts">
      <div className="contacts-header">
        <div className="header-content">
          <h1>Contact Management</h1>
          <p>Manage and respond to customer inquiries</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchContacts} disabled={loading}>
            <Refresh /> Refresh
          </button>
          <button className="export-btn" onClick={exportCSV} aria-label="Export CSV">
            <Download /> Export CSV
          </button>
        </div>
      </div>

      <div className="contacts-tabs" role="tablist" aria-label="Contact status tabs">
        {[
          { id: 'all', label: 'All', count: contacts.length },
          { id: 'new', label: 'New', count: contacts.filter(c => c.status === 'new').length },
          { id: 'in_progress', label: 'In Progress', count: contacts.filter(c => c.status === 'in_progress').length },
          { id: 'contacted', label: 'Resolved', count: contacts.filter(c => c.status === 'contacted').length }
        ].map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(t.id); setPage(1); }}
          >
            <span>{t.label}</span>
            {t.count > 0 && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="contacts-stats">
        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-content">
            <div className="stat-number">{contacts.length}</div>
            <div className="stat-label">Total Contacts</div>
          </div>
        </div>
        <div className="stat-card new">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <div className="stat-number">{newContactsCount}</div>
            <div className="stat-label">New Messages</div>
          </div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{contacts.filter(c => c.status === 'in_progress').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card contacted">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{contactedCount}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      <div className="contacts-controls" role="region" aria-label="Contacts filters">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or subject"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search contacts"
          />
        </div>
        <div className="filter-container" aria-label="Date range">
          <input 
            type="date" 
            value={dateFrom} 
            onChange={(e)=> setDateFrom(e.target.value)} 
            className="filter-select" 
            placeholder="From date"
          />
          <span className="date-separator">to</span>
          <input 
            type="date" 
            value={dateTo} 
            onChange={(e)=> setDateTo(e.target.value)} 
            className="filter-select" 
            placeholder="To date"
          />
        </div>
        <div className="filter-actions">
          <button 
            className="clear-filters-btn" 
            onClick={() => {
              setSearchTerm('');
              setDateFrom('');
              setDateTo('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {banner && (
        <div className={`banner ${banner.type==='error'?'error':''}`}>{banner.message}</div>
      )}
      {error && (<div className="error-message">{error}</div>)}

      <div className="contacts-table-container">
        {filteredContacts.length === 0 ? (
          <div className="no-contacts">
            <Message className="no-contacts-icon" />
            <h3>No contacts found</h3>
            <p>No contacts match your current search criteria.</p>
          </div>
        ) : (
          <table className="contacts-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="Select all" onChange={(e)=> toggleAll(filteredContacts, e.target.checked)} /></th>
                <th className="sortable" role="button" tabIndex={0} onClick={()=> setSort(prev=>({ key:'name', dir: prev.key==='name' && prev.dir==='asc' ? 'desc':'asc'}))}>Name <span className="arrow">{sort.key==='name' ? (sort.dir==='asc'?'▲':'▼') : '↕'}</span></th>
                <th className="sortable" role="button" tabIndex={0} onClick={()=> setSort(prev=>({ key:'email', dir: prev.key==='email' && prev.dir==='asc' ? 'desc':'asc'}))}>Email <span className="arrow">{sort.key==='email' ? (sort.dir==='asc'?'▲':'▼') : '↕'}</span></th>
                <th>Subject</th>
                <th>Message Preview</th>
                <th className="sortable" role="button" tabIndex={0} onClick={()=> setSort(prev=>({ key:'status', dir: prev.key==='status' && prev.dir==='asc' ? 'desc':'asc'}))}>Status <span className="arrow">{sort.key==='status' ? (sort.dir==='asc'?'▲':'▼') : '↕'}</span></th>
                <th className="sortable" role="button" tabIndex={0} onClick={()=> setSort(prev=>({ key:'date', dir: prev.key==='date' && prev.dir==='asc' ? 'desc':'asc'}))}>Date <span className="arrow">{sort.key==='date' ? (sort.dir==='asc'?'▲':'▼') : '↕'}</span></th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedContacts.map((c) => (
                <tr key={c._id} className={`contact-row ${c.status==='new' ? 'row-unread' : ''}`} onClick={()=> setViewing(c)} title="Click to view">
                  <td><input type="checkbox" checked={selected.has(c._id)} onChange={(e)=> toggleSelect(c._id, e.target.checked)} aria-label={`Select ${c.email}`} /></td>
                  <td className="contact-name"><strong>{c.name}</strong></td>
                  <td className="contact-email"><a href={`mailto:${c.email}`}><Email className="email-icon" />{c.email}</a></td>
                  <td className="inquiry-type">{c.inquiryType || c.subject || 'General'}</td>
                  <td className="contact-message">
                    <div className="message-preview">
                      {expanded.has(c._id) ? (
                        <>
                          {(c.message||'').toString()}
                          <button className="link-btn" onClick={()=> setExpanded(prev=>{ const s=new Set(prev); s.delete(c._id); return s; })}>Read less</button>
                        </>
                      ) : (
                        <>
                          {(c.message||'').toString().length > 120 ? `${(c.message||'').toString().slice(0,120)}...` : (c.message||'')}
                          {(c.message||'').toString().length > 120 && (
                            <button className="link-btn" onClick={()=> setExpanded(prev=>{ const s=new Set(prev); s.add(c._id); return s; })}>Read more</button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="contact-status">
                    {getStatusBadge(c.status)}
                    <select aria-label="Update status" className="inline-status" value={c.status} onChange={(e)=> updateContactStatus(c._id, e.target.value)}>
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="contacted">Resolved</option>
                    </select>
                  </td>
                  <td className="contact-date">{formatDate(c.createdAt)}</td>
                  <td className="contact-actions" onClick={(e)=> e.stopPropagation()}>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" onClick={()=> setViewing(c)} aria-label="View" title="View Message">
                        <Visibility />
                      </button>
                      <button className="action-btn reply-btn" onClick={()=> { setReplyTo(c); setReplySubject(`Re: ${c.inquiryType || 'Your inquiry'}`); setReplyText(`Hi ${c.name},\n`); }} aria-label="Reply" title="Reply">
                        <Reply />
                      </button>
                      {c.status === 'new' ? (
                        <button className="action-btn resolve-btn" onClick={()=> updateContactStatus(c._id, 'contacted')} title="Mark resolved">
                          <CheckCircle />
                        </button>
                      ) : (
                        <button className="action-btn reopen-btn" onClick={()=> updateContactStatus(c._id, 'new')} title="Mark as new">
                          <Circle />
                        </button>
                      )}
                      <button className="action-btn delete-btn" onClick={()=> setConfirm({ type:'delete', ids:[c._id] })} aria-label="Delete" title="Delete">
                        <Delete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected.size > 0 && (
        <div className="selection-bar">
          <div className="selection-info">
            <span className="count">{selected.size} selected</span>
          </div>
          <div className="selection-actions">
            <button className="bulk-action-btn resolve-btn" onClick={()=> setConfirm({ type:'resolve', ids:[...selected] })}>
              <CheckCircle /> Mark Resolved
            </button>
            <button className="bulk-action-btn delete-btn" onClick={()=> setConfirm({ type:'delete', ids:[...selected] })}>
              <Delete /> Delete
            </button>
          </div>
        </div>
      )}

      <div className="table-info">Showing {(page-1)*perPage + (filteredContacts.length ? 1 : 0)}–{Math.min(page*perPage, filteredContacts.length)} of {filteredContacts.length} contacts</div>
      <div className="pagination">
        <button disabled={page===1} onClick={()=> setPage(p => Math.max(1, p-1))}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page===totalPages} onClick={()=> setPage(p => Math.min(totalPages, p+1))}>Next</button>
      </div>

      {confirm && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-card">
            <div style={{fontWeight:800, marginBottom:8}}>{confirm.type==='resolve' ? 'Mark messages as resolved?' : 'Delete messages?'}</div>
            <div style={{color:'var(--muted)'}}>You are about to update {confirm.ids.length} item(s).</div>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={()=> setConfirm(null)}>Cancel</button>
              <button className={confirm.type==='resolve' ? 'btn-activate' : 'btn-deactivate'} onClick={async ()=>{
                if (confirm.type === 'resolve') {
                  for (const id of confirm.ids) await updateContactStatus(id, 'contacted');
                } else {
                  try {
                    await axios.post('http://localhost:5000/api/contacts/bulk/delete', { ids: confirm.ids });
                    setContacts(prev => prev.filter(c => !confirm.ids.includes(c._id)));
                    setBanner({ type:'success', message: 'Selected contacts deleted.' });
                    setTimeout(()=> setBanner(null), 2000);
                  } catch (e) {
                    setBanner({ type:'error', message: 'Failed to delete selected contacts.' });
                  }
                }
                setSelected(new Set());
                setConfirm(null);
              }}>{confirm.type==='resolve' ? 'Resolve' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={()=> setViewing(null)}>
          <div className="modal-content" onClick={(e)=> e.stopPropagation()}>
            <div className="modal-header">
              <h2>Message Details</h2>
              <button className="modal-close" onClick={()=> setViewing(null)}>×</button>
            </div>
            <div className="message-details">
              <div className="message-header">
                <div className="sender-info">
                  <div className="sender-name">{viewing.name}</div>
                  <div className="sender-email"><Email className="email-icon" /> {viewing.email}</div>
                </div>
                <div className="message-meta">
                  <div className="message-date">{formatDate(viewing.createdAt)}</div>
                  <div className="message-status">{getStatusBadge(viewing.status)}</div>
                </div>
              </div>
              <div className="message-content">
                <div className="message-subject">
                  <strong>Subject:</strong> {viewing.inquiryType || viewing.subject || 'General Inquiry'}
                </div>
                <div className="message-text">{viewing.message}</div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={()=> setViewing(null)}>Close</button>
              <button className="btn-primary" onClick={()=> { setViewing(null); setReplyTo(viewing); setReplySubject(`Re: ${viewing.inquiryType || 'Your inquiry'}`); setReplyText(`Hi ${viewing.name},\n`); }}>
                <Reply /> Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {replyTo && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={()=> setReplyTo(null)}>
          <div className="modal-content" onClick={(e)=> e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reply to {replyTo.name}</h2>
              <button className="modal-close" onClick={()=> setReplyTo(null)}>×</button>
            </div>
            <div className="reply-form">
              <div className="form-group">
                <label>To:</label>
                <input type="email" value={replyTo.email} disabled className="form-input" />
              </div>
              <div className="form-group">
                <label>Subject:</label>
                <input 
                  value={replySubject} 
                  onChange={(e)=> setReplySubject(e.target.value)} 
                  placeholder="Subject" 
                  className="form-input" 
                />
              </div>
              <div className="form-group">
                <label>Message:</label>
                <textarea 
                  value={replyText} 
                  onChange={(e)=> setReplyText(e.target.value)} 
                  rows={8} 
                  className="form-textarea" 
                  placeholder="Write your reply..." 
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={()=> setReplyTo(null)}>Cancel</button>
              <button className="btn-primary" disabled={sending} onClick={async ()=>{
                try{
                  setSending(true);
                  await axios.post(`http://localhost:5000/api/contacts/${replyTo._id}/reply`, { subject: replySubject, message: replyText });
                  setContacts(prev => prev.map(c => c._id===replyTo._id ? { ...c, lastEmailAt: new Date().toISOString(), status: 'contacted' } : c));
                  setBanner({ type:'success', message:'Email sent successfully.' });
                }catch(err){
                  setBanner({ type:'error', message:'Failed to send email.' });
                } finally {
                  setSending(false); setReplyTo(null); setTimeout(()=> setBanner(null), 2200);
                }
              }}>
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;

