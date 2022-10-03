const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fs = require("fs");
const http = require("http");

// swagger ui and swaggerJsDocs import
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const swaggerJsDoc = require("swagger-jsdoc");

// method public (get/post/...) and json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//override method (Post, put, patch)
app.use(methodOverride("_method"));
//cookieParser
app.use(cookieParser());
//session
app.set("trust proxy", 1); // trust first proxy
app.use(
	session({
		secret: "SECRET",
		resave: false,
		saveUninitialized: true,
		cookie: {},
	})
);

//use cors
app.use(cors());

// database
const db = require("./config/");
db.connect();

// express handlebars
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
Handlebars.registerHelper("json", function (content) {
	return JSON.stringify(content);
});
Handlebars.registerHelper("inc", function (value, options) {
	return parseInt(value) + 1;
});
app.engine(
	".hbs",
	exphbs({
		extname: ".hbs",
		helpers: {
			getCategoryAdded: (cateId, cateName, cateIdOfProduct) => {
				var output = "";
				if (cateId.toString() === cateIdOfProduct) {
					output = `<option value="${cateId}" selected>${cateName}</option>`;
				} else {
					output = `<option value="${cateId}">${cateName}</option>`;
				}
				return new Handlebars.SafeString(output);
			},
			getCategory: (cateId, cateName, cateIdOfProduct) => {
				console.log("...");
				if (cateId.toString() === cateIdOfProduct) {
					return new Handlebars.SafeString(`${cateName}`);
				}
			},

			formatCurrency: (price) => {
				return "$" + Number(price).toFixed(2);
			},

			setSubTotal: (quantity, price) => {
				return Number(quantity * price).toFixed(2);
			},

			getShoeName: (shoeIdOfOrderDetail, shoeId, shoeName) => {
				console.log("🚀 ~ file: app.js ~ line 84 ~ shoeId", shoeId);
				console.log(
					"🚀 ~ file: app.js ~ line 84 ~ shoeIdOfOrderDetail",
					shoeIdOfOrderDetail
				);
				var output = "";
				if (shoeId.toString() === shoeIdOfOrderDetail) {
					output = `<option value="${shoeId}" selected>${shoeName}</option>`;
				} else {
					output = `<option value="${shoeId}">${shoeName}</option>`;
				}
				return new Handlebars.SafeString(output);
			},
		},
	})
);
app.set("view engine", ".hbs");
app.set("views", "src/app/views");

// static route to public for user and admin
// app.use('/public', express.static('public'));
app.use(express.static(path.join(__dirname, "public")));

//Note: move it to json swagger config
// swaggerUi and swaggerJsDocs config
const options = {
	definition: {
		openapi: "3.0.0",
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "Bearer",
					bearerFormat: "JWT",
					in: "header",
				},
			},
			persistAuthorization: true,
		},
		info: {
			title: "Shoe Store API",
			version: "1.0.0",
			description: "A simple Express Library API",
			contact: {
				name: "Zion",
				email: "catle.pix@gmail.com",
			},
		},
		servers: [
			{
				url: "/api/v1",
			},
		],
	},
	apis: [
		path.join(__dirname, "app/controllers/*.js"),
		path.join(__dirname, "app/models/*.js"),
		path.join(__dirname, "app/middlewares/*.js"),
	],
};
const specs = swaggerJsDoc(options);
app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(specs, { explorer: true })
);

app.use("/swagger.json", (req, res) => {
	res.setHeader("Content-Type", "application/json");
	res.send(specs);
});

// router
const route = require("./routes/index.route");
route(app);

// configure ssl server
// const sslServer = https.createServer(
// 	{
// 		key: fs.readFileSync("key.pem"),
// 		cert: fs.readFileSync("cert.pem"),
// 		// ca: fs.readFileSync(path.join(__dirname, "cert", "csr.pem")),
// 	},
// 	app
// );

const PORT = 3010;
http
	.createServer(app)
	.listen(PORT, () => console.log(`Secure server has started on port ${PORT}`));
