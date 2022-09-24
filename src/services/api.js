import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/briefing-seo-api/public/api/"
});


export const createPdf = async (data) => {
  const token = localStorage.getItem("token");
  const response = await api.post('briefing/post',data,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type' : 'application/json;charset=utf-8'
    }
  });

 return response;
    
};




export default api;
