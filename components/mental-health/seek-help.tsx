'use client'

interface HelpItem {
  name: string
  desc: string
  url: string
  number?: string
}

const CRISIS: HelpItem[] = [
  { name: '香港警務處 — 緊急求助', number: '999', desc: '如遇緊急情況，請立即致電999報警', url: 'https://www.police.gov.hk' },
  { name: '醫院管理局 — 精神健康專線', number: '2466 7350', desc: '24小時精神健康支援熱線：2466 7350（24小時）', url: 'https://www.ha.org.hk/visitor/ha_visitor_index.asp?Content_ID=214962' },
  { name: '精神健康支援熱線', number: '18111', desc: '24小時一站式精神健康支援熱線，為有需要人士即時提供支援及轉介服務', url: 'https://www.shallwetalk.hk' },
  { name: '撒瑪利亞防止自殺會', number: '2389 2222', desc: '24小時情緒支援熱線，提供防止自殺服務', url: 'https://sbhk.org.hk' },
  { name: '香港撒瑪利亞會', number: '2896 0000', desc: '24小時多語言防止自殺熱線,提供情緒支援', url: 'https://samaritans.org.hk' },
  { name: '生命熱線', number: '2382 0000', desc: '24小時防止自殺熱線，為有自殺傾向、絕望及情緒受困擾的人士提供支援', url: 'https://www.spsfamily.org.hk' },
  { name: '明愛向晴熱線', number: '18288', desc: '24小時危機支援熱線，為面對家庭及個人危機人士提供即時電話輔導', url: 'https://fcec.caritas.org.hk' },
  { name: 'CEASE Crisis Centre', number: '18281', desc: '24小時危機支援熱線，為受困擾或自殺風險人士提供即時協助', url: 'https://ceasecrisis.com.hk' },
]

const DIAGNOSIS: HelpItem[] = [
  { name: 'Mind HK — 心理健康資訊及評估', desc: '提供心理健康篩查、資訊及支援服務。AI聊天機器人Help Me 24/7提供即時協助', url: 'https://www.mind.org.hk' },
  { name: '醫院管理局精神科服務', desc: '公立醫院精神科門診服務，提供專業診斷及治療。可經普通科醫生轉介', url: 'https://www.ha.org.hk/visitor/ha_visitor_index.asp?Content_ID=214962' },
  { name: '香港心理衛生會', desc: '提供心理健康教育、評估及輔導服務。設有精神健康綜合社區中心', url: 'https://www.mhahk.org.hk' },
  { name: 'SoTA 心理健康評估', desc: '免費匿名網上心理健康篩查工具，幫助了解個人精神健康狀況', url: 'https://sota.hk' },
]

const SOCIAL_WORKERS: HelpItem[] = [
  { name: '社會福利署 — 綜合家庭服務中心', desc: '為個人及家庭提供輔導、支援及轉介服務，全港各區均設有中心', url: 'https://www.swd.gov.hk/tc/pubsvc/family/' },
  { name: '精神健康綜合社區中心 (ICCMW)', desc: '為15歲以上精神病康復者及懷疑有精神健康問題人士提供一站式社區支援', url: 'https://www.swd.gov.hk/tc/pubsvc/rehab/cat_supportcom/centrebase/iccmw/' },
  { name: '香港明愛 — 家庭服務', desc: '提供專業社會工作服務，包括家庭輔導、心理支援及危機介入', url: 'https://www.caritas.org.hk' },
  { name: '東華三院社會服務', desc: '提供綜合家庭服務、青少年支援、長者服務及心理健康輔導', url: 'https://www.tungwah.org.hk' },
  { name: '香港小童群益會', desc: '為兒童、青少年及家庭提供心理輔導及支援服務', url: 'https://www.bgca.org.hk' },
]

const CLINICS: HelpItem[] = [
  { name: '醫管局精神科門診', desc: '公立精神科專科門診，需經普通科醫生轉介。收費低廉，各區均有服務', url: 'https://www.ha.org.hk/visitor/ha_visitor_index.asp?Content_ID=10086' },
  { name: '香港精神科醫學院 — 尋醫指引', desc: '香港精神科醫學院提供的私人精神科醫生名單及搜尋服務', url: 'https://www.hkcpsych.org.hk' },
  { name: '香港心理學會 — 臨床心理學家名冊', desc: '搜尋註冊臨床心理學家，提供心理評估及心理治療服務', url: 'https://www.hkps.org.hk' },
  { name: 'OpenUp — 網上心理輔導', desc: '為香港人提供免費網上心理輔導服務，由註冊心理學家提供支援', url: 'https://www.openup.hk' },
  { name: 'PsyHELP 心理服務地圖', desc: '搜尋香港各區的心理輔導及精神科服務機構', url: 'https://www.psyhelp.org.hk' },
]

const SECTIONS = [
  { id: 'crisis', title: '🚨 緊急支援熱線', icon: '🚨', items: CRISIS },
  { id: 'diagnosis', title: '🩺 診斷及評估服務', icon: '🩺', items: DIAGNOSIS },
  { id: 'social', title: '🤝 社工及社區支援', icon: '🤝', items: SOCIAL_WORKERS },
  { id: 'clinics', title: '🏥 精神科診所及輔導', icon: '🏥', items: CLINICS },
]

export function SeekHelp() {
  return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <p className="text-xs text-surface-400">
          為你整理的香港精神健康資源。如有緊急需要，請立即致電 999 或 18111—支援 24/7 提供。
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
        <p className="text-[10px] text-amber-300 font-medium">需要更多支援？</p>
        <p className="text-[9px] text-amber-400/70 mt-0.5">
          瀏覽 <a href="https://www.mind.org.hk/find-help-now/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">Mind HK 即時求助</a> 獲取更多心理健康資源
        </p>
      </div>
    </div>
  )
}
