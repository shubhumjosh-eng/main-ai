'use client'

interface HelpItem {
  name: string
  desc: string
  url: string
  number?: string
}

const CRISIS: HelpItem[] = [
  { name: '988 Suicide & Crisis Lifeline', number: '988', desc: '24/7 free, confidential support for distress, suicidal thoughts, or mental health crises', url: 'https://988lifeline.org' },
  { name: 'Crisis Text Line', number: '741741', desc: 'Text HOME to connect with a crisis counselor — free, 24/7', url: 'https://crisistextline.org' },
  { name: 'SAMHSA Helpline', number: '1-800-662-4357', desc: 'Free referrals and information — 24/7 treatment and support', url: 'https://samhsa.gov/find-help/national-helpline' },
  { name: 'National Alliance on Mental Illness', number: '1-800-950-6264', desc: 'NAMI helpline for mental health questions, Mon–Fri 10am–10pm ET', url: 'https://nami.org/help' },
]

const DIAGNOSIS: HelpItem[] = [
  { name: 'Mental Health America Screening', desc: 'Free, anonymous, clinically-validated mental health screening tools', url: 'https://mhascreening.org' },
  { name: 'Psychology Today Therapist Finder', desc: 'Search licensed therapists, psychiatrists, and clinics by location and insurance', url: 'https://psychologytoday.com/us/therapists' },
  { name: 'ADAA Find a Therapist', desc: 'Anxiety & Depression Association of America — search for specialized providers', url: 'https://adaa.org/find-a-therapist' },
  { name: 'Open Path Collective', desc: 'Affordable therapy ($30–$70/session) with licensed clinicians nationwide', url: 'https://openpathcollective.org' },
]

const SOCIAL_WORKERS: HelpItem[] = [
  { name: 'NASW Therapist Finder', desc: 'National Association of Social Workers — find licensed clinical social workers', url: 'https://socialworkers.org/Careers/NASW-Therapist-Finder' },
  { name: 'Clinical Social Work Association', desc: 'Directory of licensed clinical social workers and resources', url: 'https://clinicalsocialworkassociation.org' },
  { name: '211.org', desc: 'Connect with local social services, crisis support, and community resources', url: 'https://211.org' },
  { name: 'Benefits.gov', desc: 'Find government assistance programs for mental health and social services', url: 'https://benefits.gov' },
]

const CLINICS: HelpItem[] = [
  { name: 'Find a Psychiatrist — APA', desc: 'American Psychiatric Association — search by location, insurance, specialty', url: 'https://finder.psychiatry.org' },
  { name: 'SAMHSA Treatment Locator', desc: 'Find mental health and substance use treatment facilities nationwide', url: 'https://findtreatment.samhsa.gov' },
  { name: 'Headway', desc: 'Find in-network psychiatrists and therapists — insurance accepted', url: 'https://headway.co' },
  { name: 'Zocdoc', desc: 'Search psychiatrists by availability, insurance, and reviews — book online', url: 'https://zocdoc.com/psychiatrists' },
]

const SECTIONS = [
  { id: 'crisis', title: '🚨 Crisis Hotlines', icon: '🚨', items: CRISIS },
  { id: 'diagnosis', title: '🩺 Professional Diagnosis & Screening', icon: '🩺', items: DIAGNOSIS },
  { id: 'social', title: '🤝 Social Workers & Support', icon: '🤝', items: SOCIAL_WORKERS },
  { id: 'clinics', title: '🏥 Psychiatrist Clinics', icon: '🏥', items: CLINICS },
]

export function SeekHelp() {
  return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <p className="text-xs text-surface-400">
          Curated resources for professional mental health support. If you're in crisis, reach out now — help is available 24/7.
        </p>
      </div>

      {SECTIONS.map(section => (
        <div key={section.id}>
          <h3 className="text-xs font-semibold text-surface-200 mb-2 flex items-center gap-1.5">
            <span>{section.icon}</span>
            {section.title}
          </h3>
          <div className="space-y-1.5">
            {section.items.map(item => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-xl bg-surface-900/40 border border-surface-800/50 hover:bg-surface-800/50 hover:border-surface-700 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-surface-200 group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-surface-500 mt-0.5">{item.desc}</p>
                    {item.number && (
                      <p className="text-[11px] font-semibold text-cyan-400 mt-1 tracking-wide">
                        {item.number}
                      </p>
                    )}
                  </div>
                  <span className="text-surface-600 group-hover:text-surface-400 shrink-0 text-[10px]">↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}

      <div className="p-3 rounded-xl bg-amber-900/20 border border-amber-800/30 text-center">
        <p className="text-[10px] text-amber-300 font-medium">Not in the US?</p>
        <p className="text-[9px] text-amber-400/70 mt-0.5">
          Find your local crisis line at <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">findahelpline.com</a>
        </p>
      </div>
    </div>
  )
}
