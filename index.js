require("dotenv").config();
const connectDb = require("./utils/db");
const app = require("./app.js");

const PORT = process.env.PORT;

connectDb()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error", error);
      throw error;
    });
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => console.log("MongoDB connection failed!", error));
