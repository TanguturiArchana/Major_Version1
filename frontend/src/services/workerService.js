import axios from "axios";
import { API_BASE_URL } from "../config/environment";

export const workerService = {
  // Get all workers
  getAllWorkers: async () => {
    const res = await axios.get(`${API_BASE_URL}/users`);
    return res.data;
  },

  // Get worker by ID
  getWorkerById: async (id) => {
    const res = await axios.get(`${API_BASE_URL}/users/${id}`);
    return res.data;
  },
};
