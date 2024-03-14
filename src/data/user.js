const INFO = {
	main: {
		title: "Chirag Dhunna Portfolio",
		name: "Chirag Dhunna",
		email: "chiragdhunna2468@gmail.com",
		logo: "../logo.png",
	},

	socials: {
		twitter: "https://twitter.com/ChiragDhunna",
		github: "https://github.com/chiragdhunna",
		linkedin: "https://www.linkedin.com/in/chirag-dhunna-0b0327202/",
		instagram: "https://instagram.com/chiragdhunna",
	},

	homepage: {
		title: "Full-stack web and mobile app developer, a enthusiast learner.",
		description:
			"I am a Fullstack developer with expertise Flutter, React, MySQl, Postgres and Node.js. I have experience in building scalable, secure and reliable web applications using various frameworks and technologies. I enjoy solving complex problems and learning new skills. I am passionate about creating high-quality code that follows best practices and industry standards. I am always looking for new challenges and opportunities to grow as a developer.",
	},

	about: {
		title: "I’m Chirag Dhunna. I am passionate mobile and web Developer.",
		description:
			"I've worked on a variety of projects over the years and I'm proud of the progress I've made. Many of these projects are open-source and available for others to explore and contribute to. If you're interested in any of the projects I've worked on, please feel free to check out the code and suggest any improvements or enhancements you might have in mind. Collaborating with others is a great way to learn and grow, and I'm always open to new ideas and feedback.",
	},

	articles: {
		title: "I'm passionate about pushing the boundaries of what's possible and inspiring the next generation of innovators.",
		description:
			"Chronological collection of my long-form thoughts on programming, leadership, product design, and more.",
	},

	projects: [
		{
			title: "GoFoods",
			description:
				" A full-stack web app revolutionizing food ordering with expansive selection, detailed insights, seamless cart management, and efficient ordering. Built with React, Node.js, Express, MongoDB, and Redux.",
			logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png",
			linkText: "View Project",
			link: "https://github.com/chiragdhunna/GoFood",
		},

		{
			title: "Uber Eats Clone",
			description:
				"Exciting Uber Eats Clone built with React Native, Firebase, Yelp API, Places API, Redux, and Google Autocomplete. Features easy ordering, real-time tracking, customizable filters, secure authentication, smooth payments, order history, and responsive design.",
			logo: "https://w7.pngwing.com/pngs/403/269/png-transparent-react-react-native-logos-brands-in-colors-icon-thumbnail.png",
			linkText: "View Project",
			link: "https://github.com/chiragdhunna/Uber_Eats_Clone",
		},

		{
			title: "Astrology Application",
			description:
				"Exciting Astrology Freelance Project with Flutter, Node.js, Express, MongoDB. Features secure authentication, real-time chat, MongoDB storage, Flutter frontend. Tech stack: Flutter, Node.js, MongoDB, sockets.",
			logo: "https://w7.pngwing.com/pngs/537/866/png-transparent-flutter-hd-logo.png",
			linkText: "View Project",
			link: "https://github.com/chiragdhunna/Astrology-App",
		},

		{
			title: "GPT Jr",
			description:
				"Flutter AI Assistant project integrates ChatGPT and DALL·E for voice interactions and image generation. Enhance user experience with natural language responses and on-the-fly image creation.",
			logo: "https://w7.pngwing.com/pngs/537/866/png-transparent-flutter-hd-logo.png",
			linkText: "View Project",
			link: "https://github.com/chiragdhunna/GPT-Jr",
		},

		{
			title: "Music MIX",
			description:
				"A feature-rich music player for Android. Seamlessly import, navigate, and enjoy .mp3 files with smooth playback and intuitive controls.",
			logo: "data:image/png;base64,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",
			linkText: "View Project",
			link: "https://github.com/chiragdhunna/Music_Mix",
		},
	],
};

export default INFO;
