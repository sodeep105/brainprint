import { useState } from 'react'
import Landing from './components/Landing.jsx'
import MicroTasks from './components/MicroTasks.jsx'
import ProfileCard from './components/ProfileCard.jsx'
import Transformer from './components/Transformer.jsx'

export default function App() {
  const [screen, setScreen] = useState('landing') // 'landing' | 'tasks' | 'profile' | 'transformer'
  const [profile, setProfile] = useState(null)
  const [analogyDomain, setAnalogyDomain] = useState(null)

  function handleTasksComplete(profileData) {
    setProfile(profileData)
    setScreen('profile')
  }

  function handleGoTransformer(domain) {
    setAnalogyDomain(domain)
    setScreen('transformer')
  }

  function handleRetake() {
    setProfile(null)
    setAnalogyDomain(null)
    setScreen('tasks')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      {screen === 'landing' && (
        <Landing onStart={() => setScreen('tasks')} />
      )}
      {screen === 'tasks' && (
        <MicroTasks onComplete={handleTasksComplete} />
      )}
      {screen === 'profile' && profile && (
        <ProfileCard profile={profile} onContinue={handleGoTransformer} onRetake={handleRetake} />
      )}
      {screen === 'transformer' && profile && (
        <Transformer profile={profile} analogyDomain={analogyDomain} onBack={() => setScreen('profile')} />
      )}
    </div>
  )
}
