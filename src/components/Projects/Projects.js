import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import uberEatsClone from "../../Assets/Projects/uberEatsClone.png";
import musicMix from "../../Assets/Projects/musicMix.jpeg";
import bookingCalendar from "../../Assets/Projects/booking_calendar_logo.png";

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
              imgPath={bookingCalendar}
              isBlog={false}
              title="Booking Calendar"
              description="The Booking Calendar is a versatile and customizable online booking solution built for Flutter apps. Utilizing Firebase for real-time data management, it enables users to track bookings effortlessly while managing conflicts through color coding. Perfect for services like events and sports, this tool enhances the booking experience seamlessly."
              ghLink="https://github.com/radikris/booking_calendar"    
              demoLink="https://pub.dev/packages/booking_calendar" 
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath="https://camo.githubusercontent.com/62bba5f446828cc3ac1062013850ff0acc778d3efda69c6a1205d67eba127177/68747470733a2f2f736f6369616c6966792e6769742e63692f6368697261676468756e6e612f417374726f6c6f67792d4170702f696d6167653f6465736372697074696f6e3d3126666f6e743d536f75726365253230436f646525323050726f26666f726b733d31266973737565733d31266c616e67756167653d31266e616d653d31266f776e65723d31267061747465726e3d536f6c69642670756c6c733d31267374617267617a6572733d31267468656d653d4175746f"
              isBlog={false}
              title="Astrology Application"
              description="This project utilizes Flutter, Node.js, Express, and MongoDB to create an astrology platform. Featuring OTP authentication, real-time chat via sockets, and secure user/astrologer data storage, it aims to deliver a comprehensive astrology experience."
              ghLink="https://github.com/chiragdhunna/Astrology-App"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath="https://camo.githubusercontent.com/7e643e2ced9700ed856b0e69a4c8b5f46de8f36818953304cebc82a40c71ebbf/68747470733a2f2f736f6369616c6966792e6769742e63692f6368697261676468756e6e612f4750542d4a722f696d6167653f6465736372697074696f6e3d3126666f6e743d536f75726365253230436f646525323050726f26666f726b733d31266973737565733d31266c616e67756167653d31266e616d653d31266f776e65723d31267061747465726e3d536f6c69642670756c6c733d31267374617267617a6572733d31267468656d653d4175746f"
              isBlog={false}
              title="GPT Jr"
              description="This Flutter app merges conversational AI with image generation for an engaging user experience. Users can engage with the app via voice commands, converted to text using the Speech to Text plugin. It then employs the ChatGPT API for natural responses, perfect for retrieving information. Users can also create images using the DALL·E API, enhancing the app's visual appeal."
              ghLink="https://github.com/chiragdhunna/GPT-Jr"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={uberEatsClone}
              isBlog={false}
              title="Uber Eats Clone"
              description="The Uber Eats clone is a robust food delivery app built with React Native. Utilizing Firebase, Yelp API, and Google Autocomplete, it provides real-time order tracking, customizable filters, secure authentication, and seamless payment processing. Ideal for launching your own food delivery platform!"
              ghLink="https://github.com/chiragdhunna/Uber_Eats_Clone"
            />
          </Col>

          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={musicMix}
              isBlog={false}
              title="Music Mix"
              description="Music Mix is a dynamic and feature-rich music player app crafted exclusively for Android devices. Developed with Java and the Android SDK, it offers an enjoyable music listening experience, allowing users to import and play their favorite .mp3 files from their device's storage."
              ghLink="https://github.com/chiragdhunna/Music_Mix"     
            />
          </Col>

        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
