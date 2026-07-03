'use client'

interface HelpItem {
  name: string
  desc: string
  url: string
  number?: string
}

const CRISIS: HelpItem[] = [
  { name: 'Hong Kong Police — Emergency', number: '999', desc: 'For life-threatening emergencies, call 999 immediately', url: 'https://www.police.gov.hk' },
  { name: 'Mental Health Support Hotline', number: '18111', desc: '24-hour one-stop mental health support hotline — immediate support and referral', url: 'https://www.shallwetalk.hk' },
  { name: 'The Samaritan Befrienders HK', number: '2389 2222', desc: '24-hour emotional support hotline — suicide prevention services', url: 'https://sbhk.org.hk' },
  { name: 'The Samaritans Hong Kong', number: '2896 0000', desc: '24-hour multilingual suicide prevention hotline — confidential emotional support', url: 'https://samaritans.org.hk' },
  { name: 'Suicide Prevention Services (SPS)', number: '2382 0000', desc: '24-hour suicide prevention hotline for those in emotional distress', url: 'https://www.spsfamily.org.hk' },
  { name: 'Caritas Crisis Hotline', number: '18288', desc: '24-hour crisis support hotline — immediate phone counselling for personal and family crises', url: 'https://fcec.caritas.org.hk' },
  { name: 'CEASE Crisis Centre', number: '18281', desc: '24-hour crisis support hotline for those in distress or at risk of suicide', url: 'https://ceasecrisis.com.hk' },
  { name: 'HA Mental Health Hotline', number: '2466 7350', desc: 'Hospital Authority 24-hour mental health support hotline', url: 'https://www.ha.org.hk/visitor/ha_visitor_index.asp?Content_ID=214962' },
]

const DIAGNOSIS: HelpItem[] = [
  { name: 'Mind HK — Mental Health Information & Screening', desc: 'Free mental health screening, information, and support. AI assistant Help Me available 24/7', url: 'https://www.mind.org.hk' },
  { name: 'Hospital Authority Psychiatric Services', desc: 'Public hospital psychiatric outpatient services — professional diagnosis and treatment via GP referral', url: 'https://www.ha.org.hk/visitor/ha_visitor_index.asp?Content_ID=214962' },
  { name: 'Mental Health Association of Hong Kong', desc: 'Mental health education, assessment and counselling services with community centres', url: 'https://www.mhahk.org.hk' },
  { name: 'SoTA Online Mental Health Screening', desc: 'Free anonymous online mental health screening tools to understand your wellbeing', url: 'https://sota.hk' },
]

const SOCIAL_WORKERS: HelpItem[] = [
  { name: 'Social Welfare Department — IFSCs', desc: 'Integrated Family Service Centres offering counselling, support and referral — all districts', url: 'https://www.swd.gov.hk/en/pubsvc/family/' },
  { name: 'ICCMW — Community Mental Wellness Centres', desc: 'Integrated Community Centres for Mental Wellness — one-stop support for ages 15+', url: 'https://www.swd.gov.hk/en/pubsvc/rehab/cat_supportcom/centrebase/iccmw/' },
  { name: 'Caritas Hong Kong — Family Services', desc: 'Professional social work services including family counselling, psychological support and crisis intervention', url: 'https://www.caritas.org.hk' },
  { name: 'Tung Wah Group of Hospitals', desc: 'Integrated family services, youth support, elderly services and mental health counselling', url: 'https://www.tungwah.org.hk' },
  { name: 'Boys\' and Girls\' Clubs Association', desc: 'Psychological counselling and support services for children, youth and families', url: 'https://www.bgca.org.hk' },
]

const CLINICS: HelpItem[] = [
  { name: 'HA Psychiatric Outpatient Clinics', desc: 'Public psychiatric specialist clinics — affordable, available across districts, GP referral needed', url: 'https://www.ha.org.hk/visitor/ha_visitor_index.asp?Content_ID=10086' },
  { name: 'HK College of Psychiatrists — Find a Doctor', desc: 'Directory of private psychiatrists in Hong Kong', url: 'https://www.hkcpsych.org.hk' },
  { name: 'HK Psychological Society — Psychologist Register', desc: 'Find registered clinical psychologists for assessment and therapy', url: 'https://www.hkps.org.hk' },
  { name: 'OpenUp — Online Counselling', desc: 'Free online psychological counselling for Hong Kong residents — sessions with registered psychologists', url: 'https://www.openup.hk' },
  { name: 'PsyHELP — Mental Health Service Map', desc: 'Search for counselling and psychiatric services across Hong Kong districts', url: 'https://www.psyhelp.org.hk' },
]

const SECTIONS = [
  { id: 'crisis', title: '🚨 Crisis Hotlines', icon: '🚨', items: CRISIS },
  { id: 'diagnosis', title: '🩺 Diagnosis & Assessment', icon: '🩺', items: DIAGNOSIS },
  { id: 'social', title: '🤝 Social Workers & Community Support', icon: '🤝', items: SOCIAL_WORKERS },
  { id: 'clinics', title: '🏥 Psychiatrist Clinics & Counselling', icon: '🏥', items: CLINICS },
]

export function SeekHelp() {
  return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <p className="text-xs text-surface-400">
          Curated Hong Kong mental health resources. In an emergency, call <strong>999</strong> or <strong>18111</strong> — support available 24/7.
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
        <p className="text-[10px] text-amber-300 font-medium">Need more support?</p>
        <p className="text-[9px] text-amber-400/70 mt-0.5">
          Visit <a href="https://www.mind.org.hk/find-help-now/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">Mind HK Find Help Now</a> for more resources
        </p>
      </div>
    </div>
  )
}
