import Head from 'next/head'
import * as React from 'react'
import styles from '../styles/legal.module.css'

export default function Cookies() {
  return (
    <>
      <Head>
        <title>Cookie-Richtlinie - Learn German Grammar</title>
        <meta name="description" content="Informationen über die Verwendung von Cookies auf dieser Website" />
      </Head>
      <div className={styles.legalContainer}>
        <div className={styles.legalContent}>
          <h1>Cookie-Richtlinie</h1>
          
          <h2>Was sind Cookies?</h2>
          <p>
            Cookies sind kleine Textdateien, die auf Ihrem Endgerät (Computer, Tablet oder Smartphone) 
            gespeichert werden, wenn Sie eine Website besuchen. Sie dienen dazu, die Website funktionsfähig 
            zu machen, die Benutzererfahrung zu verbessern und Informationen über die Nutzung der Website 
            zu sammeln.
          </p>

          <h2>Welche Arten von Cookies verwenden wir?</h2>
          
          <h3>1. Technisch notwendige Cookies</h3>
          <p>
            Diese Cookies sind für den Betrieb der Website unbedingt erforderlich und ermöglichen 
            grundlegende Funktionen wie die Navigation auf der Seite. Die Website kann ohne diese 
            Cookies nicht ordnungsgemäß funktionieren.
          </p>
          <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</p>
          <p><strong>Speicherdauer:</strong> Session oder bis zu 12 Monate</p>

          <h3>2. Analyse- und Performance-Cookies</h3>
          <p>
            Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, 
            indem Informationen anonym gesammelt und gemeldet werden. Dies ermöglicht es uns, die 
            Website zu verbessern und die Benutzererfahrung zu optimieren.
          </p>
          <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) oder lit. f DSGVO (berechtigtes Interesse)</p>
          <p><strong>Speicherdauer:</strong> Bis zu 24 Monate</p>

          <h2>Cookies von Drittanbietern</h2>
          
          <h3>Google Analytics (GA4)</h3>
          <p>
            Wir verwenden Google Analytics, einen Webanalysedienst von Google Ireland Limited. 
            Google Analytics verwendet Cookies, um die Nutzung der Website zu analysieren.
          </p>
          <p><strong>Anbieter:</strong> Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland</p>
          <p><strong>Gesetzte Cookies:</strong></p>
          <ul>
            <li><strong>_ga:</strong> Wird verwendet, um Benutzer zu unterscheiden (Speicherdauer: 2 Jahre)</li>
            <li><strong>_ga_[container-id]:</strong> Wird verwendet, um den Sitzungsstatus beizubehalten (Speicherdauer: 2 Jahre)</li>
            <li><strong>_gid:</strong> Wird verwendet, um Benutzer zu unterscheiden (Speicherdauer: 24 Stunden)</li>
          </ul>
          <p>
            <strong>Datenschutzerklärung:</strong>{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              https://policies.google.com/privacy
            </a>
          </p>
          <p>
            <strong>Opt-Out:</strong> Sie können die Speicherung von Cookies durch Google Analytics verhindern, 
            indem Sie das Browser-Add-on zur Deaktivierung von Google Analytics installieren:{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              https://tools.google.com/dlpage/gaoptout
            </a>
          </p>

          <h3>Fathom Analytics</h3>
          <p>
            Fathom Analytics ist ein datenschutzfreundlicher Analysedienst, der keine Cookies verwendet 
            und keine personenbezogenen Daten erfasst. Fathom speichert ausschließlich anonymisierte 
            Statistiken über Seitenaufrufe.
          </p>
          <p><strong>Anbieter:</strong> Conva Ventures Inc., Kanada</p>
          <p><strong>Cookies:</strong> Keine</p>
          <p>
            <strong>Datenschutzerklärung:</strong>{' '}
            <a href="https://usefathom.com/privacy" target="_blank" rel="noopener noreferrer">
              https://usefathom.com/privacy
            </a>
          </p>

          <h3>PostHog Analytics</h3>
          <p>
            PostHog ist eine Open-Source-Analyseplattform, die uns hilft, das Nutzerverhalten auf 
            unserer Website zu verstehen. PostHog kann Cookies setzen, um Sitzungen und Benutzeraktionen 
            zu verfolgen.
          </p>
          <p><strong>Anbieter:</strong> PostHog Inc., USA</p>
          <p><strong>Gesetzte Cookies:</strong></p>
          <ul>
            <li><strong>ph_phc_[project-id]_posthog:</strong> Tracking-Cookie für Sitzungen und Events (Speicherdauer: 365 Tage)</li>
          </ul>
          <p>
            <strong>Datenschutzerklärung:</strong>{' '}
            <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">
              https://posthog.com/privacy
            </a>
          </p>

          <h3>Vercel Analytics</h3>
          <p>
            Vercel Analytics ist ein datenschutzfreundlicher Analysedienst, der ausschließlich 
            aggregierte Daten erfasst. Es werden keine personenbezogenen Daten gespeichert oder 
            Cookies gesetzt, die einzelne Nutzer identifizieren können.
          </p>
          <p><strong>Anbieter:</strong> Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
          <p><strong>Cookies:</strong> Minimale, anonymisierte Tracking-Daten</p>
          <p>
            <strong>Datenschutzerklärung:</strong>{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
              https://vercel.com/legal/privacy-policy
            </a>
          </p>

          <h2>Wie können Sie Cookies verwalten?</h2>
          
          <h3>Browser-Einstellungen</h3>
          <p>
            Die meisten Webbrowser akzeptieren Cookies automatisch. Sie können Ihren Browser jedoch 
            so einstellen, dass er Cookies ablehnt oder Sie benachrichtigt, wenn Cookies gesendet werden. 
            Bitte beachten Sie, dass einige Funktionen der Website möglicherweise nicht ordnungsgemäß 
            funktionieren, wenn Sie Cookies deaktivieren.
          </p>

          <h3>Cookie-Verwaltung in gängigen Browsern:</h3>
          <ul>
            <li>
              <strong>Google Chrome:</strong>{' '}
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                Cookie-Einstellungen in Chrome
              </a>
            </li>
            <li>
              <strong>Mozilla Firefox:</strong>{' '}
              <a href="https://support.mozilla.org/de/kb/cookies-erlauben-und-ablehnen" target="_blank" rel="noopener noreferrer">
                Cookie-Einstellungen in Firefox
              </a>
            </li>
            <li>
              <strong>Safari:</strong>{' '}
              <a href="https://support.apple.com/de-de/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
                Cookie-Einstellungen in Safari
              </a>
            </li>
            <li>
              <strong>Microsoft Edge:</strong>{' '}
              <a href="https://support.microsoft.com/de-de/microsoft-edge/cookies-in-microsoft-edge-l%C3%B6schen-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
                Cookie-Einstellungen in Edge
              </a>
            </li>
          </ul>

          <h3>Cookies löschen</h3>
          <p>
            Sie können bereits gespeicherte Cookies jederzeit über Ihren Browser löschen. Die genaue 
            Vorgehensweise hängt von Ihrem Browser ab. Anleitungen finden Sie in den oben verlinkten 
            Browser-Hilfeseiten.
          </p>

          <h2>Datenübermittlung in Drittländer</h2>
          <p>
            Einige der von uns verwendeten Analyse-Tools (Google Analytics, PostHog, Vercel Analytics) 
            werden von Anbietern in den USA betrieben. Bei der Nutzung dieser Dienste können Daten in 
            die USA übertragen werden. Wir haben mit diesen Anbietern Standardvertragsklauseln 
            vereinbart, um ein angemessenes Datenschutzniveau zu gewährleisten.
          </p>

          <h2>Widerruf Ihrer Einwilligung</h2>
          <p>
            Sie können Ihre Einwilligung zur Verwendung von Cookies jederzeit widerrufen, indem Sie 
            Cookies in Ihren Browser-Einstellungen deaktivieren oder bereits gespeicherte Cookies löschen. 
            Bitte beachten Sie, dass dies die Funktionalität unserer Website einschränken kann.
          </p>

          <h2>Ihre Rechte</h2>
          <p>
            Im Zusammenhang mit der Verwendung von Cookies und der damit verbundenen Datenverarbeitung 
            haben Sie folgende Rechte:
          </p>
          <ul>
            <li>Recht auf Auskunft über die gespeicherten Daten</li>
            <li>Recht auf Berichtigung unrichtiger Daten</li>
            <li>Recht auf Löschung Ihrer Daten</li>
            <li>Recht auf Einschränkung der Verarbeitung</li>
            <li>Recht auf Datenübertragbarkeit</li>
            <li>Widerspruchsrecht gegen die Verarbeitung</li>
            <li>Recht auf Beschwerde bei einer Aufsichtsbehörde</li>
          </ul>

          <h2>Kontakt</h2>
          <p>
            Bei Fragen zu unserer Cookie-Richtlinie können Sie sich jederzeit an uns wenden:
          </p>
          <p>
            Hareesh Pallikara Bahuleyan<br />
            Nexus Media Labs<br />
            Salvador-Allende-Str. 78 D<br />
            12559 Berlin<br />
            Deutschland
          </p>
          <p>
            E-Mail: info[at]learngermangrammar.com<br />
            Telefon: 030 8145-1867
          </p>

          <h2>Änderungen dieser Cookie-Richtlinie</h2>
          <p>
            Wir behalten uns vor, diese Cookie-Richtlinie bei Bedarf zu aktualisieren, um 
            Änderungen in unseren Cookie-Praktiken oder rechtlichen Anforderungen widerzuspiegeln. 
            Die aktuelle Version ist immer auf dieser Seite verfügbar.
          </p>

          <p><em>Stand: März 2024</em></p>
        </div>
      </div>
    </>
  )
}
