import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8083/api/auth", 
});

export default API;
