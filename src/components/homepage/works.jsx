import React from "react";
import { faBriefcase } from "@fortawesome/free-solid-svg-icons";

import Card from "../common/card";

import "./styles/works.css";

const Works = () => {
	return (
		<div className="works">
			<Card
				icon={faBriefcase}
				title="Internship Experience"
				body={
					<div className="works-body">
						<div className="work">
							<img
								src="https://media.licdn.com/dms/image/D4D0BAQHaG2-GtiAM4g/company-logo_200_200/0/1706876740594/bluemango_labs_logo?e=1718236800&v=beta&t=3G-jmmQ3kvb-fbL4XW-6CK2AsasBLy-9CpBRDJDFf7Q"
								alt="facebook"
								className="work-image"
							/>
							<div className="work-title">Blue Mango Labs</div>
							<div className="work-subtitle">
								Flutter Developer Intern
							</div>
							<div className="work-duration">2024 - Present</div>
						</div>
					</div>
				}
			/>
		</div>
	);
};

export default Works;
