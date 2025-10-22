import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from "axios"
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent"
import { Assessment, Schedule, Business, Work } from '@mui/icons-material'
import "./PreInterview.css"
const PreInterview = () => {
  const { id } = useParams()
  const [details, setDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [micPermission, setMicPermission] = useState('unknown')
  
  const [micLevel, setMicLevel] = useState(0)
  const [micDevices, setMicDevices] = useState([])
  const [selectedMicId, setSelectedMicId] = useState('')
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const rafRef = useRef(null)
  const micStreamRef = useRef(null)
  const [isMicTesting, setIsMicTesting] = useState(false)
  
  
  const [latencyMs, setLatencyMs] = useState(null)
  const [downloadMbps, setDownloadMbps] = useState(null)
  const [networkTesting, setNetworkTesting] = useState(false)

  useEffect(() => {
    document.title = 'Interview Setup'
    axios.get(`/interview/${id}`)
      .then(response => {
        setDetails(response.data || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const questionCount = details?.questions?.length || 0
  const topics = useMemo(() => {
    const set = new Set((details?.questions || []).map(q => q?.type).filter(Boolean))
    if (set.size === 0 && details?.type) set.add(details.type)
    return Array.from(set)
  }, [details])

  useEffect(() => {
    // Permissions pre-checks
    let permissionAbort = false
    const checkPermissions = async () => {
      try {
        if (navigator.permissions?.query) {
          try {
            const micPerm = await navigator.permissions.query({ name: 'microphone' })
            if (!permissionAbort) setMicPermission(micPerm.state === 'granted' ? 'granted' : micPerm.state === 'denied' ? 'denied' : 'prompt')
            micPerm.onchange = () => {
              if (!permissionAbort) setMicPermission(micPerm.state === 'granted' ? 'granted' : micPerm.state === 'denied' ? 'denied' : 'prompt')
            }
          } catch (_) {}
          // Camera test removed; skip camera permission management
          try { await navigator.permissions.query({ name: 'camera' }) } catch (_) {}
        }
      } catch (_) {}
    }
    checkPermissions()

    const updateMicDevices = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter(d => d.kind === 'audioinput')
        setMicDevices(audioInputs)
        if (!selectedMicId && audioInputs.length > 0) {
          setSelectedMicId(audioInputs[0].deviceId)
        }
      } catch (_) {}
    }

    updateMicDevices()
    if (navigator.mediaDevices && 'ondevicechange' in navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', updateMicDevices)
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', updateMicDevices)
        permissionAbort = true
      }
    }
  }, [selectedMicId])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (audioContextRef.current) {
        try { audioContextRef.current.close() } catch (_) {}
      }
      if (micStreamRef.current) {
        try { micStreamRef.current.getTracks().forEach(t => t.stop()) } catch (_) {}
      }
    }
  }, [])

  return (
    <>
      {loading ? (
        <LoadingComponent />
      ) : (
        <div className='pre-container'>
          <div className='pre-header'>
            <h1>Interview Setup</h1>
            <p className='setup-subtitle'>Prepare for your AI-powered interview experience</p>
          </div>
          <div className='pre-content'>
            <div className='preview-top'>
              <div className='preview-title'>
                <div className='preview-company'>
                  <div className='company-logo'><Business /></div>
                  <div className='company-details'>
                    <h2>{details.company || 'Company'}</h2>
                    <p className='role-title'><Work /> {details.role || 'Role'}</p>
                    <div className={`difficulty-badge ${(details.difficulty || 'Medium').toLowerCase()}`}>
                      <span>{details.difficulty || 'Medium'}</span>
                    </div>
                  </div>
                </div>
                <div className='preview-stats'>
                  <div className='stat-card'>
                    <div className='stat-icon'>
                      <Assessment />
                    </div>
                    <div className='stat-content'>
                      <span className='stat-number'>{questionCount}</span>
                      <span className='stat-label'>Questions</span>
                    </div>
                  </div>
                  <div className='stat-card'>
                    <div className='stat-icon'>
                      <Schedule />
                    </div>
                    <div className='stat-content'>
                      <span className='stat-number'>15-20</span>
                      <span className='stat-label'>Minutes</span>
                    </div>
                  </div>
                </div>
              </div>
              {topics.length > 0 && (
                <div className='topics-section'>
                  <h4>Topics Covered</h4>
                  <div className='topics-wrapper'>
                    {topics.map(t => (
                      <span key={t} className='topic-chip'>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className='pre-instructions'>
              <div className='instructions-header'>
                <h3>📋 Instructions</h3>
                <p>Follow these steps to ensure a smooth interview experience</p>
              </div>
              <div className='instructions-grid'>
                <div className='instruction-item'>
                  <div className='instruction-icon'>🏠</div>
                  <div className='instruction-content'>
                    <h4>Find a Quiet Space</h4>
                    <p>Choose a quiet room with minimal background noise and ensure a stable internet connection.</p>
                  </div>
                </div>
                <div className='instruction-item'>
                  <div className='instruction-icon'>🎤</div>
                  <div className='instruction-content'>
                    <h4>Test Your Equipment</h4>
                    <p>Test your microphone and speakers before starting to ensure clear audio quality.</p>
                  </div>
                </div>
                <div className='instruction-item'>
                  <div className='instruction-icon'>⏱️</div>
                  <div className='instruction-content'>
                    <h4>Time Management</h4>
                    <p>Questions are time-boxed. Speak clearly and concisely within the given time limit.</p>
                  </div>
                </div>
                <div className='instruction-item'>
                  <div className='instruction-icon'>⚠️</div>
                  <div className='instruction-content'>
                    <h4>No Going Back</h4>
                    <p>You cannot return to previous questions after submitting your answer.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='mic-test'>
              <div className='test-header'>
                <h3>🎤 Microphone Check</h3>
                <p>Ensure your microphone is working properly before starting the interview</p>
              </div>
              <div className='mic-status'>
                <div className={`status-indicator ${micPermission === 'granted' ? 'success' : micPermission === 'denied' ? 'error' : 'pending'}`}>
                  <div className='status-dot'></div>
                  <span>
                    {micPermission === 'denied' ? 'Permission denied — allow microphone access in your browser settings.' : 
                     isMicTesting ? 'Listening — speak at a normal volume.' : 
                     micPermission === 'granted' ? 'Microphone ready' : 
                     'Click Start Test to grant permission'}
                  </span>
                </div>
              </div>
              {micDevices.length > 0 && (
                <div className='mic-device-select'>
                  <label htmlFor='mic-device'>Select microphone:</label>
                  <select id='mic-device' value={selectedMicId} onChange={e => setSelectedMicId(e.target.value)}>
                    {micDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className='mic-level-bar' aria-label='Microphone input level'>
                <div className='mic-level-fill' style={{width: `${Math.min(100, Math.round(micLevel*100))}%`}}></div>
              </div>
              <div style={{marginTop: '4px', fontSize: '0.9rem', color: '#556'}}>
                Input level: {Math.min(100, Math.round(micLevel*100))}%
              </div>
              <div className='mic-actions'>
                <button className='btn-secondary-large' disabled={isMicTesting} onClick={async () => {
                  try {
                    if (micStreamRef.current) {
                      micStreamRef.current.getTracks().forEach(t => t.stop())
                      micStreamRef.current = null
                    }
                    const stream = await navigator.mediaDevices.getUserMedia({
                      audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true
                    })
                    micStreamRef.current = stream
                    setMicPermission('granted')
                    setIsMicTesting(true)
                    if (!audioContextRef.current) {
                      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
                    }
                    const audioCtx = audioContextRef.current
                    const source = audioCtx.createMediaStreamSource(stream)
                    const analyser = audioCtx.createAnalyser()
                    analyser.fftSize = 512
                    source.connect(analyser)
                    analyserRef.current = analyser
                    const dataArray = new Uint8Array(analyser.frequencyBinCount)
                    const tick = () => {
                      analyser.getByteTimeDomainData(dataArray)
                      let sum = 0
                      for (let i = 0; i < dataArray.length; i++) {
                        const v = (dataArray[i] - 128) / 128
                        sum += v * v
                      }
                      const rms = Math.sqrt(sum / dataArray.length)
                      setMicLevel(rms)
                      rafRef.current = requestAnimationFrame(tick)
                    }
                    if (rafRef.current) cancelAnimationFrame(rafRef.current)
                    tick()
                    // Refresh device labels after permission grant
                    try { await navigator.mediaDevices.enumerateDevices().then(ds => setMicDevices(ds.filter(d => d.kind === 'audioinput'))) } catch (_) {}
                  } catch (e) {
                    console.log(e)
                    setMicPermission('denied')
                    setIsMicTesting(false)
                  }
                }}>Start Test</button>
                <button className='btn-secondary-large' disabled={!isMicTesting} onClick={() => {
                  if (rafRef.current) cancelAnimationFrame(rafRef.current)
                  setMicLevel(0)
                  if (micStreamRef.current) {
                    micStreamRef.current.getTracks().forEach(t => t.stop())
                    micStreamRef.current = null
                  }
                  setIsMicTesting(false)
                }}>Stop</button>
              </div>
              
            </div>

            

            <div className='network-test'>
              <div className='test-header'>
                <h3>🌐 Network Check</h3>
                <p>Verify your internet connection is stable for the interview</p>
              </div>
              <div className='network-metrics'>
                <div className='metric-item'>
                  <div className='metric-label'>Latency</div>
                  <div className='metric-value'>{latencyMs == null ? '—' : `${latencyMs} ms`}</div>
                </div>
                <div className='metric-item'>
                  <div className='metric-label'>Download Speed</div>
                  <div className='metric-value'>{downloadMbps == null ? '—' : `${downloadMbps} Mbps`}</div>
                </div>
              </div>
              <button className='btn-secondary-large' disabled={networkTesting} onClick={async () => {
                setNetworkTesting(true)
                try {
                  
                  const pingUrl = '/ping?_=' + Date.now()
                  const t0 = performance.now()
                  await fetch(pingUrl, { cache: 'no-store' })
                  const t1 = performance.now()
                  setLatencyMs(Math.max(0, Math.round(t1 - t0)))

                  // crude download test using a public-sized file or fallback to ping multiple times
                  const sizeBytes = 2 * 1024 * 1024 // 2MB
                  const downloadUrl = `/download-test?size=${sizeBytes}&_=${Date.now()}`
                  const d0 = performance.now()
                  const res = await fetch(downloadUrl, { cache: 'no-store' })
                  const blob = await res.blob()
                  const d1 = performance.now()
                  const seconds = (d1 - d0) / 1000
                  const mbps = seconds > 0 ? (blob.size * 8) / (seconds * 1_000_000) : null
                  setDownloadMbps(mbps == null ? null : Math.max(0, Math.round(mbps * 10) / 10))
                } catch (_) {
                  setLatencyMs(null)
                  setDownloadMbps(null)
                } finally {
                  setNetworkTesting(false)
                }
              }}>Run Test</button>
            </div>

            <div className='pre-actions'>
              <div className='action-buttons'>
                <Link className='btn-primary-large' to={`/interview/${id}/start`}>
                  <span className='btn-icon'>🚀</span>
                  Start Interview
                </Link>
                <Link className='btn-secondary-large' to='/home'>
                  <span className='btn-icon'>←</span>
                  Back to Home
                </Link>
              </div>
              <div className='action-note'>
                <p>💡 Make sure to complete all tests above before starting your interview</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PreInterview
