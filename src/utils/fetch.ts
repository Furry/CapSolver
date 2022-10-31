import nodeFetch from "node-fetch";
export default typeof window === "undefined" ? nodeFetch : window.fetch.bind(window);