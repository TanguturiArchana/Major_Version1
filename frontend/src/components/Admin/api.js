import axios from "axios";

const API = axios.create({
  baseURL: "https://shramsaathibackend.onrender.com/api/auth", 
});

export default API;
