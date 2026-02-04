import React, { useState } from "react";
import { Container, Row, Col, ButtonGroup, Button } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import uberEatsClone from "../../Assets/Projects/uberEatsClone.png";
import musicMix from "../../Assets/Projects/musicMix.jpeg";
import bookingCalendar from "../../Assets/Projects/booking_calendar_logo.png";
import astrologyAppLogo from "../../Assets/Projects/astrology-app-logo.webp";
import chatGoLogo from "../../Assets/Projects/chat_go_logo.jpeg";
import chatGoBackend from "../../Assets/chatgo backend.png";
import montraBackend from "../../Assets/montra backend.png";
import montraLogo from "../../Assets/montra logo.png";
import gptJrLogo from "../../Assets/Projects/gptJr.png";

const projects = [
  {
    categories: ["Web", "Full Stack"],
    imgPath: chatGoLogo,
    title: "Chat Go",
    description:
      "Chat GO is a modern and feature-rich real-time chat application built with React Vite and Node.js.",
    ghLink: "https://github.com/chiragdhunna/chat_go",
    demoLink: "https://chatgo.chiragdhunna.com/",
  },
  {
    categories: ["Backend"],
    imgPath: chatGoBackend,
    title: "Chat Go Backend",
    description:
      "Chat GO Backend is a real-time messaging API using Node.js, supporting authentication, WebSocket messaging, and media uploads.",
    ghLink: "https://github.com/chiragdhunna/chat_go_backend",
    demoLink: "https://chat-go-backend.onrender.com/api/v1/docs/",
  },
  {
    categories: ["Mobile"],
    imgPath: bookingCalendar,
    title: "Booking Calendar",
    description:
      "The Booking Calendar is a versatile and customizable online booking solution built for Flutter apps.",
    ghLink: "https://github.com/radikris/booking_calendar",
    demoLink: "https://pub.dev/packages/booking_calendar",
  },
  {
    categories: ["Mobile", "Full Stack"],
    imgPath: montraLogo,
    title: "Montra",
    description:
      "Montra is a smart financial manager app built with Flutter, helping users track expenses, income, budgets, and financial goals with an intuitive UI and interactive charts.",
    ghLink: "https://github.com/chiragdhunna/montra",
    demoLink: "https://github.com/chiragdhunna/montra/releases/",
  },
  {
    categories: ["Backend"],
    imgPath: montraBackend,
    title: "Montra Backend",
    description:
      "Montra Backend is a powerful financial management API built with Node.js and PostgreSQL, supporting secure authentication, transaction tracking, budgeting, and data exports..",
    ghLink: "https://github.com/chiragdhunna/montra_backend",
    demoLink: "https://montra-backend-b45c.onrender.com/api/v1/docs/s",
  },
  {
    categories: ["Mobile"],
    imgPath: uberEatsClone,
    title: "Uber Eats Clone",
    description:
      "The Uber Eats clone is a robust food delivery app built with React Native.",
    ghLink: "https://github.com/chiragdhunna/Uber_Eats_Clone",
    demoLink: "https://github.com/chiragdhunna/uber_eats_clone/releases/",
  },
  {
    categories: ["Mobile"],
    imgPath: musicMix,
    title: "Music Mix",
    description:
      "Music Mix is a dynamic and feature-rich music player app crafted for Android devices.",
    ghLink: "https://github.com/chiragdhunna/Music_Mix",
  },
  {
    categories: ["Mobile"],
    imgPath: gptJrLogo,
    title: "GPT Jr",
    description:
      "GPT Jr is a Flutter app integrating ChatGPT and DALL·E APIs, enabling voice-based conversations and AI-generated images for an interactive experience.",
    ghLink: "https://github.com/chiragdhunna/GPT-Jr",
    demoLink: "https://github.com/chiragdhunna/gpt_jr/releases/",
  },
];

const categories = ["All", "Web", "Mobile", "Full Stack", "Backend"];

function Projects() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((project) =>
          project.categories.includes(selectedCategory),
        );

  return (
    <Container fluid className="project-section" style={{ minHeight: "100vh" }}>
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Works </strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are a few projects I've worked on recently.
        </p>
        <ButtonGroup
          className="category-buttons"
          style={{ marginBottom: "20px" }}
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "primary" : "light"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </ButtonGroup>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <Col md={4} className="project-card" key={index}>
                <ProjectCard
                  imgPath={project.imgPath}
                  isBlog={false}
                  title={project.title}
                  description={project.description}
                  ghLink={project.ghLink}
                  demoLink={project.demoLink}
                />
              </Col>
            ))
          ) : (
            <p style={{ color: "white", textAlign: "center" }}>
              No Project Available
            </p>
          )}
        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
