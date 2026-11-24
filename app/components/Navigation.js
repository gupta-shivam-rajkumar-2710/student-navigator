"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

function CompassMark() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.6 6.1-5.8 2.3 2.5-5.8z"/></svg>;
}

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const home = pathname === "/";
  const section = (id) => home ? `#${id}` : `/#${id}`;
  const close = () => setMenuOpen(false);

  return <nav className="navbar">
    <a className="brand" href={section("home")} onClick={close}><span className="brand-mark"><CompassMark/></span><span>student<span className="brand-light">navigator</span></span></a>
    <div className={`nav-links ${menuOpen ? "mobile-open" : ""}`}>
      <a className={home ? "nav-active" : ""} href={section("home")} onClick={close}>Home</a>
      <a href={section("college-directory")} onClick={close}>Explore colleges</a>
      <a href={section("compare")} onClick={close}>Compare</a>
      <a href={section("rankings")} onClick={close}>Rankings</a>
      <a className={pathname === "/iit-placements" ? "nav-active" : ""} href="/iit-placements" onClick={close}>IIT placements</a>
      <a className={pathname === "/roi-calculator" ? "nav-active" : ""} href="/roi-calculator" onClick={close}>ROI Calculator</a>
      <a href={section("about")} onClick={close}>About</a>
    </div>
    <div className="nav-right"><a className="admin-link" href="/admin/login">Admin login</a><a className="nav-cta" href={section("college-directory")}>Explore colleges <span aria-hidden="true">→</span></a><button className="mobile-menu" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>{menuOpen ? "×" : "☰"}</button></div>
  </nav>;
}
