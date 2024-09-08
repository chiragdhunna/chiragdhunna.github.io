import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import uberEatsClone from "../../Assets/Projects/uberEatsClone.png";
import musicMix from "../../Assets/Projects/musicMix.jpeg";

function Projects() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Works </strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are a few projects I've worked on recently.
        </p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={uberEatsClone}
              isBlog={false}
              title="Uber Eats Clone"
              description="Experience a seamless food ordering process with this React Native app clone of Uber Eats. Powered by Firebase, Yelp API, Places API, Redux, and Google Autocomplete, it offers real-time tracking, customizable filters, secure authentication, and smooth payments. Perfect for building your own food delivery app! 🍔🚀💻"
              ghLink="https://github.com/chiragdhunna/Uber_Eats_Clone"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath="https://camo.githubusercontent.com/62bba5f446828cc3ac1062013850ff0acc778d3efda69c6a1205d67eba127177/68747470733a2f2f736f6369616c6966792e6769742e63692f6368697261676468756e6e612f417374726f6c6f67792d4170702f696d6167653f6465736372697074696f6e3d3126666f6e743d536f75726365253230436f646525323050726f26666f726b733d31266973737565733d31266c616e67756167653d31266e616d653d31266f776e65723d31267061747465726e3d536f6c69642670756c6c733d31267374617267617a6572733d31267468656d653d4175746f"
              isBlog={false}
              title="Astrology Application"
              description="This project is built with Flutter, Node.js, Express, and MongoDB. The aim is to provide an astrology platform featuring OTP authentication, real-time chat using sockets, and user/astrologer data storage."
              ghLink="https://github.com/chiragdhunna/Astrology-App"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={musicMix}
              isBlog={false}
              title="Music Mix"
              description="Music Mix is a versatile and feature-rich music player app designed exclusively for Android devices. Developed using Java and the Android SDK, this app provides a delightful music listening experience, allowing users to import and play their favorite .mp3 files directly from their device's storage."
              ghLink="https://github.com/chiragdhunna/Music_Mix"     
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath="https://camo.githubusercontent.com/7e643e2ced9700ed856b0e69a4c8b5f46de8f36818953304cebc82a40c71ebbf/68747470733a2f2f736f6369616c6966792e6769742e63692f6368697261676468756e6e612f4750542d4a722f696d6167653f6465736372697074696f6e3d3126666f6e743d536f75726365253230436f646525323050726f26666f726b733d31266973737565733d31266c616e67756167653d31266e616d653d31266f776e65723d31267061747465726e3d536f6c69642670756c6c733d31267374617267617a6572733d31267468656d653d4175746f"
              isBlog={false}
              title="GPT Jr"
              description="This Flutter application combines the power of conversational AI and image generation, offering a seamless and interactive user experience. Users can interact with the app through voice commands, which are converted to text using the Flutter Speech to Text plugin. The app then utilizes the ChatGPT API to provide natural language responses, making it an ideal tool for information retrieval and conversation. Additionally, users can instruct the application to create images using the DALL·E API, adding a visually engaging dimension to the app."
              ghLink="https://github.com/chiragdhunna/GPT-Jr"
            />
          </Col>

        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
