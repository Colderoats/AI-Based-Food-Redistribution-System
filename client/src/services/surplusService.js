import api from "./api";
export const getSurplus = () => api.get("/surplus").then((response) => response.data);
export const createSurplus = (payload) => api.post("/surplus", payload).then((response) => response.data);
export const requestDonation = (surplus_id) => api.post("/donations/request", { surplus_id }).then((response) => response.data);
export const getDonations = () => api.get("/donations").then((response) => response.data);
export const approveDonation = (id) => api.put(`/donations/approve/${id}`).then((response) => response.data);
export const rejectDonation = (id) => api.put(`/donations/reject/${id}`).then((response) => response.data);
