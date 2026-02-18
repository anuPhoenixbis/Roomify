import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    // defining a route at visualizer/:id; a dynamic route using the file mentioned
    route('visualizer/:id','./routes/visualizer.$id.tsx')
] satisfies RouteConfig;
