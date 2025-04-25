import App from "./app";
import { port } from "./config";
// import cookiesParse from "cookie-parser";

const app = new App();
console.log("redis: ", process.env.REDIS_URL);
app.listen({
  topMiddleware: [
    // cookiesParse(),
    // express.json(),
    // fileUpload(),
    // express.urlencoded({ extended: false }),
    // new TopMiddleware().cacheClear,
    // new TopMiddleware().allowCrossDomain,
  ],
  bottomMiddleware: [
    // new BottomMiddleware().routeNotFoundErrorHandler,
    // new BottomMiddleware().fromRouteErrorHandler,
  ],
  port,
});
