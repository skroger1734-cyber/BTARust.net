export default function NotFound() {
  return <main className="container section" style={{minHeight:"70vh"}}>
    <p className="eyebrow">404</p><h1 className="h1">That page was raided.</h1>
    <p className="muted">The link may be outdated or the page may have moved.</p>
    <a className="btn" href="/"><span className="btnText">Return home</span></a>
  </main>;
}
