import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';
import AdminContacts from './AdminContacts';
import './Admin.css';
// Removed framer-motion and react-icons to avoid dependency issues
// Charts remain via recharts
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Admin = () => {
    const { logout, user } = UserAuth();
    const navigate = useNavigate();

    // Core data states
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    // Mentors
    const [mentors, setMentors] = useState([]);
    const [mentorsLoading, setMentorsLoading] = useState(false);

    // UI state
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard'); // dashboard | users | mentors | interviews | analytics | settings | contacts
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [newContacts, setNewContacts] = useState([]); // recent status==='new'
    const [bellAnimate, setBellAnimate] = useState(false);
    const [confirm, setConfirm] = useState(null); // { type:'activate'|'deactivate', ids:[] }
    const [banner, setBanner] = useState(null); // { type:'success'|'error', message }
    const [globalSearch, setGlobalSearch] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);

    // Legacy form states retained
    const [showAddForm, setShowAddForm] = useState(false);
    const [showMentorForm, setShowMentorForm] = useState(false);
    const overlayRef = useRef(null);
    const companyInputRef = useRef(null);
    const [editingInterview, setEditingInterview] = useState(null);
    const [formData, setFormData] = useState({
        company: '',
        role: '',
        questions: [],
        type: 'Algorithms & Systems',
        difficulty: 'Medium'
    });
    const [mentorFormData, setMentorFormData] = useState({
        name: '',
        email: '',
        phone: '',
        description: ''
    });
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        answer: ''
    });
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState({
        question: '',
        answer: ''
    });
    const [errors, setErrors] = useState({});
    const [mentorErrors, setMentorErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMentorSubmitting, setIsMentorSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [mentorSubmitMessage, setMentorSubmitMessage] = useState('');

    // Fetch data
    useEffect(() => {
        fetchInterviews();
        fetchUsers();
        fetchMentors();
        document.title = 'Admin Dashboard';
        const storedTheme = localStorage.getItem('admin-theme');
        if (storedTheme === 'dark') {
            setDarkMode(true);
        } else {
            setDarkMode(false); // default to light style similar to requested reference
        }
    }, []);

    // Poll new contacts periodically for notifications
    useEffect(() => {
        let mounted = true;
        let timer;
        const fetchNewContacts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/contacts');
                if (!res.ok) return;
                const json = await res.json();
                const list = (json?.data || []).filter(c => c.status === 'new').sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
                if (!mounted) return;
                // trigger subtle animation when count increases
                setNewContacts(prev => {
                    const prevCount = prev.length;
                    const nextCount = list.length;
                    if (nextCount > prevCount) {
                        setBellAnimate(true);
                        setTimeout(()=> setBellAnimate(false), 1000);
                        try { const audio = new Audio(); /* placeholder for optional sound */ } catch {}
                    }
                    return list;
                });
                try { localStorage.setItem('contactsNewCount', String(list.length)); } catch {}
            } catch (e) {
                // ignore
            } finally {
                if (mounted) timer = setTimeout(fetchNewContacts, 15000);
            }
        };
        fetchNewContacts();
        return () => { mounted = false; if (timer) clearTimeout(timer); };
    }, []);

    useEffect(() => {
        if (editingInterview && showAddForm) {
            setFormData({
                company: editingInterview.company || '',
                role: editingInterview.role || '',
                questions: editingInterview.questions || [],
                type: editingInterview.type || 'Algorithms & Systems',
                difficulty: editingInterview.difficulty || 'Medium'
            });
        } else if (!editingInterview && showAddForm) {
            resetForm();
        }
    }, [editingInterview, showAddForm]);

    useEffect(() => {
        localStorage.setItem('admin-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Focus first input and handle ESC to close when modal opens
    useEffect(() => {
        if (showAddForm && companyInputRef.current) {
            companyInputRef.current.focus();
        }
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setShowAddForm(false);
                setEditingInterview(null);
            }
        };
        if (showAddForm) {
            document.addEventListener('keydown', onKey);
        }
        return () => document.removeEventListener('keydown', onKey);
    }, [showAddForm]);

    const fetchInterviews = async () => {
        try {
            const response = await fetch('/interview');
            if (response.ok) {
                const data = await response.json();
                setInterviews(data);
            }
        } catch (error) {
            console.error('Error fetching interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.log(error);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await fetch('/user');
            if (res.ok) {
                const data = await res.json();
                setUsers(data || []);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchMentors = async () => {
        setMentorsLoading(true);
        try {
            const res = await fetch('/mentor');
            if (res.ok) {
                const data = await res.json();
                setMentors(data || []);
            }
        } catch (err) {
            console.error('Error fetching mentors:', err);
        } finally {
            setMentorsLoading(false);
        }
    };

    const toggleUserActive = async (userId, nextActive) => {
        try {
            const res = await fetch(`/user/active/${encodeURIComponent(userId)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: nextActive })
            });
            if (res.ok) {
                const updated = await res.json();
                setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
                if (!nextActive) {
                    alert(`User ${updated.email || updated.id} has been deactivated and an email notification has been sent.`);
                } else {
                    alert(`User ${updated.email || updated.id} has been activated.`);
                }
            } else {
                const errorData = await res.json();
                alert(`Failed to update user: ${errorData.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Failed to update user', err);
            alert('Failed to update user status. Please try again.');
        }
    };

    const updateMentorStatus = async (mentorId, status) => {
        try {
            const res = await fetch(`/mentor/${encodeURIComponent(mentorId)}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                const updated = await res.json();
                const updatedMentor = updated.mentor || {};
                setMentors(prev => prev.map(m => (m._id === updatedMentor._id ? updatedMentor : m)));
            } else {
                const errData = await res.json();
                alert(errData.message || 'Failed to update mentor');
            }
        } catch (e) {
            console.error('Failed to update mentor status', e);
            alert('Failed to update mentor status. Please try again.');
        }
    };

    const deleteMentor = async (mentorId) => {
        if (!window.confirm('Delete this mentor?')) return;
        try {
            const res = await fetch(`/mentor/${encodeURIComponent(mentorId)}`, { method: 'DELETE' });
            if (res.ok) {
                setMentors(prev => prev.filter(m => m._id !== mentorId));
            } else {
                const errData = await res.json();
                alert(errData.message || 'Failed to delete mentor');
            }
        } catch (e) {
            console.error('Failed to delete mentor', e);
            alert('Failed to delete mentor.');
        }
    };

    // Validation helpers (unchanged)
    const hasRepeatedCharacters = (text, maxRepeats = 3) => {
        const regex = new RegExp(`(.)\\1{${maxRepeats},}`, 'i');
        return regex.test(text);
    };
    const hasMeaningfulWords = (text, minWords = 2) => {
        const words = text.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(word => word.length > 0);
        if (words.length < minWords) return false;
        const validWords = words.filter(word => word.length >= 1 && word.length <= 30);
        return (validWords.length / words.length) >= 0.6;
    };
    const hasProperSpacing = (text) => {
        const words = text.trim().split(/\s+/);
        return words.length >= 2;
    };
    const isMeaningfulContent = (text, fieldType) => {
        const trimmed = text.trim();
        const lower = trimmed.toLowerCase();
        const alnum = lower.replace(/[^a-z0-9]/g, '');
        const punctuationCount = trimmed.length - alnum.length;
        const punctuationRatio = trimmed.length ? punctuationCount / trimmed.length : 0;
        const hasVowel = /[aeiou]/i.test(trimmed);
        
        // Enhanced keyboard pattern detection
        const keyboardPatterns = [
            'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz',
            'qwerty', 'asdf', 'zxcv', 'qazwsx', '1q2w3e', '1234567890', '0987654321',
            'dfghjklkjhg', 'sdfghjklkjhgfdsdfghjkjhgfddfghjhg', 'wertyuioiuytreert',
            'rtyuigkjbnmn', 'qwertyuiopasdfghjklzxcvbnm'
        ];
        const containsKeyboardRun = keyboardPatterns.some(p => lower.includes(p));
        
        // Check for repeated characters (more than 3 consecutive)
        if (/(.)\1{3,}/.test(trimmed)) return false;
        
        // Too much punctuation or separators -> likely gibberish
        if (punctuationRatio > 0.35) return false;
        
        // Must contain at least some vowels for natural language
        if (!hasVowel && alnum.length >= 3) return false;
        
        // Reject keyboard runs / obvious gibberish
        if (containsKeyboardRun) return false;
        
        // Reject tokens that are mostly 1-char words
        const tokens = trimmed.split(/[^\w]+/).filter(Boolean);
        const oneCharTokens = tokens.filter(t => t.length === 1).length;
        if (tokens.length > 0 && oneCharTokens / tokens.length > 0.5) return false;

        // Field-specific validation
        if (fieldType === 'company') {
            if (trimmed.length < 2) return false;
            if (trimmed.length > 100) return false;
            if (hasRepeatedCharacters(trimmed)) return false;
            // Company names should contain letters and basic punctuation only
            if (!/^[a-zA-Z0-9\s&.,'-]+$/.test(trimmed)) return false;
            // Must have at least one meaningful word
            const words = trimmed.split(/\s+/).filter(word => word.length >= 2);
            if (words.length < 1) return false;
            return true;
        }
        
        if (fieldType === 'role') {
            if (trimmed.length < 2) return false;
            if (trimmed.length > 100) return false;
            if (hasRepeatedCharacters(trimmed)) return false;
            // Role names should contain letters, numbers, spaces, and basic punctuation
            if (!/^[a-zA-Z0-9\s&.,'-/]+$/.test(trimmed)) return false;
            // Must have at least one meaningful word
            const words = trimmed.split(/\s+/).filter(word => word.length >= 2);
            if (words.length < 1) return false;
            return true;
        }
        
        if (fieldType === 'question') {
            if (trimmed.length < 15) return false;
            if (trimmed.length > 500) return false;
            if (hasRepeatedCharacters(trimmed)) return false;
            // Questions should end with question mark
            if (!trimmed.endsWith('?')) return false;
            // Must have meaningful words
            const words = trimmed.split(/\s+/).filter(word => word.length >= 2);
            if (words.length < 3) return false;
            // Check for excessive word repetition
            const wordCounts = {};
            words.forEach(word => {
                wordCounts[word.toLowerCase()] = (wordCounts[word.toLowerCase()] || 0) + 1;
            });
            const maxWordRepetition = Math.max(...Object.values(wordCounts));
            if (maxWordRepetition > Math.ceil(words.length / 2)) return false;
            return true;
        }
        
        if (fieldType === 'answer') {
            if (trimmed.length < 3) return false;
            if (trimmed.length > 1000) return false;
            if (hasRepeatedCharacters(trimmed)) return false;
            // Must have meaningful words
            const words = trimmed.split(/\s+/).filter(word => word.length >= 2);
            if (words.length < 1) return false;
            // Check for excessive word repetition
            const wordCounts = {};
            words.forEach(word => {
                wordCounts[word.toLowerCase()] = (wordCounts[word.toLowerCase()] || 0) + 1;
            });
            const maxWordRepetition = Math.max(...Object.values(wordCounts));
            if (maxWordRepetition > Math.ceil(words.length / 2)) return false;
            return true;
        }
        
        // General validation for other fields
        if (hasRepeatedCharacters(trimmed) && trimmed.length > 5) return false;
        
        // Default validation for other field types
        if (trimmed.length < 2) return false;
        if (trimmed.length > 200) return false;
        
        return true;
    };

    const validateField = (name, value) => {
        const newErrors = { ...errors };
        switch (name) {
            case 'company':
                if (!value.trim()) {
                    newErrors.company = 'Company name is required';
                } else if (value.trim().length > 100) {
                    newErrors.company = 'Company name must be less than 100 characters';
                } else if (!isMeaningfulContent(value, 'company')) {
                    newErrors.company = 'Please enter a valid company name (avoid keyboard patterns, repeated characters, or gibberish)';
                } else {
                    delete newErrors.company;
                }
                break;
            case 'role':
                if (!value.trim()) {
                    newErrors.role = 'Role is required';
                } else if (value.trim().length < 2) {
                    newErrors.role = 'Role must be at least 2 characters';
                } else if (value.trim().length > 100) {
                    newErrors.role = 'Role must be less than 100 characters';
                } else if (!isMeaningfulContent(value, 'role')) {
                    newErrors.role = 'Please enter a valid role (avoid keyboard patterns, repeated characters, or gibberish)';
                } else {
                    delete newErrors.role;
                }
                break;
            case 'type':
                if (!value) {
                    newErrors.type = 'Interview type is required';
                } else {
                    delete newErrors.type;
                }
                break;
            case 'question':
                if (!value.trim()) {
                    newErrors.question = 'Question is required';
                } else if (value.trim().length < 15) {
                    newErrors.question = 'Question must be at least 15 characters';
                } else if (value.trim().length > 500) {
                    newErrors.question = 'Question must be less than 500 characters';
                } else if (!isMeaningfulContent(value, 'question')) {
                    newErrors.question = 'Please enter a meaningful question (avoid keyboard patterns, repeated characters, or gibberish)';
                } else if (!value.trim().endsWith('?')) {
                    newErrors.question = 'Question should end with a question mark (?)';
                } else {
                    delete newErrors.question;
                }
                break;
            case 'answer':
                if (!value.trim()) {
                    newErrors.answer = 'Answer is required';
                } else if (value.trim().length < 3) {
                    newErrors.answer = 'Answer must be at least 3 characters';
                } else if (value.trim().length > 1000) {
                    newErrors.answer = 'Answer must be less than 1000 characters';
                } else if (!isMeaningfulContent(value, 'answer')) {
                    newErrors.answer = 'Enter a meaningful answer (avoid keyboard patterns, repeated characters, or gibberish)';
                } else {
                    delete newErrors.answer;
                }
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.company.trim()) {
            newErrors.company = 'Company name is required';
        } else if (formData.company.trim().length > 100) {
            newErrors.company = 'Company name must be less than 100 characters';
        } else if (!isMeaningfulContent(formData.company, 'company')) {
            newErrors.company = 'Please enter a valid company name (avoid repeated characters or random text)';
        }
        if (!formData.role.trim()) {
            newErrors.role = 'Role is required';
        } else if (formData.role.trim().length < 2) {
            newErrors.role = 'Role must be at least 2 characters';
        } else if (formData.role.trim().length > 100) {
            newErrors.role = 'Role must be less than 100 characters';
        } else if (!isMeaningfulContent(formData.role, 'role')) {
            newErrors.role = 'Please enter a valid role (avoid repeated characters or random text)';
        }
        if (!formData.type) newErrors.type = 'Interview type is required';
        if (formData.questions.length < 10) {
            newErrors.questions = 'Minimum 10 questions required';
        } else {
            const invalidQuestions = formData.questions.filter(q => 
                !isMeaningfulContent(q.question, 'question') || 
                !isMeaningfulContent(q.answer, 'answer') ||
                !q.question.trim().endsWith('?')
            );
            if (invalidQuestions.length > 0) newErrors.questions = 'All questions and answers must be meaningful and properly formatted';
            }
        const questionTexts = formData.questions.map(q => q.question.toLowerCase().trim());
        const duplicates = questionTexts.filter((text, index) => questionTexts.indexOf(text) !== index);
        if (duplicates.length > 0) newErrors.questions = 'Duplicate questions are not allowed';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (submitMessage) setSubmitMessage('');
        validateField(name, value);
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuestion(prev => ({ ...prev, [name]: value }));
        if (submitMessage) setSubmitMessage('');
        validateField(name, value);
    };

    const addQuestion = () => {
        const questionValid = validateField('question', currentQuestion.question);
        const answerValid = validateField('answer', currentQuestion.answer);
        if (!questionValid || !answerValid) {
            setSubmitMessage('Please fix the errors before adding the question');
            return;
        }
        if (!isMeaningfulContent(currentQuestion.question, 'question')) {
            setErrors(prev => ({ ...prev, question: 'Please enter a meaningful question (avoid repeated characters, random text, or gibberish)' }));
            setSubmitMessage('Question must contain meaningful content');
            return;
        }
        if (!currentQuestion.question.trim().endsWith('?')) {
            setErrors(prev => ({ ...prev, question: 'Question should end with a question mark (?)' }));
            setSubmitMessage('Question should end with ?');
            return;
        }
        if (!isMeaningfulContent(currentQuestion.answer, 'answer')) {
            setErrors(prev => ({ ...prev, answer: 'Enter a meaningful sentence (min 8 chars or include spaces; avoid random letters)' }));
            setSubmitMessage('Answer must contain meaningful content');
            return;
        }
        const isDuplicate = formData.questions.some(q => q.question.toLowerCase().trim() === currentQuestion.question.toLowerCase().trim());
        if (isDuplicate) {
            setErrors(prev => ({ ...prev, question: 'This question already exists' }));
            setSubmitMessage('Duplicate questions are not allowed');
            return;
        }
        if (formData.questions.length >= 50) {
            setSubmitMessage('Maximum 50 questions allowed');
            return;
        }
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, { question: currentQuestion.question.trim(), answer: currentQuestion.answer.trim() }]
        }));
        setCurrentQuestion({ question: '', answer: '' });
        setErrors(prev => { const newErrors = { ...prev }; delete newErrors.question; delete newErrors.answer; return newErrors; });
        setSubmitMessage('');
    };

    const removeQuestion = (index) => {
        setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
    };

    const startEditQuestion = (index) => {
        const question = formData.questions[index];
        setEditingQuestionIndex(index);
        setEditingQuestion({ question: question.question, answer: question.answer });
    };

    const cancelEditQuestion = () => {
        setEditingQuestionIndex(null);
        setEditingQuestion({ question: '', answer: '' });
    };

    const saveEditQuestion = () => {
        if (!editingQuestion.question.trim() || !editingQuestion.answer.trim()) {
            setSubmitMessage('Both question and answer are required');
            return;
        }
        if (editingQuestion.question.trim().length < 10) {
            setSubmitMessage('Question must be at least 10 characters long');
            return;
        }
        if (editingQuestion.answer.trim().length < 3) {
            setSubmitMessage('Answer must be at least 3 characters long');
            return;
        }
        const questionText = editingQuestion.question.trim();
        const answerText = editingQuestion.answer.trim();
        if (/(.)\1{4,}/.test(questionText) || /(.)\1{4,}/.test(answerText)) {
            setSubmitMessage('Questions and answers must contain meaningful content');
            return;
        }
        const isDuplicate = formData.questions.some((q, index) => index !== editingQuestionIndex && q.question.toLowerCase().trim() === editingQuestion.question.toLowerCase().trim());
        if (isDuplicate) {
            setSubmitMessage('This question already exists');
            return;
        }
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map((q, index) => index === editingQuestionIndex ? { question: editingQuestion.question.trim(), answer: editingQuestion.answer.trim() } : q)
        }));
        setEditingQuestionIndex(null);
        setEditingQuestion({ question: '', answer: '' });
        setSubmitMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSubmitMessage('');
        if (!validateForm()) {
            setSubmitMessage('Please fix all errors before submitting');
            setIsSubmitting(false);
            return;
        }
        if (formData.questions.length < 10) {
            setErrors(prev => ({ ...prev, questions: 'Minimum 10 questions required' }));
            setSubmitMessage('Minimum 10 questions required');
            setIsSubmitting(false);
            return;
        }
        if (formData.questions.length > 50) {
            setErrors(prev => ({ ...prev, questions: 'Maximum 50 questions allowed' }));
            setSubmitMessage('Maximum 50 questions allowed');
            setIsSubmitting(false);
            return;
        }
        try {
            const url = editingInterview ? `/interview/${editingInterview._id}/update` : '/interview';
            const method = editingInterview ? 'PUT' : 'POST';
            const sanitizedData = {
                company: formData.company.trim(),
                role: formData.role.trim(),
                type: formData.type,
                difficulty: formData.difficulty,
                questions: formData.questions.map(q => ({ question: q.question.trim(), answer: q.answer.trim() }))
            };
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitizedData)
            });
            if (response.ok) {
                const newInterview = await response.json();
                if (editingInterview) {
                    setInterviews(prev => prev.map(i => i._id === editingInterview._id ? newInterview : i));
                    setSubmitMessage('Interview updated successfully!');
                } else {
                    setInterviews(prev => [newInterview, ...prev]);
                    setSubmitMessage('Interview created successfully!');
                }
                setTimeout(() => {
                    setShowAddForm(false);
                    setEditingInterview(null);
                    resetForm();
                    fetchInterviews();
                }, 1200);
            } else {
                const errorData = await response.json();
                setSubmitMessage(`Failed to save interview: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving interview:', error);
            setSubmitMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (interview) => {
        setEditingInterview(interview);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this interview?')) {
            try {
                const response = await fetch(`/interview/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchInterviews();
                    alert('Interview deleted successfully!');
                }
            } catch (error) {
                console.error('Error deleting interview:', error);
                alert('Error deleting interview');
            }
        }
    };

    const resetForm = () => {
        setFormData({ company: '', role: '', questions: [], type: 'Algorithms & Systems', difficulty: 'Medium' });
        setCurrentQuestion({ question: '', answer: '' });
        setErrors({});
        setSubmitMessage('');
        setIsSubmitting(false);
    };

    const resetMentorForm = () => {
        setMentorFormData({
            name: '',
            email: '',
            phone: '',
            description: ''
        });
        setMentorErrors({});
        setMentorSubmitMessage('');
        setIsMentorSubmitting(false);
    };

    const validateMentorField = (name, value) => {
        const newErrors = { ...mentorErrors };
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'Name is required';
                } else if (value.trim().length < 2) {
                    newErrors.name = 'Name must be at least 2 characters';
                } else if (value.trim().length > 100) {
                    newErrors.name = 'Name must be less than 100 characters';
                } else {
                    delete newErrors.name;
                }
                break;
            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    newErrors.email = 'Please enter a valid email address';
                } else {
                    delete newErrors.email;
                }
                break;
            case 'phone':
                if (value.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(value.trim().replace(/[\s\-\(\)]/g, ''))) {
                    newErrors.phone = 'Please enter a valid phone number';
                } else {
                    delete newErrors.phone;
                }
                break;
            case 'description':
                if (value.trim() && value.trim().length > 500) {
                    newErrors.description = 'Description must be less than 500 characters';
                } else {
                    delete newErrors.description;
                }
                break;
        }
        setMentorErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateMentorForm = () => {
        const newErrors = {};
        if (!mentorFormData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (mentorFormData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (mentorFormData.name.trim().length > 100) {
            newErrors.name = 'Name must be less than 100 characters';
        }
        if (!mentorFormData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mentorFormData.email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (mentorFormData.phone.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(mentorFormData.phone.trim().replace(/[\s\-\(\)]/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }
        if (mentorFormData.description.trim() && mentorFormData.description.trim().length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }
        setMentorErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleMentorInputChange = (e) => {
        const { name, value } = e.target;
        setMentorFormData(prev => ({ ...prev, [name]: value }));
        if (mentorSubmitMessage) setMentorSubmitMessage('');
        validateMentorField(name, value);
    };

    const handleMentorSubmit = async (e) => {
        e.preventDefault();
        if (isMentorSubmitting) return;
        setIsMentorSubmitting(true);
        setMentorSubmitMessage('');
        
        if (!validateMentorForm()) {
            setMentorSubmitMessage('Please fix all errors before submitting');
            setIsMentorSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/mentor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mentorFormData)
            });

            if (response.ok) {
                setMentorSubmitMessage('Mentor added successfully!');
                setTimeout(() => {
                    setShowMentorForm(false);
                    resetMentorForm();
                }, 1500);
            } else {
                const errorData = await response.json();
                setMentorSubmitMessage(`Failed to add mentor: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding mentor:', error);
            setMentorSubmitMessage('Network error. Please try again.');
        } finally {
            setIsMentorSubmitting(false);
        }
    };

    // Derived data for widgets and charts
    const totalInterviews = interviews.length;
    const totalCompanies = useMemo(() => { const s = new Set(); interviews.forEach(i => { const k = (i?.company || '').toString().toLowerCase().trim(); if (k) s.add(k); }); return s.size; }, [interviews]);
    const totalRoles = useMemo(() => { const s = new Set(); interviews.forEach(i => { const k = (i?.role || '').toString().toLowerCase().trim(); if (k) s.add(k); }); return s.size; }, [interviews]);
    const totalQuestions = useMemo(() => interviews.reduce((acc, i) => acc + (i.questions?.length || 0), 0), [interviews]);

    const chartData = useMemo(() => {
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const now = new Date();
        // Build last 12 months window labels
        const labels = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
            return { y: d.getFullYear(), m: d.getMonth(), label: monthNames[d.getMonth()] };
        });
        const counts = Array(12).fill(0);
        users.forEach(u => {
            const d = u.createdAt ? new Date(u.createdAt) : null;
            if (!d) return;
            labels.forEach((L, idx) => { if (d.getFullYear() === L.y && d.getMonth() === L.m) counts[idx] += 1; });
        });
        let cumulative = 0;
        return counts.map((c, idx) => { cumulative += c; return { name: labels[idx].label, signups: c, cumulativeUsers: cumulative }; });
    }, [users]);

    const pieData = useMemo(() => {
        const counts = { Easy: 0, Medium: 0, Hard: 0 };
        interviews.forEach(i => { counts[i.difficulty] = (counts[i.difficulty] || 0) + 1; });
        return [
            { name: 'Easy', value: counts.Easy || 0 },
            { name: 'Medium', value: counts.Medium || 0 },
            { name: 'Hard', value: counts.Hard || 0 }
        ];
    }, [interviews]);

    // Modern gradient colors for charts
    const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    // Filtering and pagination for users table (lightweight)
    const [userQuery, setUserQuery] = useState('');
    const [userPage, setUserPage] = useState(1);
    const usersWithRole = useMemo(() => users.map(u => ({ ...u, role: u.role || ((u.email||'').includes('@') ? 'student' : 'student') })), [users]);
    const [userSort, setUserSort] = useState({ key: 'email', dir: 'asc' });
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [userSelection, setUserSelection] = useState(new Set());
    const filteredUsers = useMemo(() => usersWithRole
        .filter(u => (u.email || u.id || '').toLowerCase().includes(userQuery.toLowerCase()))
        .filter(u => userRoleFilter === 'all' ? true : (u.role === userRoleFilter))
        .filter(u => userStatusFilter === 'all' ? true : (userStatusFilter === 'active' ? u.active : !u.active))
        .sort((a,b)=>{
            const dir = userSort.dir === 'asc' ? 1 : -1;
            if (userSort.key === 'email') return ((a.email||'').localeCompare(b.email||''))*dir;
            if (userSort.key === 'score') return ((a.score||0)-(b.score||0))*dir;
            if (userSort.key === 'role') return ((a.role||'').localeCompare(b.role||''))*dir;
            return 0;
        })
    , [usersWithRole, userQuery, userRoleFilter, userStatusFilter, userSort]);
    const usersPerPage = 10;
    const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
    const pagedUsers = filteredUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

    // Mentors table
    const [mentorQuery, setMentorQuery] = useState('');
    const [mentorPage, setMentorPage] = useState(1);
    const mentorsPerPage = 10;
    const [mentorSort, setMentorSort] = useState({ key: 'name', dir: 'asc' });
    const [mentorStatusFilter, setMentorStatusFilter] = useState('all'); // all | active | inactive | pending
    const [mentorSelection, setMentorSelection] = useState(new Set());
    const filteredMentors = useMemo(() => mentors
        .filter(m => `${m.name||''} ${m.email||''} ${m.phone||''}`.toLowerCase().includes(mentorQuery.toLowerCase()))
        .filter(m => mentorStatusFilter === 'all' ? true : (m.status === mentorStatusFilter))
        .sort((a,b)=>{
            const dir = mentorSort.dir === 'asc' ? 1 : -1;
            if (mentorSort.key === 'name') return ((a.name||'').localeCompare(b.name||''))*dir;
            if (mentorSort.key === 'email') return ((a.email||'').localeCompare(b.email||''))*dir;
            if (mentorSort.key === 'status') return ((a.status||'').localeCompare(b.status||''))*dir;
            return 0;
        })
    , [mentors, mentorQuery, mentorStatusFilter, mentorSort]);
    const totalMentorPages = Math.max(1, Math.ceil(filteredMentors.length / mentorsPerPage));
    const pagedMentors = filteredMentors.slice((mentorPage - 1) * mentorsPerPage, mentorPage * mentorsPerPage);

    // Filtering and pagination for interviews table
    const [interviewQuery, setInterviewQuery] = useState('');
    const [interviewPage, setInterviewPage] = useState(1);
    const interviewsPerPage = 10;
    const filteredInterviews = useMemo(() => interviews.filter(i => `${i.company} ${i.role} ${i.type}`.toLowerCase().includes(interviewQuery.toLowerCase())), [interviews, interviewQuery]);
    const totalInterviewPages = Math.max(1, Math.ceil(filteredInterviews.length / interviewsPerPage));
    const pagedInterviews = filteredInterviews.slice((interviewPage - 1) * interviewsPerPage, interviewPage * interviewsPerPage);

    // Confirmation modal state
    // const [confirm, setConfirm] = useState(null);
    // Banner state
    // const [banner, setBanner] = useState(null);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className={`admin-shell ${darkMode ? 'dark' : ''}`}>
            <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <button className="icon-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label="Toggle sidebar">
                        ☰
                    </button>
                    {!sidebarCollapsed && <span className="brand">Admin Panel</span>}
                </div>
                <nav className="sidebar-nav">
                    <button className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}>
                        <span role="img" aria-label="dashboard">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </span> 
                        {!sidebarCollapsed && <span>Dashboard</span>}
                    </button>
                    <button className={`nav-item ${activeSection === 'users' ? 'active' : ''}`} onClick={() => setActiveSection('users')}>
                        <span role="img" aria-label="users">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </span> 
                        {!sidebarCollapsed && <span>Users</span>}
                    </button>
                    <button className={`nav-item ${activeSection === 'mentors' ? 'active' : ''}`} onClick={() => setActiveSection('mentors')}>
                        <span role="img" aria-label="mentor">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </span> 
                        {!sidebarCollapsed && <span>Mentors</span>}
                    </button>
                    <button className={`nav-item ${activeSection === 'interviews' ? 'active' : ''}`} onClick={() => setActiveSection('interviews')}>
                        <span role="img" aria-label="briefcase">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                        </span> 
                        {!sidebarCollapsed && <span>Interviews</span>}
                    </button>
                    <button className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`} onClick={() => setActiveSection('analytics')}>
                        <span role="img" aria-label="chart">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                            </svg>
                        </span> 
                        {!sidebarCollapsed && <span>Analytics</span>}
                    </button>
                    <button className={`nav-item ${activeSection === 'contacts' ? 'active' : ''}`} onClick={() => setActiveSection('contacts')}>
                        <span role="img" aria-label="contacts">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </span> 
                        {!sidebarCollapsed && <span>Contacts</span>}
                    </button>
                    <button className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`} onClick={() => setActiveSection('settings')}>
                        <span role="img" aria-label="settings">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </span> 
                        {!sidebarCollapsed && <span>Settings</span>}
                    </button>
                    <div className="nav-divider"></div>
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <span role="img" aria-label="logout">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16,17 21,12 16,7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </span> 
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </nav>
            </aside>

            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <h1>Admin Dashboard</h1>
                        <p>Welcome back, Admin</p>
                    </div>
                    <div className="topbar-right">
                        <div className="search-box" role="combobox" aria-expanded={searchOpen} aria-haspopup="listbox">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="M21 21l-4.35-4.35"></path>
                            </svg>
                            <input value={globalSearch} onChange={(e) => { setGlobalSearch(e.target.value); setSearchOpen(true); }} onBlur={() => setTimeout(()=>setSearchOpen(false),150)} placeholder="Search users, interviews..." aria-label="Global search" />
                            {searchOpen && globalSearch.trim() && (
                                <ul className="search-suggest" role="listbox">
                                    {Array.from(new Set([
                                        ...users.map(u => u.email || ''),
                                        ...interviews.map(i => `${i.company} ${i.role}`)
                                    ].filter(Boolean).filter(s => s.toLowerCase().includes(globalSearch.toLowerCase())).slice(0,6))).map((s, idx) => (
                                        <li key={idx} role="option" tabIndex={0} onMouseDown={() => { setGlobalSearch(s); setSearchOpen(false); }}>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                        <div className="notifications" style={{ position:'relative' }}>
                            <button className={`icon-btn ${bellAnimate ? 'ring' : ''}`} onClick={() => setNotificationsOpen(v => !v)} aria-label="Notifications">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                {newContacts.length > 0 && (
                                    <span className="notif-badge" aria-label={`${newContacts.length} new messages`}>{Math.min(newContacts.length, 99)}</span>
                                )}
                            </button>
                            {notificationsOpen && (
                                <div className="dropdown-panel" style={{ minWidth: 320 }}>
                                    <div className="dropdown-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                        <span>New Contact Messages</span>
                                        <button className="dropdown-item" style={{padding:'6px 8px'}} onClick={()=>{
                                            const ids = newContacts.map(n=>n._id);
                                            setNewContacts([]);
                                            ids.forEach(async (id)=>{
                                                try { await fetch(`http://localhost:5000/api/contacts/${id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:'in_progress' }) }); } catch {}
                                            });
                                            setNotificationsOpen(false);
                                        }}>Mark all read</button>
                                    </div>
                                    {newContacts.length === 0 ? (
                                        <div className="dropdown-item">No new messages</div>
                                    ) : (
                                        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                                            {newContacts.slice(0,8).map((c)=> (
                                                <button key={c._id} className="dropdown-item" onClick={async ()=>{
                                                    try { await fetch(`http://localhost:5000/api/contacts/${c._id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:'in_progress' }) }); } catch {}
                                                    setNewContacts(prev => prev.filter(x => x._id !== c._id));
                                                    setActiveSection('contacts');
                                                    setNotificationsOpen(false);
                                                    setTimeout(()=> {
                                                        window.dispatchEvent(new CustomEvent('openContact', { detail: { id: c._id } }));
                                                    }, 50);
                                                }}>
                                                    <div style={{ display:'grid', gap:2 }}>
                                                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                                                            <strong style={{ maxWidth: '70%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name || c.email}</strong>
                                                            <span className="time-muted">{new Date(c.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                        </div>
                                                        <div className="muted" style={{ fontSize:12 }}>{c.inquiryType || c.subject || 'General'}</div>
                                                        <div style={{ fontSize:12, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{(c.message||'').toString().slice(0, 80)}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="profile">
                            <div className="profile-info">
                                <span className="email">Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="admin-content">
                    {activeSection === 'dashboard' && (
                        <>
                            {/* Welcome Section */}
                            <section className="welcome-section">
                                <div className="welcome-card">
                                    <div className="welcome-content">
                                        <h2>Welcome back, Admin!</h2>
                                        <p>Monitor system performance, manage users, and oversee platform operations from your centralized dashboard.</p>
                                        <div className="welcome-actions">
                                            <button className="btn-primary" onClick={() => setActiveSection('users')}>
                                                Manage Users
                                            </button>
                                            <button className="btn-secondary" onClick={() => setActiveSection('analytics')}>
                                                View Analytics
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* KPI Overview */}
                            <section className="kpi-grid">
                                <div className="kpi-card">
                                    <div className="kpi-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                    </div>
                                    <div className="kpi-content">
                                        <div className="kpi-title">Total Users</div>
                                        <div className="kpi-value">{users.length}</div>
                                        <div className="kpi-change">+2.4% this month</div>
                                    </div>
                                </div>
                                <div className="kpi-card">
                                    <div className="kpi-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                        </svg>
                                    </div>
                                    <div className="kpi-content">
                                        <div className="kpi-title">Interviews</div>
                                        <div className="kpi-value">{totalInterviews}</div>
                                        <div className="kpi-change">+1.1% this month</div>
                                    </div>
                                </div>
                                <div className="kpi-card">
                                    <div className="kpi-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <div className="kpi-content">
                                        <div className="kpi-title">Active Mentors</div>
                                        <div className="kpi-value">{mentors.filter(m => m.status === 'active').length}</div>
                                        <div className="kpi-change">{mentors.length} total</div>
                                    </div>
                                </div>
                                <div className="kpi-card">
                                    <div className="kpi-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                        </svg>
                                    </div>
                                    <div className="kpi-content">
                                        <div className="kpi-title">Companies / Roles</div>
                                        <div className="kpi-value">{totalCompanies} / {totalRoles}</div>
                                        <div className="kpi-change">{totalQuestions} total questions</div>
                                    </div>
                                </div>
                            </section>

                            <section className="charts-grid">
                                <div className="chart-card">
                                    <div className="chart-title">Monthly Activity</div>
                                    <div className="chart-body">
                                        <ResponsiveContainer width="100%" height={240}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} name="New Users" />
                                                <Line type="monotone" dataKey="cumulativeUsers" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} name="Total Users" />
                                            </LineChart>
                                        </ResponsiveContainer>
                    </div>
                </div>
                                <div className="chart-card">
                                    <div className="chart-title">Interviews by Difficulty</div>
                                    <div className="chart-body">
                                        <ResponsiveContainer width="100%" height={240}>
                                            <PieChart>
                                                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50}>
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                    </div>
                </div>
                                <div className="chart-card">
                                    <div className="chart-title">Company Distribution</div>
                                    <div className="chart-body">
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={interviews.slice(0, 8).map(i => ({ name: i.company, count: i.questions.length }))}>
                                                <defs>
                                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#6366f1" />
                                                        <stop offset="100%" stopColor="#8b5cf6" />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="name" hide={false} />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="url(#gradient)" radius={[12,12,0,0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
            </div>
                                </div>
                            </section>

                            {/* Quick Actions */}
                            <section className="quick-actions-section">
                                <div className="card">
                                    <div className="card-header">
                                        <h3>Quick Actions</h3>
                                        <p>Common administrative tasks</p>
                                    </div>
                                    <div className="card-content">
                                        <div className="quick-actions-grid">
                                            <button className="quick-action-btn" onClick={() => { setEditingInterview(null); setShowAddForm(true); }}>
                                                <div className="action-icon">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                                    </svg>
                                                </div>
                                                <div className="action-content">
                                                    <h4>Add Interview</h4>
                                                    <p>Create new interview questions</p>
                                                </div>
                                            </button>
                                            <button className="quick-action-btn" onClick={() => setShowMentorForm(true)}>
                                                <div className="action-icon">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="12" cy="7" r="4"></circle>
                                                    </svg>
                                                </div>
                                                <div className="action-content">
                                                    <h4>Add Mentor</h4>
                                                    <p>Register new mentor</p>
                                                </div>
                                            </button>
                                            <button className="quick-action-btn" onClick={() => setActiveSection('users')}>
                                                <div className="action-icon">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="9" cy="7" r="4"></circle>
                                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                                    </svg>
                                                </div>
                                                <div className="action-content">
                                                    <h4>Manage Users</h4>
                                                    <p>View and manage user accounts</p>
                                                </div>
                                            </button>
                                            <button className="quick-action-btn" onClick={() => setActiveSection('contacts')}>
                                                <div className="action-icon">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                        <polyline points="22,6 12,13 2,6"></polyline>
                                                    </svg>
                                                </div>
                                                <div className="action-content">
                                                    <h4>View Messages</h4>
                                                    <p>Check contact inquiries</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Recent Activity */}
                            <section className="recent-activity">
                                <div className="card">
                                    <div className="card-header">
                                        <h3>Recent Activity</h3>
                                        <p>Latest system events and updates</p>
                                    </div>
                                    <div className="card-content">
                                        <div className="activity-list">
                                            {[...users].slice(-5).reverse().map((u, idx) => {
                                                const label = u.email || u.id || '';
                                                const initials = (label.match(/^[^@]+/)?.[0] || label).slice(0,2).toUpperCase();
                                                return (
                                                    <div key={idx} className="activity-item">
                                                        <div className="activity-avatar" aria-hidden>{initials}</div>
                                                        <div className="activity-content">
                                                            <div className="activity-text"><strong>{label}</strong> {u.active ? 'signed in' : 'was deactivated'}</div>
                                                            <div className="activity-time">{new Date().toLocaleTimeString()}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {[...interviews].slice(-5).reverse().map((i, idx) => {
                                                const company = i.company || '—';
                                                const initials = company.slice(0,2).toUpperCase();
                                                return (
                                                    <div key={`i-${idx}`} className="activity-item">
                                                        <div className="activity-avatar" aria-hidden>{initials}</div>
                                                        <div className="activity-content">
                                                            <div className="activity-text">Interview for <strong>{i.role}</strong> at <strong>{company}</strong> updated</div>
                                                            <div className="activity-time">{new Date().toLocaleTimeString()}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {activeSection === 'users' && (
                        <section className="table-container new">
                            <div className="table-toolbar" role="region" aria-label="User controls">
                                <input className="input" placeholder="Search users" value={userQuery} onChange={(e) => { setUserQuery(e.target.value); setUserPage(1); }} aria-label="Search users" />
                                <select value={userRoleFilter} onChange={(e)=>{ setUserRoleFilter(e.target.value); setUserPage(1); }} aria-label="Filter by role">
                                    <option value="all">All roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="recruiter">Recruiter</option>
                                    <option value="student">Student</option>
                                </select>
                                <select value={userStatusFilter} onChange={(e)=>{ setUserStatusFilter(e.target.value); setUserPage(1); }} aria-label="Filter by status">
                                    <option value="all">All status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <button className="btn-activate" onClick={()=> setConfirm({ type:'activate', ids:[...userSelection] })} aria-label="Activate selected">✓ Activate</button>
                                <button className="btn-deactivate" onClick={()=> setConfirm({ type:'deactivate', ids:[...userSelection] })} aria-label="Deactivate selected">✖ Deactivate</button>
                            </div>
                            {userSelection.size > 0 && (
                                <div className="selection-bar" role="region" aria-label="Bulk actions">
                                    <span className="count">{userSelection.size} selected</span>
                                    <button className="btn-activate" onClick={()=> setConfirm({ type:'activate', ids:[...userSelection] })}>✓ Activate</button>
                                    <button className="btn-deactivate" onClick={()=> setConfirm({ type:'deactivate', ids:[...userSelection] })}>✖ Deactivate</button>
                                </div>
                            )}
                            {banner && (
                                <div className={`banner ${banner.type==='error'?'error':''}`}>{banner.message}</div>
                            )}
                <div className="table-wrapper">
                    {usersLoading ? (
                        <p>Loading users...</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                                <th><input type="checkbox" aria-label="Select all" onChange={(e)=>{ if(e.target.checked){ setUserSelection(new Set(pagedUsers.map(u=>u._id||u.id))); } else { setUserSelection(new Set()); } }} /></th>
                                                <th className="sortable" role="button" tabIndex={0} onClick={()=>setUserSort(prev=>({ key:'email', dir: prev.dir==='asc'?'desc':'asc'}))}>User <span className="arrow">{userSort.key==='email' ? (userSort.dir==='asc'?'▲':'▼') : '↕'}</span></th>
                                                <th className="sortable" role="button" tabIndex={0} onClick={()=>setUserSort(prev=>({ key:'score', dir: prev.dir==='asc'?'desc':'asc'}))}>Score <span className="arrow">{userSort.key==='score' ? (userSort.dir==='asc'?'▲':'▼') : '↕'}</span></th>
                                                <th>Role</th>
                                    <th>Status</th>
                                                <th style={{textAlign:'right'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                            {pagedUsers.length === 0 ? (
                                                <tr><td colSpan={4} style={{ textAlign: 'center' }}>No users found.</td></tr>
                                            ) : pagedUsers.map((u) => (
                                    <tr key={u._id || u.id}>
                                                    <td><input type="checkbox" checked={userSelection.has(u._id||u.id)} onChange={(e)=>{ const id=u._id||u.id; setUserSelection(prev=>{ const ns=new Set(prev); if(e.target.checked){ ns.add(id);} else { ns.delete(id);} return ns; }); }} aria-label={`Select ${u.email||u.id}`} /></td>
                                        <td>{u.email || u.id}</td>
                                                    <td className="num">{u.score}</td>
                                                    <td><span className="badge badge-role">{u.role || 'student'}</span></td>
                                        <td>
                                            <span className={u.active ? 'badge-active' : 'badge-inactive'}>
                                                {u.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                                    <td className="action-buttons" style={{justifyContent:'flex-end'}}>
                                            {u.active ? (
                                                            <button className="btn-deactivate" onClick={() => toggleUserActive(u.id, false)}>✖ Deactivate</button>
                                            ) : (
                                                            <button className="btn-activate" onClick={() => toggleUserActive(u.id, true)}>✓ Activate</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                            <div className="table-info">Showing {(userPage-1)*usersPerPage + 1}–{Math.min(userPage*usersPerPage, filteredUsers.length)} of {filteredUsers.length} users</div>
                            <div className="pagination">
                                <button disabled={userPage === 1} onClick={() => setUserPage(p => Math.max(1, p - 1))}>Prev</button>
                                <span>Page {userPage} of {totalUserPages}</span>
                                <button disabled={userPage === totalUserPages} onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}>Next</button>
            </div>
                            {confirm && (
                                <div className="confirm-overlay" role="dialog" aria-modal="true">
                                    <div className="confirm-card">
                                        <div style={{fontWeight:800, marginBottom:8}}>{confirm.type==='activate' ? 'Activate users?' : 'Deactivate users?'}</div>
                                        <div style={{color:'var(--muted)'}}>This will update {confirm.ids.length} selected user(s).</div>
                                        <div className="confirm-actions">
                                            <button className="btn-secondary" onClick={()=> setConfirm(null)}>Cancel</button>
                                            <button className={confirm.type==='activate' ? 'btn-activate' : 'btn-deactivate'} onClick={()=>{
                                                const ids=[...confirm.ids];
                                                let success=0; let total=ids.length;
                                                ids.forEach(id=>{ const u=users.find(x=> (x._id||x.id)===id); if(!u) return; const next = confirm.type==='activate'; toggleUserActive(u.id, next); success++; });
                                                setConfirm(null);
                                                setBanner({ type:'success', message: `${success}/${total} users updated.` });
                                                setTimeout(()=> setBanner(null), 2000);
                                            }}>{confirm.type==='activate' ? 'Activate' : 'Deactivate'}</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {activeSection === 'mentors' && (
                        <section className="table-container new">
                            <div className="table-toolbar" role="region" aria-label="Mentor controls">
                                <input className="input" placeholder="Search mentors" value={mentorQuery} onChange={(e) => { setMentorQuery(e.target.value); setMentorPage(1); }} aria-label="Search mentors" />
                                <select value={mentorStatusFilter} onChange={(e)=>{ setMentorStatusFilter(e.target.value); setMentorPage(1); }} aria-label="Filter by status">
                                    <option value="all">All status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <button className="btn-secondary" onClick={fetchMentors}>Refresh</button>
                            </div>
                            <div className="table-wrapper">
                                {mentorsLoading ? (
                                    <p>Loading mentors...</p>
                                ) : (
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th><input type="checkbox" aria-label="Select all" onChange={(e)=>{ if(e.target.checked){ setMentorSelection(new Set(pagedMentors.map(m=>m._id))); } else { setMentorSelection(new Set()); } }} /></th>
                                                <th className="sortable" role="button" tabIndex={0} onClick={()=>setMentorSort(prev=>({ key:'name', dir: prev.dir==='asc'?'desc':'asc'}))}>Name <span className="arrow">{mentorSort.key==='name' ? (mentorSort.dir==='asc'?'▲':'▼') : '↕'}</span></th>
                                                <th className="sortable" role="button" tabIndex={0} onClick={()=>setMentorSort(prev=>({ key:'email', dir: prev.dir==='asc'?'desc':'asc'}))}>Email <span className="arrow">{mentorSort.key==='email' ? (mentorSort.dir==='asc'?'▲':'▼') : '↕'}</span></th>
                                                <th>Phone</th>
                                                <th>Status</th>
                                                <th>Added</th>
                                                <th style={{textAlign:'right'}}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagedMentors.length === 0 ? (
                                                <tr><td colSpan={7} style={{ textAlign: 'center' }}>No mentors found.</td></tr>
                                            ) : pagedMentors.map((m) => (
                                                <tr key={m._id}>
                                                    <td><input type="checkbox" checked={mentorSelection.has(m._id)} onChange={(e)=>{ const id=m._id; setMentorSelection(prev=>{ const ns=new Set(prev); if(e.target.checked){ ns.add(id);} else { ns.delete(id);} return ns; }); }} aria-label={`Select ${m.email}`} /></td>
                                                    <td>{m.name}</td>
                                                    <td>{m.email}</td>
                                                    <td>{m.phone || '-'}</td>
                                                    <td>
                                                        <span className={`badge ${m.status==='active'?'badge-active':'badge-inactive'}`}>{m.status||'inactive'}</span>
                                                        <select className="inline-status" value={m.status||'inactive'} onChange={(e)=> updateMentorStatus(m._id, e.target.value)}>
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                            <option value="pending">Pending</option>
                                                        </select>
                                                    </td>
                                                    <td>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-'}</td>
                                                    <td className="action-buttons" style={{justifyContent:'flex-end'}}>
                                                        <button className="btn-edit" onClick={()=> alert('Implement mentor edit form as needed')}>Edit</button>
                                                        <button className="btn-delete" onClick={()=> deleteMentor(m._id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="table-info">Showing {(mentorPage-1)*mentorsPerPage + (filteredMentors.length ? 1 : 0)}–{Math.min(mentorPage*mentorsPerPage, filteredMentors.length)} of {filteredMentors.length} mentors</div>
                            <div className="pagination">
                                <button disabled={mentorPage === 1} onClick={() => setMentorPage(p => Math.max(1, p - 1))}>Prev</button>
                                <span>Page {mentorPage} of {totalMentorPages}</span>
                                <button disabled={mentorPage === totalMentorPages} onClick={() => setMentorPage(p => Math.min(totalMentorPages, p + 1))}>Next</button>
                            </div>
                        </section>
                    )}

                    {activeSection === 'interviews' && (
                        <section className="table-container new">
                            <div className="table-toolbar">
                                <input className="input" placeholder="Search interviews" value={interviewQuery} onChange={(e) => { setInterviewQuery(e.target.value); setInterviewPage(1); }} />
                                <button className="btn-primary" onClick={() => { setEditingInterview(null); setShowAddForm(true); }} aria-label="Add interview">+ Add Interview</button>
                            </div>
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Role</th>
                                <th>Questions</th>
                                <th>Type</th>
                                <th>Difficulty</th>
                                <th>Count</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                                        {pagedInterviews.length === 0 ? (
                                            <tr><td colSpan={7} style={{ textAlign: 'center' }}>No interviews found.</td></tr>
                                        ) : pagedInterviews.map((interview) => (
                                <tr key={interview._id}>
                                    <td>{interview.company}</td>
                                    <td>{interview.role}</td>
                                    <td>{interview.questions.length}</td>
                                    <td>{interview.type}</td>
                                    <td>
                                        <span className={`difficulty-badge ${interview.difficulty?.toLowerCase() || 'unknown'}`}>
                                            {interview.difficulty || 'Not Set'}
                                        </span>
                                    </td>
                                    <td>{interview.count || 0}</td>
                                    <td className="action-buttons">
                                                    <button className="btn-edit" onClick={() => handleEdit(interview)}>Edit</button>
                                                    <button className="btn-delete" onClick={() => handleDelete(interview._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                            <div className="pagination">
                                <button disabled={interviewPage === 1} onClick={() => setInterviewPage(p => Math.max(1, p - 1))}>Prev</button>
                                <span>Page {interviewPage} of {totalInterviewPages}</span>
                                <button disabled={interviewPage === totalInterviewPages} onClick={() => setInterviewPage(p => Math.min(totalInterviewPages, p + 1))}>Next</button>
                            </div>
                        </section>
                    )}

                    {activeSection === 'analytics' && (
                        <section className="analytics-only">
                            <div className="charts-grid">
                                <div className="chart-card">
                                    <div className="chart-title">Monthly Activity</div>
                                    <div className="chart-body">
                                        <ResponsiveContainer width="100%" height={320}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} name="New Users" />
                                                <Line type="monotone" dataKey="cumulativeUsers" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} name="Total Users" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{padding: '0 16px 16px'}}>
                                        <button className="btn-primary" onClick={()=>{
                                            const headers=['Month','New Users','Total Users'];
                                            const rows=chartData.map(r=>`${r.name},${r.signups},${r.cumulativeUsers}`).join('\n');
                                            const csv = headers.join(',')+'\n'+rows; const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='analytics.csv'; a.click(); URL.revokeObjectURL(url);
                                        }}>Export CSV</button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}


                    {activeSection === 'contacts' && (
                        <section className="contacts-section">
                            <AdminContacts />
                        </section>
                    )}

                    {activeSection === 'settings' && (
                        <section className="settings-section">
                            <div className="card">
                                <div className="card-header">Appearance</div>
                                <div className="settings-row">
                                    <label>Dark Mode</label>
                                    <button className="btn-primary" onClick={() => setDarkMode(v => !v)}>{darkMode ? 'Disable' : 'Enable'}</button>
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>

            {/* Add/Edit Form Modal */}
            {showAddForm && (
                <div className="modal-overlay" ref={overlayRef} onClick={(e)=>{ if (e.target === overlayRef.current) { setShowAddForm(false); setEditingInterview(null); } }} aria-modal="true" role="dialog">
                    <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingInterview ? 'Edit Interview' : 'Add New Interview'}</h2>
                            <button className="modal-close" onClick={() => { setShowAddForm(false); setEditingInterview(null); }}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="interview-form" key={editingInterview?._id || 'new'}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Company *</label>
                                    <input ref={companyInputRef} type="text" name="company" value={formData.company} onChange={handleInputChange} required placeholder="Enter company name" className={errors.company ? 'error' : ''} maxLength={100} />
                                    {errors.company && <span className="error-message">{errors.company}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Role *</label>
                                    <input type="text" name="role" value={formData.role} onChange={handleInputChange} required placeholder="Enter role/position" className={errors.role ? 'error' : ''} maxLength={100} />
                                    {errors.role && <span className="error-message">{errors.role}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type *</label>
                                    <select name="type" value={formData.type || ''} onChange={handleInputChange} required className={errors.type ? 'error' : ''}>
                                        <option value="">Select type</option>
                                        <option value="Algorithms & Systems">Algorithms & Systems</option>
                                        <option value="DBMS">DBMS</option>
                                        <option value="Operating System">Operating System</option>
                                        <option value="System Software">System Software</option>
                                        <option value="Computer Networks">Computer Networks</option>
                                        <option value="HR">HR</option>
                                        <option value="Data Structures">Data Structures</option>
                                        <option value="Programming">Programming</option>
                                        <option value="Software Engineering">Software Engineering</option>
                                    </select>
                                    {errors.type && <span className="error-message">{errors.type}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Difficulty Level *</label>
                                    <select name="difficulty" value={formData.difficulty || ''} onChange={handleInputChange} required className={errors.difficulty ? 'error' : ''}>
                                        <option value="">Select difficulty</option>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                    {errors.difficulty && <span className="error-message">{errors.difficulty}</span>}
                                </div>
                            </div>

                            <div className="questions-section">
                                <h3>Questions ({formData.questions.length}/10 minimum) {formData.questions.length >= 50 && <span className="max-reached">(Maximum reached)</span>}</h3>
                                {errors.questions && <span className="error-message">{errors.questions}</span>}
                                
                                <div className="question-inputs">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Question *</label>
                                            <input type="text" name="question" value={currentQuestion.question} onChange={handleQuestionChange} placeholder="Enter meaningful question (min 15 chars, must end with ?)" className={errors.question ? 'error' : ''} maxLength={500} />
                                            {errors.question && <span className="error-message">{errors.question}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Answer *</label>
                                            <input type="text" name="answer" value={currentQuestion.answer} onChange={handleQuestionChange} placeholder="Enter answer (min 3 characters)" className={errors.answer ? 'error' : ''} maxLength={1000} />
                                            {errors.answer && <span className="error-message">{errors.answer}</span>}
                                        </div>
                                        <button type="button" className="btn-add-question" onClick={addQuestion} disabled={formData.questions.length >= 50}>
                                            Add Question
                                        </button>
                                    </div>
                                </div>

                                <div className="questions-list">
                                    {formData.questions.map((q, index) => (
                                        <div key={index} className="question-item">
                                            {editingQuestionIndex === index ? (
                                                <div className="edit-question-form">
                                                    <div className="question-number-badge">Question {index + 1}</div>
                                                    <div className="edit-question-inputs">
                                                        <input type="text" value={editingQuestion.question} onChange={(e) => setEditingQuestion(prev => ({ ...prev, question: e.target.value }))} placeholder="Enter question" className="edit-question-input" />
                                                        <textarea value={editingQuestion.answer} onChange={(e) => setEditingQuestion(prev => ({ ...prev, answer: e.target.value }))} placeholder="Enter answer" className="edit-answer-input" rows="3" />
                                                    </div>
                                                    <div className="edit-question-actions">
                                                        <button type="button" className="btn-save-question" onClick={saveEditQuestion}>Save</button>
                                                        <button type="button" className="btn-cancel-question" onClick={cancelEditQuestion}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="question-number-badge">Question {index + 1}</div>
                                                    <div className="question-content">
                                                        <div className="question-text">{q.question}</div>
                                                        <div className="answer-text">{q.answer}</div>
                                                    </div>
                                                    <div className="question-actions">
                                                        <button type="button" className="btn-edit-question" onClick={() => startEditQuestion(index)} title="Edit question">✏️</button>
                                                        <button type="button" className="btn-remove-question" onClick={() => removeQuestion(index)} title="Delete question">×</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {submitMessage && (
                                <div className={`submit-message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>{submitMessage}</div>
                            )}
                            
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => { setShowAddForm(false); setEditingInterview(null); }} disabled={isSubmitting}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Processing...' : (editingInterview ? 'Update Interview' : 'Create Interview')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Mentor Form Modal */}
            {showMentorForm && (
                <div className="modal-overlay" ref={overlayRef} onClick={(e)=>{ if (e.target === overlayRef.current) { setShowMentorForm(false); } }} aria-modal="true" role="dialog">
                    <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Mentor</h2>
                            <button className="modal-close" onClick={() => { setShowMentorForm(false); }}>×</button>
                        </div>
                        
                        <form onSubmit={handleMentorSubmit} className="interview-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={mentorFormData.name} 
                                        onChange={handleMentorInputChange} 
                                        required 
                                        placeholder="Enter mentor's full name" 
                                        className={mentorErrors.name ? 'error' : ''} 
                                        maxLength={100} 
                                    />
                                    {mentorErrors.name && <span className="error-message">{mentorErrors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={mentorFormData.email} 
                                        onChange={handleMentorInputChange} 
                                        required 
                                        placeholder="Enter mentor's email address" 
                                        className={mentorErrors.email ? 'error' : ''} 
                                    />
                                    {mentorErrors.email && <span className="error-message">{mentorErrors.email}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        value={mentorFormData.phone} 
                                        onChange={handleMentorInputChange} 
                                        placeholder="Enter phone number" 
                                        className={mentorErrors.phone ? 'error' : ''} 
                                    />
                                    {mentorErrors.phone && <span className="error-message">{mentorErrors.phone}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    name="description" 
                                    value={mentorFormData.description} 
                                    onChange={handleMentorInputChange} 
                                    placeholder="Brief description about the mentor" 
                                    className={mentorErrors.description ? 'error' : ''} 
                                    rows="4"
                                    maxLength={500}
                                />
                                {mentorErrors.description && <span className="error-message">{mentorErrors.description}</span>}
                                <div className="char-count">{mentorFormData.description.length}/500 characters</div>
                            </div>

                            {mentorSubmitMessage && (
                                <div className={`submit-message ${mentorSubmitMessage.includes('successfully') ? 'success' : 'error'}`}>{mentorSubmitMessage}</div>
                            )}
                            
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => { setShowMentorForm(false); }} disabled={isMentorSubmitting}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={isMentorSubmitting}>{isMentorSubmitting ? 'Adding Mentor...' : 'Add Mentor'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Add Interview button */}
            <button className="fab-add" onClick={()=>{ setEditingInterview(null); setShowAddForm(true); }} aria-label="Add interview">
                +
            </button>
        </div>
    );
};

export default Admin;


