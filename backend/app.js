import app from "./src/server.js";
import config from "./config/index.js";

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}....`);
});