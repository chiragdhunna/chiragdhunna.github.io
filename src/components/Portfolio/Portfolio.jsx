import React, { useEffect, useMemo, useRef, useState } from "react";
import Particle from "../Particle";
import "./Portfolio.css";
import {
  AiFillGithub,
  AiFillInstagram,
  AiOutlineTwitter,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";

const FILTERS = ["All", "Web", "Mobile", "Full Stack", "Backend"];

const techFrameworks = [
  "C++",
  "Python",
  "JavaScript",
  "Java",
  "Dart",
  "React",
  "Spring Boot",
  "Node.js",
  "Express.js",
  "Flutter",
];

const techTools = [
  "AWS",
  "Azure",
  "Git",
  "GitHub",
  "GitHub Actions",
  "CI/CD",
  "Fastlane",
  "LiveKit",
  "Postman",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "Firebase",
  "SQLite",
  "Android Studio",
  "Xcode",
];

const typewriterStrings = [
  "Full-Stack Software Engineer",
  "AI / LLM Integrator",
  "Flutter Developer",
  "React + Spring Boot Builder",
  "Cloud & CI/CD Engineer",
  "Mobile App Developer",
];

const contributorColors = [
  "var(--text-3)",
  "#6b21a8",
  "#7e22ce",
  "#9b5de5",
  "#c084fc",
];

const FALLBACK_PROJECTS = [
  {
    slug: "chat-go",
    categories: ["Web", "Full Stack"],
    imageUrl: "/assets/projects/chat-go-logo.jpeg",
    name: "Chat Go",
    description:
      "Chat GO is a modern and feature-rich real-time chat application built with React Vite and Node.js.",
    ghLink: "https://github.com/chiragdhunna/chat_go",
    demoLink: "https://chatgo.chiragdhunna.com/",
  },
  {
    slug: "chat-go-backend",
    categories: ["Backend"],
    imageUrl: "/assets/projects/chat-go-backend.png",
    name: "Chat Go Backend",
    description:
      "Chat GO Backend is a real-time messaging API using Node.js, supporting authentication, WebSocket messaging, and media uploads.",
    ghLink: "https://github.com/chiragdhunna/chat_go_backend",
    demoLink: "https://chat-go-backend.onrender.com/api/v1/docs/",
  },
  {
    slug: "booking-calendar",
    categories: ["Mobile"],
    imageUrl: "/assets/projects/booking-calendar.png",
    name: "Booking Calendar",
    description:
      "The Booking Calendar is a versatile and customizable online booking solution built for Flutter apps.",
    ghLink: "https://github.com/radikris/booking_calendar",
    demoLink: "https://pub.dev/packages/booking_calendar",
  },
  {
    slug: "montra",
    categories: ["Mobile", "Full Stack"],
    imageUrl: "/assets/projects/montra.png",
    name: "Montra",
    description:
      "Montra is a smart financial manager app built with Flutter, helping users track expenses, income, budgets, and financial goals with an intuitive UI and interactive charts.",
    ghLink: "https://github.com/chiragdhunna/montra",
    demoLink: "https://github.com/chiragdhunna/montra/releases/",
  },
  {
    slug: "montra-backend",
    categories: ["Backend"],
    imageUrl: "/assets/projects/montra-backend.png",
    name: "Montra Backend",
    description:
      "Montra Backend is a powerful financial management API built with Node.js and PostgreSQL, supporting secure authentication, transaction tracking, budgeting, and data exports.",
    ghLink: "https://github.com/chiragdhunna/montra_backend",
    demoLink: "https://montra-backend-b45c.onrender.com/api/v1/docs/s",
  },
  {
    slug: "uber-eats-clone",
    categories: ["Mobile"],
    imageUrl: "/assets/projects/uber-eats-clone.png",
    name: "Uber Eats Clone",
    description:
      "The Uber Eats clone is a robust food delivery app built with React Native.",
    ghLink: "https://github.com/chiragdhunna/Uber_Eats_Clone",
    demoLink: "https://github.com/chiragdhunna/uber_eats_clone/releases/",
  },
  {
    slug: "music-mix",
    categories: ["Mobile"],
    imageUrl: "/assets/projects/music-mix.jpeg",
    name: "Music Mix",
    description:
      "Music Mix is a dynamic and feature-rich music player app crafted for Android devices.",
    ghLink: "https://github.com/chiragdhunna/Music_Mix",
    demoLink: null,
  },
  {
    slug: "gpt-jr",
    categories: ["Mobile"],
    imageUrl: "/assets/projects/gpt-jr.png",
    name: "GPT Jr",
    description:
      "GPT Jr is a Flutter app integrating ChatGPT and DALL·E APIs, enabling voice-based conversations and AI-generated images for an interactive experience.",
    ghLink: "https://github.com/chiragdhunna/GPT-Jr",
    demoLink: "https://github.com/chiragdhunna/gpt_jr/releases/",
  },
  {
    slug: "linkedin-post-generator",
    categories: ["Web", "Backend"],
    imageUrl: "/assets/projects/linkedin-post-generator.png",
    name: "LinkedIn Post Generator",
    description:
      "Automates daily LinkedIn posts using Ollama for content generation and GitHub Actions for scheduling, publishing, and archiving.",
    ghLink: "https://github.com/chiragdhunna/linkedin_post_generator",
    demoLink: null,
  },
  {
    slug: "portfolio-admin-panel",
    categories: ["Web", "Full Stack"],
    imageUrl: "/assets/projects/portfolio-admin-panel.png",
    name: "Portfolio Admin Panel!!",
    description:
      "A private CMS dashboard for managing portfolio projects and certifications directly from the codebase.",
    ghLink: "https://github.com/chiragdhunna/chiragdhunna.github.io",
    demoLink: "https://chiragdhunna.github.io/admin",
  },
];

const projectsDataUrl = `${import.meta.env.BASE_URL}data/projects.json`;
const certsDataUrl = `${import.meta.env.BASE_URL}data/certs.json`;

function Portfolio() {
  const pageRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [typewriterText, setTypewriterText] = useState("");
  const [activeSection, setActiveSection] = useState("hero");
  const [contributions, setContributions] = useState([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [projectsResponse, certsResponse] = await Promise.all([
          fetch(projectsDataUrl),
          fetch(certsDataUrl),
        ]);

        const projectData = projectsResponse.ok
          ? await projectsResponse.json()
          : FALLBACK_PROJECTS;
        const certData = certsResponse.ok ? await certsResponse.json() : [];

        if (!cancelled) {
          setProjects(
            Array.isArray(projectData) ? projectData : FALLBACK_PROJECTS,
          );
          setCerts(Array.isArray(certData) ? certData : []);
        }
      } catch {
        if (!cancelled) {
          setProjects(FALLBACK_PROJECTS);
          setCerts([]);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadContributions() {
      try {
        const response = await fetch(
          "https://github-contributions-api.jogruber.de/v4/chiragdhunna?y=last",
        );
        if (!response.ok) throw new Error("Contribution fetch failed");
        const data = await response.json();
        const list = Array.isArray(data.contributions)
          ? data.contributions
          : [];

        if (!cancelled) {
          setContributions(list.slice(-364));
        }
      } catch {
        if (!cancelled) {
          setContributions([]);
        }
      }
    }

    loadContributions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypewriterText(typewriterStrings[0]);
      return undefined;
    }

    let stringIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId;

    const tick = () => {
      const current = typewriterStrings[stringIndex];
      charIndex = deleting ? charIndex - 1 : charIndex + 1;
      setTypewriterText(current.slice(0, charIndex));

      let delay = deleting ? 40 : 80;

      if (!deleting && charIndex === current.length) {
        deleting = true;
        delay = 1800;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        stringIndex = (stringIndex + 1) % typewriterStrings.length;
        delay = 180;
      }

      timeoutId = window.setTimeout(tick, delay);
    };

    tick();

    return () => window.clearTimeout(timeoutId);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const sections = Array.from(root.querySelectorAll("section[id]"));

    if (prefersReducedMotion) {
      setActiveSection(sections[0]?.id || "hero");
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const nodes = Array.from(root.querySelectorAll("[data-reveal]"));

    if (prefersReducedMotion) {
      nodes.forEach((node) => node.classList.add("revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [prefersReducedMotion, projects, certs, contributions, selectedFilter]);

  const filterCounts = useMemo(() => {
    const counts = Object.fromEntries(FILTERS.map((filter) => [filter, 0]));

    projects.forEach((project) => {
      counts.All += 1;
      (project.categories || []).forEach((category) => {
        if (Object.prototype.hasOwnProperty.call(counts, category)) {
          counts[category] += 1;
        }
      });
    });

    return counts;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedFilter === "All") {
      return projects;
    }

    return projects.filter((project) =>
      Array.isArray(project.categories)
        ? project.categories.includes(selectedFilter)
        : false,
    );
  }, [projects, selectedFilter]);

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    const target = pageRef.current?.querySelector(`#${sectionId}`);

    if (target) {
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="portfolio-page" ref={pageRef}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav className="nav" aria-label="Main navigation">
        <span className="nav-logo" aria-label="Chirag Dhunna">
          CD_
        </span>
        <div className="nav-dots" aria-label="Section navigation">
          {[
            ["hero", "Hero section"],
            ["about", "About section"],
            ["stack", "Tech stack section"],
            ["projects", "Projects section"],
            ["certs", "Certifications section"],
            ["contact", "Contact section"],
          ].map(([sectionId, label]) => (
            <a
              key={sectionId}
              href={`#${sectionId}`}
              className={`dot ${activeSection === sectionId ? "active" : ""}`}
              aria-label={label}
              onClick={(event) => scrollToSection(event, sectionId)}
            />
          ))}
        </div>
        <a href="mailto:chiragdhunna2468@gmail.com" className="btn-hire">
          Hire Me ↗
        </a>
      </nav>

      <main id="main-content">
        <section id="hero" className="hero" aria-labelledby="hero-heading">
          <Particle />
          <div className="container hero-inner">
            <div className="hero-grid">
              <div className="hero-copy" data-reveal>
                <p className="eyebrow">Hi There 👋</p>
                <h1 id="hero-heading" className="hero-name">
                  I'm <span>CHIRAG DHUNNA</span>
                </h1>
                <p className="hero-subtitle">
                  Full-Stack Software Engineer with 1+ years of experience
                  building scalable cloud, mobile, and web products. I turn
                  complex requirements into reliable systems across AWS, Azure,
                  React, Spring Boot, Flutter, and AI-powered workflows.
                </p>
                <div className="hero-meta" aria-label="Career highlights">
                  <span className="tag">Full-Stack Software Engineer</span>
                  <span className="tag">TCS</span>
                  <span className="tag">Pune, India</span>
                  <span className="tag">RGPV CSE · 8.7/10</span>
                </div>
                <div className="hero-type" aria-live="polite">
                  <span className="accent">I build:</span>
                  <span>{typewriterText}</span>
                  <span className="sr-only">
                    Full-Stack Software Engineer, AI Application Developer,
                    Flutter Developer, React Developer, Spring Boot Developer,
                    Cloud Integrator
                  </span>
                </div>
                <div className="hero-actions">
                  <a
                    href="#projects"
                    className="btn btn-primary"
                    onClick={(event) => scrollToSection(event, "projects")}
                  >
                    View Projects
                  </a>
                  <a href="/resume/Chirag_Dhunna.pdf" className="btn" download>
                    Download Resume
                  </a>
                  <a href="mailto:chiragdhunna2468@gmail.com" className="btn">
                    Contact Me
                  </a>
                </div>
                <div className="social-links" aria-label="Social links">
                  <a
                    className="social-btn"
                    href="https://github.com/chiragdhunna"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                  >
                    <AiFillGithub />
                  </a>
                  <a
                    className="social-btn"
                    href="https://www.linkedin.com/in/chiragdhunna/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedinIn />
                  </a>
                  <a
                    className="social-btn"
                    href="https://x.com/ChiragDhunna"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter/X"
                  >
                    <AiOutlineTwitter />
                  </a>
                  <a
                    className="social-btn"
                    href="https://www.instagram.com/chiragdhunna/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                  >
                    <AiFillInstagram />
                  </a>
                </div>
                <div className="hero-badges" aria-label="Highlights">
                  <span className="tag">10,000+ concurrent users</span>
                  <span className="tag">99.9% uptime systems</span>
                  <span className="tag">50% faster releases</span>
                  <span className="tag">1,000+ live viewers</span>
                </div>
              </div>
              <div className="hero-card" data-reveal>
                <div className="hero-avatar-wrap">
                  <img
                    src="/assets/avatar.svg"
                    alt="Illustrated avatar of Chirag Dhunna"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" aria-labelledby="about-heading">
          <div className="container">
            <span className="section-label">02. About</span>
            <h2 id="about-heading" className="section-heading" data-reveal>
              Know Who I Am
            </h2>
            <p className="section-lead" data-reveal>
              Here's the short version: I am a full-stack software engineer at
              TCS with experience across AWS, Azure, React, Spring Boot,
              Flutter, and AI-integrated systems. I care about clean delivery,
              measurable results, and shipping work that scales without
              unnecessary complexity.
            </p>

            <div className="intro-grid" style={{ marginTop: "30px" }}>
              <div className="quote-card" data-reveal>
                <p>
                  Hi Everyone, I am <strong>Chirag Dhunna</strong> from{" "}
                  <strong>Pune, Maharashtra, India</strong>.
                  <br />
                  <br />
                  Currently working as a{" "}
                  <strong>
                    Full-Stack Software Engineer at Tata Consultancy Services
                  </strong>{" "}
                  , building enterprise conversational AI solutions across AWS
                  and Azure.
                  <br />
                  <br />
                  Previously worked as a{" "}
                  <strong>
                    Software Development Engineer at BlueMango Labs
                  </strong>{" "}
                  , where I automated Fastlane release pipelines, improved
                  LiveKit call reliability, and shipped Flutter products for
                  production users.
                  <br />
                  <br />
                  Completed{" "}
                  <strong>
                    Bachelor of Engineering in Computer Science at RGPV
                    University
                  </strong>{" "}
                  with a <strong>GPA of 8.7/10.0</strong>.
                  <br />
                  <br />
                  I enjoy work that blends product delivery, cloud systems, and
                  AI workflows.
                  <br />
                  <br />
                  Apart from coding:
                </p>
                <ul className="about-list">
                  <li>Playing Games</li>
                  <li>Stand Up Comedy</li>
                  <li>Travelling</li>
                </ul>
                <p className="signature">
                  "Do the thing which everyone thinks is not possible" — Chirag
                </p>
              </div>
              <div className="avatar-frame" data-reveal>
                <img
                  src="/assets/avatar.svg"
                  alt="Illustrated avatar portrait of Chirag Dhunna"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="stack" aria-labelledby="stack-heading">
          <div className="container">
            <span className="section-label">03. Tech Stack</span>
            <h2 id="stack-heading" className="section-heading" data-reveal>
              Languages, frameworks, and tools
            </h2>
            <p className="section-lead" data-reveal>
              My stack is centered on full-stack delivery, cloud systems, and
              product engineering with a bias toward practical automation and
              measurable outcomes.
            </p>

            <div className="stack-groups" style={{ marginTop: "30px" }}>
              <div className="stack-group" data-reveal>
                <h3>Languages & Frameworks</h3>
                <div className="chips">
                  {techFrameworks.map((item) => (
                    <span className="chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="stack-group" data-reveal>
                <h3>Cloud, DevOps & Other Tools</h3>
                <div className="chips">
                  {techTools.map((item) => (
                    <span className="chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="contrib-wrap" data-reveal>
              <div className="contrib-head">
                <div>
                  <span className="section-label" style={{ marginBottom: 8 }}>
                    GitHub Activity
                  </span>
                  <h3 className="mini-title">Days I Code</h3>
                </div>
                <p>Last year on GitHub</p>
              </div>
              <div className="contrib-scroll">
                <div
                  id="contrib-grid"
                  role="img"
                  aria-label="GitHub contribution calendar"
                >
                  {contributions.length > 0 ? (
                    contributions.map((day) => (
                      <div
                        key={day.date}
                        className="contrib-cell"
                        title={`${day.date}: ${day.count} contributions`}
                        style={{
                          backgroundColor:
                            contributorColors[day.level] ||
                            contributorColors[0],
                        }}
                      />
                    ))
                  ) : (
                    <div
                      className="empty-state"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      GitHub contribution activity is unavailable right now.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" aria-labelledby="projects-heading">
          <div className="container">
            <span className="section-label">04. Projects</span>
            <h2 id="projects-heading" className="section-heading" data-reveal>
              Selected work
            </h2>
            <p className="section-lead" data-reveal>
              The project feed reads from the same CMS data file the public site
              already uses, with an offline fallback.
            </p>

            <div
              className="filter-bar"
              role="group"
              aria-label="Filter projects by category"
            >
              {FILTERS.map((filter) => {
                const active = selectedFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    className={`filter-pill ${active ? "active" : ""}`}
                    onClick={() => setSelectedFilter(filter)}
                    aria-pressed={active}
                  >
                    <span>{filter}</span>
                    <span className="filter-count">
                      {filterCounts[filter] || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="projects-meta" aria-live="polite">
              Showing <strong>{filteredProjects.length}</strong>{" "}
              {filteredProjects.length === 1 ? "project" : "projects"}
              {selectedFilter !== "All" ? (
                <>
                  {" "}
                  in <strong>{selectedFilter}</strong>
                </>
              ) : null}
            </p>

            <div className="projects-grid">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <article
                    className="project-card reveal"
                    key={`${project.slug || project.name}-${index}`}
                    data-reveal
                  >
                    {project.imageUrl ? (
                      <img
                        className="project-image"
                        loading="lazy"
                        src={project.imageUrl}
                        alt={project.name}
                      />
                    ) : (
                      <div className="project-image empty-media">No image</div>
                    )}
                    <div className="card-body">
                      <h3 className="card-title">{project.name}</h3>
                      <p className="card-description">
                        {project.description || ""}
                      </p>
                      <div className="card-tags">
                        {(project.categories || []).map((tag) => (
                          <span className="card-tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="card-actions">
                        {project.ghLink ? (
                          <a
                            className="project-btn primary"
                            href={project.ghLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <i className="ti ti-brand-github" /> GitHub
                          </a>
                        ) : null}
                        {project.demoLink ? (
                          <a
                            className="project-btn"
                            href={project.demoLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <i className="ti ti-world" /> Demo
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  No projects available for this filter.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="certs" aria-labelledby="certs-heading">
          <div className="container">
            <span className="section-label">05. Certifications</span>
            <h2 id="certs-heading" className="section-heading" data-reveal>
              Certifications and credentials
            </h2>
            <p className="section-lead" data-reveal>
              This section is powered by the same cert JSON feed and degrades
              gracefully when it is empty.
            </p>
            <div className="cert-grid-wrap">
              {certs.length > 0 ? (
                certs.map((cert, index) => {
                  const issuedYear = cert.issueDate
                    ? new Date(cert.issueDate).getFullYear()
                    : "";

                  return (
                    <article
                      className="cert-card reveal"
                      key={cert.id || cert.slug || index}
                      data-reveal
                    >
                      {cert.imageUrl ? (
                        <img
                          className="cert-image"
                          loading="lazy"
                          src={cert.imageUrl}
                          alt={cert.name}
                        />
                      ) : (
                        <div className="cert-image empty-media">No image</div>
                      )}
                      <div className="card-body">
                        <h3 className="card-title">{cert.name}</h3>
                        <p className="card-subtitle">
                          {cert.issuer}
                          {issuedYear ? ` · ${issuedYear}` : ""}
                        </p>
                        <div className="card-actions">
                          {cert.pdfUrl ? (
                            <a
                              className="card-link primary"
                              href={cert.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <i className="ti ti-file-certificate" /> View
                              Certificate ↗
                            </a>
                          ) : null}
                          {cert.credentialUrl ? (
                            <a
                              className="card-link"
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <i className="ti ti-shield-check" /> Verify ↗
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="empty-state">No certifications yet.</div>
              )}
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="contact-section"
          aria-labelledby="contact-heading"
        >
          <div className="container">
            <span className="section-label">06. Contact</span>
            <h2 id="contact-heading" className="section-heading" data-reveal>
              Let's build something
            </h2>
            <p className="section-lead contact-copy" data-reveal>
              Feel free to connect. I keep the public site intentionally simple:
              fast to scan, direct to contact, and easy to trust.
            </p>

            <div className="contact-list" data-reveal>
              {[
                [
                  "GitHub",
                  "github.com/chiragdhunna",
                  "https://github.com/chiragdhunna",
                ],
                [
                  "LinkedIn",
                  "linkedin.com/in/chiragdhunna",
                  "https://www.linkedin.com/in/chiragdhunna/",
                ],
                [
                  "Twitter / X",
                  "x.com/ChiragDhunna",
                  "https://x.com/ChiragDhunna",
                ],
                [
                  "Instagram",
                  "instagram.com/chiragdhunna",
                  "https://www.instagram.com/chiragdhunna/",
                ],
              ].map(([label, text, href]) => (
                <a
                  className="contact-row"
                  href={href}
                  key={label}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>
                    <strong>{label}</strong>
                    <br />
                    <span>{text}</span>
                  </div>
                  <i className="ti ti-arrow-up-right" />
                </a>
              ))}
              <a
                className="contact-row"
                href="mailto:chiragdhunna2468@gmail.com"
              >
                <div>
                  <strong>Email</strong>
                  <br />
                  <span>chiragdhunna2468@gmail.com</span>
                </div>
                <i className="ti ti-mail" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="portfolio-footer">
        <div className="footer-inner">
          <p>Chirag Dhunna · Portfolio CMS v2 · Admin Panel</p>
          <a
            href="/admin"
            className="admin-footer-link"
            aria-label="Admin panel"
          >
            Admin Panel
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Portfolio;
